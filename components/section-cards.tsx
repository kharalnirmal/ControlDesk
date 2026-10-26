import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import type { DashboardMetrics } from "@/features/analytics/dashboared.types";

type SectionCardsProps = {
  metrics: DashboardMetrics;
};

export function SectionCards({ metrics }: SectionCardsProps) {
  const cards = [
    {
      title: "Active Products",
      value: metrics.activeProducts,
      description: "Products currently in the catalog",
    },
    {
      title: "Categories",
      value: metrics.totalCategories,
      description: "Total product categories",
    },
    {
      title: "Low Stock",
      value: metrics.lowStock,
      description: "Active products with 1–5 units",
    },
    {
      title: "Out of Stock",
      value: metrics.outOfStock,
      description: "Active products with zero units",
    },
    {
      title: "Stock Units",
      value: metrics.totalStockUnits,
      description: "Total units across active products",
    },
  ];

  return (
    <section className="gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 px-4 lg:px-6">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader>
            <CardDescription>{card.title}</CardDescription>

            <CardTitle className="font-semibold tabular-nums text-3xl">
              {card.value.toLocaleString()}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-muted-foreground text-sm">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
