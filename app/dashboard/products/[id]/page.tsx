import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { ProductStatusForm } from "@/components/products/product-status-form";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { productIdSchema } from "@/features/products/product.schema";

export const instant = false;

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const parsedId = productIdSchema.safeParse(id);
  if (!parsedId.success) notFound();

  const product = await prisma.product.findUnique({
    where: { id: parsedId.data },
    include: { category: { select: { id: true, name: true } } },
  });
  if (!product) notFound();

  return (
    <section className="space-y-6 p-4 md:p-6">
      <div className="space-y-2">
        <Link
          href="/dashboard/products"
          className="text-muted-foreground text-sm hover:underline"
        >
          ← Back to Products
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="font-semibold text-2xl">{product.name}</h1>
            <Badge variant={product.archivedAt ? "outline" : "secondary"}>
              {product.archivedAt ? "Archived" : "Active"}
            </Badge>
          </div>
          <Link
            href={`/dashboard/products/${product.id}/edit`}
            className={buttonVariants({ variant: "outline" })}
          >
            Edit product
          </Link>
        </div>
      </div>

      <dl className="grid gap-4 rounded-xl border p-4 sm:grid-cols-2 md:p-6">
        <Detail label="SKU" value={product.sku} mono />
        <Detail label="Category" value={product.category.name} />
        <Detail label="Price" value={`NPR ${product.price.toFixed(2)}`} />
        <Detail label="Stock" value={String(product.stock)} />
        <Detail
          label="Created"
          value={product.createdAt.toLocaleString()}
        />
        <Detail
          label="Last updated"
          value={product.updatedAt.toLocaleString()}
        />
        <div className="space-y-1 sm:col-span-2">
          <dt className="text-muted-foreground text-sm">Description</dt>
          <dd className="whitespace-pre-wrap">
            {product.description || "No description provided."}
          </dd>
        </div>
        <div className="space-y-1 sm:col-span-2">
          <dt className="text-muted-foreground text-sm">Image URL</dt>
          <dd className="break-all">
            {product.imageUrl ? (
              <a
                href={product.imageUrl}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-4"
              >
                {product.imageUrl}
              </a>
            ) : (
              "No image URL provided."
            )}
          </dd>
        </div>
      </dl>

      <div className="rounded-xl border p-4 md:p-6">
        <h2 className="mb-2 font-semibold">Product status</h2>
        <p className="mb-4 text-muted-foreground text-sm">
          Archived products remain stored but are excluded from active listings
          and active catalog metrics.
        </p>
        <ProductStatusForm
          key={product.archivedAt ? "archived" : "active"}
          productId={product.id}
          archived={Boolean(product.archivedAt)}
        />
      </div>
    </section>
  );
}

function Detail({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="space-y-1">
      <dt className="text-muted-foreground text-sm">{label}</dt>
      <dd className={mono ? "font-mono text-sm" : ""}>{value}</dd>
    </div>
  );
}
