import { EmptyState } from "@/components/states/empty-state";
import { FeaturePlaceholder } from "@/components/states/feature-placeholder";

export default function CategoriesPage() {
  return (
    <section>
      <FeaturePlaceholder
        title="Category Management"
        description="Category management will be implemented in M3."
      />

      <EmptyState
        title="Empty Product"
        description="Will add later bt not now "
      />
    </section>
  );
}
