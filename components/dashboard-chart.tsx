"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type {
  CategoryChartPoint,
  StockChartPoint,
} from "@/features/analytics/dashboared.types";

type DashboardChartsProps = {
  productsByCategory: CategoryChartPoint[];
  productsByStockStatus: StockChartPoint[];
};

const chartConfig = {
  products: {
    label: "Products",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function DashboardCharts({
  productsByCategory,
  productsByStockStatus,
}: DashboardChartsProps) {
  const hasProducts = productsByStockStatus.some((item) => item.products > 0);

  return (
    <div className="gap-4 grid grid-cols-1 lg:grid-cols-2 px-4 lg:px-6">
      {/* Chart 1: Products by category */}
      <Card>
        <CardHeader>
          <CardTitle>Products by Category</CardTitle>
          <CardDescription>
            Active product distribution across categories
          </CardDescription>
        </CardHeader>

        <CardContent>
          {!hasProducts ? (
            <p className="flex justify-center items-center h-[280px] text-muted-foreground text-sm">
              No active products to display.
            </p>
          ) : (
            <ChartContainer
              config={chartConfig}
              className="w-full aspect-auto"
              style={{
                height: Math.max(280, productsByCategory.length * 40),
              }}
            >
              <BarChart
                data={productsByCategory}
                layout="vertical"
                margin={{ left: 8, right: 16 }}
              >
                <CartesianGrid horizontal={false} />

                <XAxis type="number" allowDecimals={false} />

                <YAxis
                  dataKey="category"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  width={110}
                  tickFormatter={(name: string) =>
                    name.length > 15 ? `${name.slice(0, 15)}…` : name
                  }
                />

                <ChartTooltip content={<ChartTooltipContent />} />

                <Bar
                  dataKey="products"
                  fill="var(--color-products)"
                  radius={4}
                />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Chart 2: Products by stock status */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Stock Status</CardTitle>
          <CardDescription>
            Active products grouped by available stock
          </CardDescription>
        </CardHeader>

        <CardContent>
          {!hasProducts ? (
            <p className="flex justify-center items-center h-[280px] text-muted-foreground text-sm">
              No active inventory to display.
            </p>
          ) : (
            <ChartContainer config={chartConfig} className="w-full h-[280px]">
              <BarChart data={productsByStockStatus}>
                <CartesianGrid vertical={false} />

                <XAxis
                  dataKey="status"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />

                <YAxis allowDecimals={false} />

                <ChartTooltip content={<ChartTooltipContent />} />

                <Bar
                  dataKey="products"
                  fill="var(--color-products)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
