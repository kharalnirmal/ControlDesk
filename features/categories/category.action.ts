"use server";
import { requireAdmin } from "@/lib/require-admin";
import { createCategorySchema } from "./category.schema";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";

export type CategoryActionState = {
  status: "idle" | "success" | "error";
  message: string;
  errors: {
    name?: string[];
  };
};

export async function createCategoryAction(
  _prevState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  //step:1 authorization
  await requireAdmin();

  //step 2 : validate input

  const result = createCategorySchema.safeParse({
    name: formData.get("name"),
  });

  if (!result.success) {
    return {
      status: "error",
      message: "please correct the form",
      errors: {
        name: result.error.issues
          .filter((issue) => issue.path[0] == "name")
          .map((issue) => issue.message),
      },
    };
  }

  //step 3 : save to postgreSQL
  try {
    await prisma.category.create({
      data: {
        name: result.data.name,
      },
    });
  } catch (error) {
    // Step 4: Handle database conflicts
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        status: "error",
        message: "Category already exists.",
        errors: {
          name: ["Choose a different category name."],
        },
      };
    }

    console.error("Failed to create category", error);
    return {
      status: "error",
      message: "Something went wrong while saving.",
      errors: {},
    };
  }

  // Step 5: Refresh affected pages
  revalidatePath("/dashboard/categories");
  revalidatePath("/dashboard");

  return {
    status: "success",
    message: "Category created successfully.",
    errors: {},
  };
}
