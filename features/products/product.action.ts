"use server";

import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  createProductSchema,
  productIdSchema,
  updateProductSchema,
} from "./product.schema";

export type ProductField =
  | "sku"
  | "name"
  | "description"
  | "price"
  | "stock"
  | "categoryId"
  | "imageUrl";

export type ProductActionState = {
  status: "idle" | "success" | "error";
  message: string;
  errors: Partial<Record<ProductField, string[]>>;
};

export type ProductLifecycleState = {
  status: "idle" | "success" | "error";
  message: string;
};

function formInput(formData: FormData) {
  return {
    sku: formData.get("sku"),
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    price: formData.get("price"),
    stock: formData.get("stock"),
    categoryId: formData.get("categoryId"),
    imageUrl: formData.get("imageUrl") ?? "",
  };
}

function validationError(error: z.ZodError): ProductActionState {
  return {
    status: "error",
    message: "Please correct the highlighted fields.",
    errors: z.flattenError(error).fieldErrors,
  };
}

function databaseError(error: unknown, operation: "create" | "update") {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return {
        status: "error" as const,
        message: "A product with this SKU already exists.",
        errors: { sku: ["Choose a unique SKU."] },
      };
    }
    if (error.code === "P2025" || error.code === "P2003") {
      return {
        status: "error" as const,
        message: "The selected category or product is no longer available.",
        errors: { categoryId: ["Choose an existing category."] },
      };
    }
  }

  console.error(`Product ${operation} failed`, error);
  return {
    status: "error" as const,
    message: `Could not ${operation} the product. Please try again.`,
    errors: {},
  };
}

function revalidateCatalog(id?: string) {
  revalidatePath("/dashboard/products");
  revalidatePath("/dashboard/categories");
  revalidatePath("/dashboard");
  if (id) {
    revalidatePath(`/dashboard/products/${id}`);
    revalidatePath(`/dashboard/products/${id}/edit`);
  }
}

export async function createProductAction(
  _previousState: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  await requireAdmin();

  const result = createProductSchema.safeParse(formInput(formData));
  if (!result.success) return validationError(result.error);
  const data = result.data;

  try {
    await prisma.product.create({
      data: {
        sku: data.sku,
        name: data.name,
        description: data.description || null,
        price: data.price,
        stock: data.stock,
        imageUrl: data.imageUrl || null,
        category: { connect: { id: data.categoryId } },
      },
    });
  } catch (error) {
    return databaseError(error, "create");
  }

  revalidateCatalog();
  return {
    status: "success",
    message: "Product created successfully.",
    errors: {},
  };
}

export async function updateProductAction(
  id: string,
  _previousState: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  await requireAdmin();

  const parsedId = productIdSchema.safeParse(id);
  if (!parsedId.success) {
    return { status: "error", message: "Invalid product.", errors: {} };
  }

  const result = updateProductSchema.safeParse(formInput(formData));
  if (!result.success) return validationError(result.error);
  const data = result.data;

  try {
    await prisma.product.update({
      where: { id: parsedId.data },
      data: {
        sku: data.sku,
        name: data.name,
        description: data.description || null,
        price: data.price,
        stock: data.stock,
        imageUrl: data.imageUrl || null,
        category: { connect: { id: data.categoryId } },
      },
    });
  } catch (error) {
    return databaseError(error, "update");
  }

  revalidateCatalog(parsedId.data);
  return {
    status: "success",
    message: "Product updated successfully.",
    errors: {},
  };
}

async function setArchivedState(
  id: string,
  archived: boolean,
): Promise<ProductLifecycleState> {
  await requireAdmin();

  const parsedId = productIdSchema.safeParse(id);
  if (!parsedId.success) {
    return { status: "error", message: "Invalid product." };
  }

  try {
    const result = await prisma.product.updateMany({
      where: {
        id: parsedId.data,
        archivedAt: archived ? null : { not: null },
      },
      data: { archivedAt: archived ? new Date() : null },
    });

    if (result.count === 0) {
      const existing = await prisma.product.findUnique({
        where: { id: parsedId.data },
        select: { archivedAt: true },
      });
      if (!existing) {
        return { status: "error", message: "Product not found." };
      }
      return {
        status: "success",
        message: archived
          ? "Product is already archived."
          : "Product is already active.",
      };
    }
  } catch (error) {
    console.error("Product lifecycle update failed", error);
    return {
      status: "error",
      message: "Could not update the product status. Please try again.",
    };
  }

  revalidateCatalog(parsedId.data);
  return {
    status: "success",
    message: archived ? "Product archived." : "Product restored.",
  };
}

export async function archiveProductAction(
  id: string,
  _previousState: ProductLifecycleState,
) {
  void _previousState;
  return setArchivedState(id, true);
}

export async function restoreProductAction(
  id: string,
  _previousState: ProductLifecycleState,
) {
  void _previousState;
  return setArchivedState(id, false);
}
