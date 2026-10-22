"use client";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/states/error-state";

export default function DashboardError({ reset }: { reset: () => void }) {
  return (
    <section className="p-4 md:p-6">
      <ErrorState
        title="Catalog data could not be loaded"
        description="Please try again. If the problem continues, check the database connection."
        action={<Button onClick={reset}>Try again</Button>}
      />
    </section>
  );
}
