import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCreateForm } from "@/components/products/product-create-form";
import { productIdSchema } from "@/features/products/product.schema";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export const instant = false;

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const parsedId = productIdSchema.safeParse(id);
  if (!parsedId.success) notFound();

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id: parsedId.data } }),
    prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: [{ name: "asc" }, { id: "asc" }],
      take: 500,
    }),
  ]);
  if (!product) notFound();

  const categoryOptions = categories.some(
    (category) => category.id === product.categoryId,
  )
    ? categories
    : [
        {
          id: product.categoryId,
          name:
            (
              await prisma.category.findUnique({
                where: { id: product.categoryId },
                select: { name: true },
              })
            )?.name ?? "Current category",
        },
        ...categories,
      ];

  return (
    <section className="space-y-6 p-4 md:p-6">
      <div className="space-y-2">
        <Link
          href={`/dashboard/products/${product.id}`}
          className="text-muted-foreground text-sm hover:underline"
        >
          ← Back to Product
        </Link>
        <h1 className="font-semibold text-2xl">Edit Product</h1>
        <p className="text-muted-foreground text-sm">
          SKU changes are allowed. SKUs are saved in uppercase and must remain
          unique.
        </p>
      </div>
      <div className="rounded-xl border p-4 md:p-6">
        <ProductCreateForm
          categories={categoryOptions}
          product={{
            id: product.id,
            name: product.name,
            sku: product.sku,
            price: product.price.toFixed(2),
            stock: String(product.stock),
            categoryId: product.categoryId,
            description: product.description ?? "",
            imageUrl: product.imageUrl ?? "",
          }}
        />
      </div>
    </section>
  );
}
