"use server";

import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { revalidatePath } from "next/cache";
import {
  categoryIdSchema,
  createCategorySchema,
  renameCategorySchema,
} from "./category.schema";

export type CategoryActionState = {
  status: "idle" | "success" | "error";
  message: string;
  errors: { name?: string[] };
};

function revalidateCatalog() {
  revalidatePath("/dashboard/categories");
  revalidatePath("/dashboard/products");
  revalidatePath("/dashboard");
}

function categoryDatabaseError(error: unknown): CategoryActionState {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    return {
      status: "error",
      message: "Category already exists.",
      errors: { name: ["Choose a different category name."] },
    };
  }

  console.error("Category mutation failed", error);
  return {
    status: "error",
    message: "Could not save the category. Please try again.",
    errors: {},
  };
}

export async function createCategoryAction(
  _prevState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  await requireAdmin();
  const result = createCategorySchema.safeParse({ name: formData.get("name") });

  if (!result.success) {
    return {
      status: "error",
      message: "Please correct the form.",
      errors: { name: result.error.flatten().fieldErrors.name },
    };
  }

  try {
    await prisma.category.create({ data: result.data });
  } catch (error) {
    return categoryDatabaseError(error);
  }

  revalidateCatalog();
  return {
    status: "success",
    message: "Category created successfully.",
    errors: {},
  };
}

export async function renameCategoryAction(
  id: string,
  _prevState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  await requireAdmin();
  const result = renameCategorySchema.safeParse({
    id,
    name: formData.get("name"),
  });

  if (!result.success) {
    return {
      status: "error",
      message: "Please correct the category name.",
      errors: { name: result.error.flatten().fieldErrors.name },
    };
  }

  try {
    await prisma.category.update({
      where: { id: result.data.id },
      data: { name: result.data.name },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return { status: "error", message: "Category not found.", errors: {} };
    }
    return categoryDatabaseError(error);
  }

  revalidateCatalog();
  return { status: "success", message: "Category renamed.", errors: {} };
}

export async function deleteCategoryAction(
  id: string,
  _prevState: CategoryActionState,
): Promise<CategoryActionState> {
  void _prevState;
  await requireAdmin();
  const parsedId = categoryIdSchema.safeParse(id);
  if (!parsedId.success) {
    return { status: "error", message: "Invalid category.", errors: {} };
  }

  try {
    const productCount = await prisma.product.count({
      where: { categoryId: parsedId.data },
    });
    if (productCount > 0) {
      return {
        status: "error",
        message: "Reassign linked products before deleting this category.",
        errors: {},
      };
    }

    await prisma.category.delete({ where: { id: parsedId.data } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2003") {
        return {
          status: "error",
          message: "This category cannot be deleted because products use it.",
          errors: {},
        };
      }
      if (error.code === "P2025") {
        return { status: "error", message: "Category not found.", errors: {} };
      }
    }
    console.error("Category deletion failed", error);
    return {
      status: "error",
      message: "Could not delete the category. Please try again.",
      errors: {},
    };
  }

  revalidateCatalog();
  return { status: "success", message: "Category deleted.", errors: {} };
}
