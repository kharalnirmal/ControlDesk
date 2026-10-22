import { beforeEach, describe, expect, it, vi } from "vitest";
import { Prisma } from "@/generated/prisma/client";

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  updateMany: vi.fn(),
  findUnique: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/require-admin", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    product: {
      create: mocks.create,
      update: mocks.update,
      updateMany: mocks.updateMany,
      findUnique: mocks.findUnique,
    },
  },
}));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));

import {
  archiveProductAction,
  createProductAction,
  restoreProductAction,
  updateProductAction,
} from "./product.action";

const idle = { status: "idle" as const, message: "", errors: {} };
const lifecycleIdle = { status: "idle" as const, message: "" };

function productForm(overrides: Record<string, string> = {}) {
  const form = new FormData();
  const values = {
    sku: "mouse-001",
    name: "Wireless Mouse",
    description: "",
    price: "1250.00",
    stock: "20",
    categoryId: "category-1",
    imageUrl: "",
    ...overrides,
  };
  for (const [key, value] of Object.entries(values)) form.set(key, value);
  return form;
}

function prismaError(code: string) {
  return new Prisma.PrismaClientKnownRequestError("database error", {
    code,
    clientVersion: "test",
  });
}

describe("product actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAdmin.mockResolvedValue({ id: "admin" });
    mocks.create.mockResolvedValue({ id: "product-1" });
    mocks.update.mockResolvedValue({ id: "product-1" });
  });

  it("denies a direct unauthorized create before persistence", async () => {
    mocks.requireAdmin.mockRejectedValue(new Error("unauthorized"));
    await expect(createProductAction(idle, productForm())).rejects.toThrow(
      "unauthorized",
    );
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("creates a valid normalized product", async () => {
    const result = await createProductAction(idle, productForm());
    expect(result.status).toBe("success");
    expect(mocks.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ sku: "MOUSE-001", stock: 20 }),
      }),
    );
  });

  it("does not persist invalid input", async () => {
    const result = await createProductAction(idle, productForm({ stock: "-1" }));
    expect(result.status).toBe("error");
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("maps duplicate SKU and missing category errors safely", async () => {
    mocks.create.mockRejectedValueOnce(prismaError("P2002"));
    const duplicate = await createProductAction(idle, productForm());
    expect(duplicate.errors.sku).toBeDefined();

    mocks.create.mockRejectedValueOnce(prismaError("P2025"));
    const missingCategory = await createProductAction(idle, productForm());
    expect(missingCategory.errors.categoryId).toBeDefined();
  });

  it("updates valid fields and rejects invalid edits", async () => {
    const success = await updateProductAction(
      "product-1",
      idle,
      productForm({ name: "Updated Mouse" }),
    );
    expect(success.status).toBe("success");
    expect(mocks.update).toHaveBeenCalled();

    mocks.update.mockClear();
    const invalid = await updateProductAction(
      "product-1",
      idle,
      productForm({ price: "1.999" }),
    );
    expect(invalid.status).toBe("error");
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it("handles nonexistent and repeated archive predictably", async () => {
    mocks.updateMany.mockResolvedValue({ count: 0 });
    mocks.findUnique.mockResolvedValueOnce(null);
    expect(
      await archiveProductAction("missing", lifecycleIdle),
    ).toMatchObject({ status: "error", message: "Product not found." });

    mocks.findUnique.mockResolvedValueOnce({ archivedAt: new Date() });
    expect(
      await archiveProductAction("product-1", lifecycleIdle),
    ).toMatchObject({ status: "success", message: "Product is already archived." });

    mocks.findUnique.mockResolvedValueOnce({ archivedAt: null });
    expect(
      await restoreProductAction("product-1", lifecycleIdle),
    ).toMatchObject({ status: "success", message: "Product is already active." });
  });

  it("archives, restores and denies unauthorized lifecycle mutations", async () => {
    mocks.updateMany.mockResolvedValue({ count: 1 });
    expect((await archiveProductAction("product-1", lifecycleIdle)).status).toBe(
      "success",
    );
    expect((await restoreProductAction("product-1", lifecycleIdle)).status).toBe(
      "success",
    );

    mocks.requireAdmin.mockRejectedValue(new Error("unauthorized"));
    await expect(
      archiveProductAction("product-1", lifecycleIdle),
    ).rejects.toThrow("unauthorized");
  });
});
