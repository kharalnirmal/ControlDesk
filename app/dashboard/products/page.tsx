import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/states/empty-state";
import {
  buildProductOrderBy,
  buildProductWhere,
  parseProductListQuery,
  productListHref,
  PRODUCT_PAGE_SIZE,
  type RawProductQuery,
} from "@/features/products/product-list";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export const instant = false;

type ProductsPageProps = { searchParams: Promise<RawProductQuery> };

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  await requireAdmin();
  const query = parseProductListQuery(await searchParams);
  const where = buildProductWhere(query);

  const [totalProducts, categories] = await Promise.all([
    prisma.product.count({ where }),
    prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: [{ name: "asc" }, { id: "asc" }],
      take: 500,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalProducts / PRODUCT_PAGE_SIZE));
  const currentPage = Math.min(query.page, totalPages);
  const products = await prisma.product.findMany({
    where,
    select: {
      id: true,
      sku: true,
      name: true,
      price: true,
      stock: true,
      archivedAt: true,
      category: { select: { name: true } },
    },
    orderBy: buildProductOrderBy(query.sort),
    skip: (currentPage - 1) * PRODUCT_PAGE_SIZE,
    take: PRODUCT_PAGE_SIZE,
  });

  const hasFilters =
    Boolean(query.q || query.categoryId) ||
    query.status !== "active" ||
    query.sort !== "newest";

  return (
    <section className="space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-semibold text-2xl">Product Management</h1>
          <p className="text-muted-foreground text-sm">
            Search and maintain your real product catalog.
          </p>
        </div>
        <Link href="/dashboard/products/new" className={buttonVariants()}>
          Add Product
        </Link>
      </div>

      <form
        action="/dashboard/products"
        method="get"
        className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2 xl:grid-cols-5"
      >
        <div className="space-y-1 sm:col-span-2 xl:col-span-1">
          <label htmlFor="product-search" className="font-medium text-sm">
            Search name or SKU
          </label>
          <input
            id="product-search"
            name="q"
            defaultValue={query.q}
            maxLength={100}
            placeholder="e.g. mouse"
            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="category-filter" className="font-medium text-sm">
            Category
          </label>
          <select
            id="category-filter"
            name="categoryId"
            defaultValue={query.categoryId}
            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="status-filter" className="font-medium text-sm">
            Status
          </label>
          <select
            id="status-filter"
            name="status"
            defaultValue={query.status}
            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
          >
            <option value="active">Active</option>
            <option value="archived">Archived</option>
            <option value="all">All</option>
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="sort-products" className="font-medium text-sm">
            Sort
          </label>
          <select
            id="sort-products"
            name="sort"
            defaultValue={query.sort}
            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="name">Name</option>
            <option value="price">Price</option>
            <option value="stock">Stock</option>
          </select>
        </div>
        <div className="flex items-end gap-2">
          <button className={buttonVariants()} type="submit">
            Apply
          </button>
          <Link
            href="/dashboard/products"
            className={buttonVariants({ variant: "outline" })}
          >
            Reset
          </Link>
        </div>
      </form>

      <div className="space-y-4">
        <h2 className="font-semibold text-lg">
          Products ({totalProducts})
        </h2>
        {totalProducts === 0 ? (
          <EmptyState
            title={hasFilters ? "No matching products" : "No products yet"}
            description={
              hasFilters
                ? "Try changing or resetting the current filters."
                : "Create your first product to start managing inventory."
            }
            action={
              hasFilters ? (
                <Link
                  href="/dashboard/products"
                  className={buttonVariants({ variant: "outline" })}
                >
                  Clear filters
                </Link>
              ) : undefined
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full min-w-[780px] text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th scope="col" className="p-3 text-left">SKU</th>
                    <th scope="col" className="p-3 text-left">Product</th>
                    <th scope="col" className="p-3 text-left">Category</th>
                    <th scope="col" className="p-3 text-left">Status</th>
                    <th scope="col" className="p-3 text-right">Price</th>
                    <th scope="col" className="p-3 text-right">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-t">
                      <td className="p-3 font-mono text-xs">{product.sku}</td>
                      <td className="p-3 font-medium">
                        <Link
                          href={`/dashboard/products/${product.id}`}
                          className="underline-offset-4 hover:underline focus-visible:underline"
                        >
                          {product.name}
                        </Link>
                      </td>
                      <td className="p-3">{product.category.name}</td>
                      <td className="p-3">
                        <Badge variant={product.archivedAt ? "outline" : "secondary"}>
                          {product.archivedAt ? "Archived" : "Active"}
                        </Badge>
                      </td>
                      <td className="p-3 text-right tabular-nums">
                        NPR {product.price.toFixed(2)}
                      </td>
                      <td className="p-3 text-right tabular-nums">{product.stock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <nav
              aria-label="Product pagination"
              className="flex flex-wrap items-center justify-between gap-4 text-sm"
            >
              <span>Page {currentPage} of {totalPages}</span>
              <div className="flex gap-2">
                {currentPage > 1 && (
                  <Link
                    href={productListHref(query, { page: currentPage - 1 })}
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                  >
                    Previous
                  </Link>
                )}
                {currentPage < totalPages && (
                  <Link
                    href={productListHref(query, { page: currentPage + 1 })}
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                  >
                    Next
                  </Link>
                )}
              </div>
            </nav>
          </>
        )}
      </div>
    </section>
  );
}
