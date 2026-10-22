import { describe, expect, it } from "vitest";
import {
  buildProductOrderBy,
  buildProductWhere,
  parseProductListQuery,
  productListHref,
} from "./product-list";

describe("product list query contract", () => {
  it("uses safe defaults for blank and unsupported values", () => {
    expect(
      parseProductListQuery({ page: "0", sort: "DROP TABLE", status: "hidden" }),
    ).toEqual({ q: "", categoryId: "", sort: "newest", status: "active", page: 1 });
  });

  it("bounds oversized and malformed inputs", () => {
    const parsed = parseProductListQuery({
      q: " x ".repeat(100),
      categoryId: "c".repeat(200),
      page: "999999",
    });
    expect(parsed.q).toHaveLength(100);
    expect(parsed.categoryId).toHaveLength(100);
    expect(parsed.page).toBe(100_000);
  });

  it("builds matching name/SKU, category and archived filters", () => {
    const where = buildProductWhere(
      parseProductListQuery({ q: "mouse", categoryId: "cat-1", status: "archived" }),
    );
    expect(where).toMatchObject({
      categoryId: "cat-1",
      archivedAt: { not: null },
      OR: [
        { name: { contains: "mouse", mode: "insensitive" } },
        { sku: { contains: "mouse", mode: "insensitive" } },
      ],
    });
  });

  it.each(["newest", "oldest", "name", "price", "stock"] as const)(
    "always adds stable id ordering for %s",
    (sort) => {
      const order = buildProductOrderBy(sort);
      expect(order).toHaveLength(2);
      expect(order[1]).toHaveProperty("id");
    },
  );

  it("preserves filters in pagination links", () => {
    const query = parseProductListQuery({
      q: "mouse",
      categoryId: "cat-1",
      status: "all",
      sort: "price",
    });
    const href = productListHref(query, { page: 3 });
    expect(href).toContain("q=mouse");
    expect(href).toContain("categoryId=cat-1");
    expect(href).toContain("status=all");
    expect(href).toContain("sort=price");
    expect(href).toContain("page=3");
  });
});
