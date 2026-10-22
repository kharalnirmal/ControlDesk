import { describe, expect, it } from "vitest";
import {
  createProductSchema,
  normalizeSku,
  updateProductSchema,
} from "./product.schema";

const validProduct = {
  sku: "mouse-001",
  name: "Wireless Mouse",
  description: "",
  price: "1250.00",
  stock: "20",
  categoryId: "cat123",
  imageUrl: "",
};

describe("Product validation", () => {
  it("accepts a valid product", () => {
    const result = createProductSchema.parse(validProduct);

    expect(result.sku).toBe("MOUSE-001");
    expect(result.price).toBe("1250.00");
    expect(result.stock).toBe(20);
  });

  it("rejects negative stock", () => {
    const result = createProductSchema.safeParse({
      ...validProduct,
      stock: "-5",
    });

    expect(result.success).toBe(false);
  });

  it("rejects invalid decimal precision", () => {
    const result = createProductSchema.safeParse({
      ...validProduct,
      price: "1250.999",
    });

    expect(result.success).toBe(false);
  });

  it("rejects short SKUs", () => {
    const result = createProductSchema.safeParse({
      ...validProduct,
      sku: "AB",
    });

    expect(result.success).toBe(false);
  });

  it("normalizes equivalent SKUs consistently", () => {
    expect(normalizeSku(" mouse-001 ")).toBe("MOUSE-001");
    expect(normalizeSku("MOUSE-001")).toBe("MOUSE-001");
  });

  it.each(["ABC!", "A B", "AB", "A".repeat(33)])(
    "rejects invalid SKU %j",
    (sku) => {
      expect(createProductSchema.safeParse({ ...validProduct, sku }).success).toBe(
        false,
      );
    },
  );

  it.each(["-0.01", "1.001", "01.00", "10000000000.00", "NaN"])(
    "rejects invalid price %j",
    (price) => {
      expect(
        createProductSchema.safeParse({ ...validProduct, price }).success,
      ).toBe(false);
    },
  );

  it.each(["-1", "2.5", "1000001", "1e2"])(
    "rejects invalid stock %j",
    (stock) => {
      expect(
        createProductSchema.safeParse({ ...validProduct, stock }).success,
      ).toBe(false);
    },
  );

  it("accepts price and stock boundaries", () => {
    expect(
      createProductSchema.safeParse({
        ...validProduct,
        price: "9999999999.99",
        stock: "1000000",
      }).success,
    ).toBe(true);
  });

  it("rejects a missing category and non-HTTPS image", () => {
    expect(
      createProductSchema.safeParse({ ...validProduct, categoryId: "" }).success,
    ).toBe(false);
    expect(
      createProductSchema.safeParse({
        ...validProduct,
        imageUrl: "http://example.com/image.jpg",
      }).success,
    ).toBe(false);
  });

  it("uses the same validation contract when editing", () => {
    expect(updateProductSchema.safeParse(validProduct).success).toBe(true);
    expect(
      updateProductSchema.safeParse({ ...validProduct, name: " " }).success,
    ).toBe(false);
  });
});
