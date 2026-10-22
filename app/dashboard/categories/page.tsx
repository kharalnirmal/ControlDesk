import { CategoryCreateForm } from "@/components/categories/category-create-form";
import { EmptyState } from "@/components/states/empty-state";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import Link from "next/link";

const PAGE_SIZE = 20;
type CategoriesPageProps = {
  searchParams: Promise<{
    page?: string | string[];
  }>;
};

export default async function CategoriesPage({
  searchParams,
}: CategoriesPageProps) {
  //1. only authorized admins can read categories
  await requireAdmin();
  //2. Read adn validate Pagination input
  const { page } = await searchParams;

  const requestedPage =
    typeof page === "string" && /^[1-9]\d{0,5}$/.test(page) ? Number(page) : 1;

  // 3. Count actual category records.
  const totalCategories = await prisma.category.count();

  const totalPages = Math.max(1, Math.ceil(totalCategories / PAGE_SIZE));

  const currentPage = Math.min(requestedPage, totalPages);

  // 4. Fetch this page of categories and product counts.
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          products: true,
        },
      },
    },
    orderBy: [{ name: "asc" }, { id: "asc" }],
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  return (
    <section className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="font-semibold text-2xl">Category Management</h1>
        <p className="text-muted-foreground text-sm">
          Create and organize categories for your products.
        </p>
      </div>

      <div className="p-4 md:p-6 border rounded-lg">
        <h2 className="mb-4 font-semibold text-lg">Add Category</h2>

        <CategoryCreateForm />
      </div>

      <div className="space-y-4">
        <h2 className="font-semibold text-lg">
          All Categories ({totalCategories})
        </h2>

        {totalCategories === 0 ? (
          <EmptyState
            title="No categories yet"
            description="Create your first category to organize your products."
          />
        ) : (
          <>
            <div className="border rounded-lg overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th scope="col" className="p-3 font-medium text-left">
                      Category Name
                    </th>

                    <th scope="col" className="p-3 font-medium text-right">
                      Products
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id} className="border-t">
                      <td className="p-3 font-medium">{category.name}</td>

                      <td className="p-3 text-right">
                        {category._count.products}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <nav
              aria-label="Category pagination"
              className="flex justify-between items-center gap-4 text-sm"
            >
              <span>
                Page {currentPage} of {totalPages}
              </span>

              <div className="flex gap-4">
                {currentPage > 1 && (
                  <Link
                    href={`/dashboard/categories?page=${currentPage - 1}`}
                    className="underline underline-offset-4"
                  >
                    Previous
                  </Link>
                )}

                {currentPage < totalPages && (
                  <Link
                    href={`/dashboard/categories?page=${currentPage + 1}`}
                    className="underline underline-offset-4"
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
