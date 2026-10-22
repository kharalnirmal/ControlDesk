import { describe, expect, it } from "vitest";

import { createCategorySchema, normalizeCategoryName } from "./category.schema";

describe("Category validation", () => {
  // 1. Test our normalization function
  it("normalizes spaces and capitalization", () => {
    const input = "  HOME    Appliances  ";

    const result = normalizeCategoryName(input);

    expect(result).toBe("home appliances");
  });

  // 2. Valid input should succeed
  it("accepts a valid category name", () => {
    const result = createCategorySchema.safeParse({
      name: "Electronics",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.name).toBe("electronics");
    }
  });

  // 3. Invalid inputs should fail
  it.each(["", "   ", "A"])("rejects invalid name: %j", (name) => {
    const result = createCategorySchema.safeParse({
      name,
    });

    expect(result.success).toBe(false);
  });

  // 4. Test the maximum boundary
  it("accepts exactly 80 characters", () => {
    const result = createCategorySchema.safeParse({
      name: "a".repeat(80),
    });

    expect(result.success).toBe(true);
  });

  it("rejects more than 80 characters", () => {
    const result = createCategorySchema.safeParse({
      name: "a".repeat(81),
    });

    expect(result.success).toBe(false);
  });

  // 5. Reject incorrect data types
  it("rejects a number instead of a string", () => {
    const result = createCategorySchema.safeParse({
      name: 123,
    });

    expect(result.success).toBe(false);
  });

  // 6. Ensure normalization is consistent
  it("normalizes equivalent names identically", () => {
    const first = normalizeCategoryName("ELECTRONICS");
    const second = normalizeCategoryName(" electronics ");

    expect(first).toBe(second);
  });
});
