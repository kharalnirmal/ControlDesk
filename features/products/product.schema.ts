import { z } from "zod";

const decimalPrice = /^(0|[1-9]\d{0,9})(\.\d{1,2})?$/;
const skuPattern = /^[A-Z0-9_-]{3,32}$/;

export function normalizeSku(sku: string) {
  return sku.trim().toUpperCase();
}

const productFields = {
  sku: z
    .string()
    .transform(normalizeSku)
    .pipe(
      z
        .string()
        .regex(
          skuPattern,
          "SKU must be 3-32 letters, numbers, hyphens or underscores.",
        ),
    ),
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(120, "Name cannot exceed 120 characters."),
  description: z.string().trim().max(2000, "Description is too long."),
  price: z
    .string()
    .trim()
    .regex(
      decimalPrice,
      "Enter a nonnegative price with up to 2 decimals (maximum 9,999,999,999.99).",
    ),
  stock: z
    .string()
    .trim()
    .regex(/^\d+$/, "Stock must be a whole number.")
    .transform(Number)
    .pipe(
      z
        .number()
        .int()
        .min(0, "Stock cannot be negative.")
        .max(1_000_000, "Stock cannot exceed 1,000,000."),
    ),
  categoryId: z
    .string()
    .trim()
    .min(1, "Select a category.")
    .max(100, "Invalid category."),
  imageUrl: z
    .string()
    .trim()
    .max(2048, "Image URL is too long.")
    .refine((value) => {
      if (!value) return true;

      try {
        return new URL(value).protocol === "https:";
      } catch {
        return false;
      }
    }, "Enter a valid HTTPS image URL."),
};

export const createProductSchema = z.object(productFields);
export const updateProductSchema = z.object(productFields);
export const productIdSchema = z.string().trim().min(1).max(100);

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
