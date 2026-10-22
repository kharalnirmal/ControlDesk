import { z } from "zod";

export function normalizeCategoryName(name: string) {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

export const createCategorySchema = z.object({
  name: z
    .string()
    .transform(normalizeCategoryName)
    .pipe(
      z
        .string()
        .min(2, "Category name must be at least 2 characters.")
        .max(80, "Category name cannot exceed 80 characters."),
    ),
});

export const renameCategorySchema = createCategorySchema.extend({
  id: z.string().trim().min(1).max(100),
});

export const categoryIdSchema = z.string().trim().min(1).max(100);

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

//z.object() describes the expected object. z.string() requires a string. .transform() normalizes it. .pipe() validates the normalized result.
