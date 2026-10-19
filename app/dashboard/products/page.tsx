import { FeaturePlaceholder } from "@/components/states/feature-placeholder";
import { requireAdmin } from "@/lib/require-admin";

export default async function ProductsPage() {
  await requireAdmin();
  return (
    <section>
      <FeaturePlaceholder
        title="Project Management"
        description="Project management will be implemented in M3."
      />
    </section>
  );
}
