import { beforeEach, describe, expect, it, vi } from "vitest";
import { Prisma } from "@/generated/prisma/client";

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  productCount: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/require-admin", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    category: {
      create: mocks.create,
      update: mocks.update,
      delete: mocks.remove,
    },
    product: { count: mocks.productCount },
  },
}));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));

import {
  createCategoryAction,
  deleteCategoryAction,
  renameCategoryAction,
} from "./category.action";

const idle = { status: "idle" as const, message: "", errors: {} };
const named = (name: string) => {
  const form = new FormData();
  form.set("name", name);
  return form;
};
const prismaError = (code: string) =>
  new Prisma.PrismaClientKnownRequestError("database error", {
    code,
    clientVersion: "test",
  });

describe("category actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAdmin.mockResolvedValue({ id: "admin" });
    mocks.create.mockResolvedValue({ id: "category-1" });
    mocks.update.mockResolvedValue({ id: "category-1" });
    mocks.remove.mockResolvedValue({ id: "category-1" });
    mocks.productCount.mockResolvedValue(0);
  });

  it("denies direct unauthorized mutations", async () => {
    mocks.requireAdmin.mockRejectedValue(new Error("unauthorized"));
    await expect(createCategoryAction(idle, named("Office"))).rejects.toThrow();
    await expect(
      renameCategoryAction("category-1", idle, named("Home")),
    ).rejects.toThrow();
    await expect(deleteCategoryAction("category-1", idle)).rejects.toThrow();
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("renames using normalized names and reports conflicts", async () => {
    const success = await renameCategoryAction(
      "category-1",
      idle,
      named("  HOME   OFFICE "),
    );
    expect(success.status).toBe("success");
    expect(mocks.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { name: "home office" } }),
    );

    mocks.update.mockRejectedValueOnce(prismaError("P2002"));
    const conflict = await renameCategoryAction(
      "category-1",
      idle,
      named("Existing"),
    );
    expect(conflict.message).toBe("Category already exists.");
  });

  it("reports duplicate normalized category creation", async () => {
    mocks.create.mockRejectedValueOnce(prismaError("P2002"));
    const result = await createCategoryAction(idle, named(" Existing "));
    expect(result.message).toBe("Category already exists.");
    expect(result.errors.name).toBeDefined();
  });

  it("deletes unused categories", async () => {
    expect((await deleteCategoryAction("category-1", idle)).status).toBe(
      "success",
    );
    expect(mocks.remove).toHaveBeenCalled();
  });

  it("rejects deletion when products exist or an FK race occurs", async () => {
    mocks.productCount.mockResolvedValueOnce(2);
    const linked = await deleteCategoryAction("category-1", idle);
    expect(linked.status).toBe("error");
    expect(mocks.remove).not.toHaveBeenCalled();

    mocks.productCount.mockResolvedValueOnce(0);
    mocks.remove.mockRejectedValueOnce(prismaError("P2003"));
    const raced = await deleteCategoryAction("category-1", idle);
    expect(raced.message).toContain("products use it");
  });
});
