import { requireAdmin } from "@/lib/require-admin";
import type { DashboardAnalytics } from "./dashboared.types";
import { prisma } from "@/lib/prisma";

export async function getDashboardAnalytics(): Promise<DashboardAnalytics> {
  //1.Authorization
  await requireAdmin();

  //2.shared business rule
  const activeFilter = {
    archivedAt: null,
  };

  //3.fectch all the analytics from the database
  const [
    activeProducts,
    totalCategories,
    lowStock,
    outOfStock,
    stockAggregation,
    groupedProducts,
    categories,
  ] = await Promise.all([
    prisma.product.count({
      where: activeFilter,
    }),

    prisma.category.count(),

    prisma.product.count({
      where: {
        ...activeFilter,
        stock: {
          gte: 1,
          lte: 5,
        },
      },
    }),

    prisma.product.count({
      where: {
        ...activeFilter,
        stock: 0,
      },
    }),

    prisma.product.aggregate({
      where: activeFilter,
      _sum: {
        stock: true,
      },
    }),

    prisma.product.groupBy({
      by: ["categoryId"],
      where: activeFilter,
      _count: {
        _all: true,
      },
    }),

    prisma.category.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  // 4. Create a fast categoryId -> product count lookup
  const categoryCounts = new Map(
    groupedProducts.map((group) => [group.categoryId, group._count._all]),
  );

  // 5. Convert DB results into data suitable for Recharts
  const productsByCategory = categories.map((category) => ({
    category: category.name,
    products: categoryCounts.get(category.id) ?? 0,
  }));

  // Every valid active product belongs to exactly one stock status.
  const inStock = activeProducts - lowStock - outOfStock;

  const productsByStockStatus = [
    { status: "In stock", products: inStock },
    { status: "Low stock", products: lowStock },
    { status: "Out of stock", products: outOfStock },
  ];

  // 6. Return one consistent object for the dashboard
  return {
    metrics: {
      activeProducts,
      totalCategories,
      lowStock,
      outOfStock,
      totalStockUnits: stockAggregation._sum.stock ?? 0,
    },

    productsByCategory,
    productsByStockStatus,
  };
}
