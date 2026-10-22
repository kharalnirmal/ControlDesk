import Link from "next/link";

import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { ProductCreateForm } from "@/components/products/product-create-form";
import { EmptyState } from "@/components/states/empty-state";

export const instant = false;

export default async function NewProductPage() {
  // Only administrators can access this page.
  await requireAdmin();

  // Fetch categories for the select dropdown.
  // Fetch one extra to detect when the limit is reached.
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: "asc",
    },
    take: 101,
  });

  const categoryLimitReached = categories.length > 100;
  const categoryOptions = categories.slice(0, 100);

  return (
    <section className="space-y-6 p-4 md:p-6">
      <div className="space-y-2">
        <Link
          href="/dashboard/products"
          className="text-muted-foreground text-sm hover:underline"
        >
          ← Back to Products
        </Link>

        <h1 className="font-semibold text-2xl">Create Product</h1>

        <p className="text-muted-foreground text-sm">
          Add a new product to your catalog.
        </p>
      </div>

      {categoryOptions.length === 0 ? (
        <div className="space-y-4">
          <EmptyState
            title="No categories available"
            description="Create a category before adding products."
          />

          <Link
            href="/dashboard/categories"
            className="inline-block font-medium text-sm underline"
          >
            Create a category →
          </Link>
        </div>
      ) : (
        <div className="space-y-4 p-4 md:p-6 border rounded-xl">
          {categoryLimitReached && (
            <p role="status" className="text-muted-foreground text-sm">
              Showing the first 100 categories. A searchable category selector
              is needed for larger catalogs.
            </p>
          )}

          <ProductCreateForm categories={categoryOptions} />
        </div>
      )}
    </section>
  );
}
