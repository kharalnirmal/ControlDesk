import { SectionCards } from "@/components/section-cards";
import { DashboardCharts } from "@/components/dashboard-chart";

import { getDashboardAnalytics } from "@/features/analytics/get-dashboared-analytics";

export const instant = false;

export default async function DashboardPage() {
  const analytics = await getDashboardAnalytics();

  return (
    <main className="flex flex-col flex-1 gap-6 py-4 md:py-6">
      <div className="px-4 lg:px-6">
        <h1 className="font-semibold text-2xl">Dashboard Overview</h1>

        <p className="text-muted-foreground text-sm">
          Live catalog and inventory analytics.
        </p>
      </div>

      <SectionCards metrics={analytics.metrics} />

      <DashboardCharts
        productsByCategory={analytics.productsByCategory}
        productsByStockStatus={analytics.productsByStockStatus}
      />
    </main>
  );
}
