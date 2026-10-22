import type { Prisma } from "@/generated/prisma/client";

export const PRODUCT_PAGE_SIZE = 20;
export const PRODUCT_SORTS = [
  "newest",
  "oldest",
  "name",
  "price",
  "stock",
] as const;
export const PRODUCT_STATUSES = ["active", "archived", "all"] as const;

export type ProductSort = (typeof PRODUCT_SORTS)[number];
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];
export type RawProductQuery = Record<string, string | string[] | undefined>;

export type ProductListQuery = {
  q: string;
  categoryId: string;
  sort: ProductSort;
  status: ProductStatus;
  page: number;
};

function first(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

export function parseProductListQuery(raw: RawProductQuery): ProductListQuery {
  const rawQuery = first(raw.q).trim();
  const rawCategoryId = first(raw.categoryId).trim();
  const rawSort = first(raw.sort);
  const rawStatus = first(raw.status);
  const rawPage = first(raw.page);

  return {
    q: rawQuery.slice(0, 100),
    categoryId: rawCategoryId.slice(0, 100),
    sort: PRODUCT_SORTS.includes(rawSort as ProductSort)
      ? (rawSort as ProductSort)
      : "newest",
    status: PRODUCT_STATUSES.includes(rawStatus as ProductStatus)
      ? (rawStatus as ProductStatus)
      : "active",
    page: /^[1-9]\d{0,5}$/.test(rawPage)
      ? Math.min(Number(rawPage), 100_000)
      : 1,
  };
}

export function buildProductWhere(
  query: ProductListQuery,
): Prisma.ProductWhereInput {
  return {
    ...(query.status === "active"
      ? { archivedAt: null }
      : query.status === "archived"
        ? { archivedAt: { not: null } }
        : {}),
    ...(query.categoryId ? { categoryId: query.categoryId } : {}),
    ...(query.q
      ? {
          OR: [
            { name: { contains: query.q, mode: "insensitive" as const } },
            { sku: { contains: query.q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };
}

export function buildProductOrderBy(
  sort: ProductSort,
): Prisma.ProductOrderByWithRelationInput[] {
  const primary: Prisma.ProductOrderByWithRelationInput =
    sort === "oldest"
      ? { createdAt: "asc" }
      : sort === "name"
        ? { name: "asc" }
        : sort === "price"
          ? { price: "asc" }
          : sort === "stock"
            ? { stock: "asc" }
            : { createdAt: "desc" };

  return [primary, { id: sort === "oldest" ? "asc" : "desc" }];
}

export function productListHref(
  query: ProductListQuery,
  overrides: Partial<ProductListQuery> = {},
) {
  const next = { ...query, ...overrides };
  const params = new URLSearchParams();
  if (next.q) params.set("q", next.q);
  if (next.categoryId) params.set("categoryId", next.categoryId);
  if (next.sort !== "newest") params.set("sort", next.sort);
  if (next.status !== "active") params.set("status", next.status);
  if (next.page > 1) params.set("page", String(next.page));
  const suffix = params.toString();
  return `/dashboard/products${suffix ? `?${suffix}` : ""}`;
}
