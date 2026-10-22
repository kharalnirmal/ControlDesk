import Link from "next/link";
import { EmptyState } from "@/components/states/empty-state";
import { buttonVariants } from "@/components/ui/button";

export default function ProductNotFound() {
  return (
    <section className="p-4 md:p-6">
      <EmptyState
        title="Product not found"
        description="This product does not exist or is no longer available."
        action={
          <Link href="/dashboard/products" className={buttonVariants()}>
            Back to products
          </Link>
        }
      />
    </section>
  );
}
