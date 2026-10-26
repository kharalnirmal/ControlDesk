import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  productCount: vi.fn(),
  categoryCount: vi.fn(),
  aggregate: vi.fn(),
  groupBy: vi.fn(),
  categoryFindMany: vi.fn(),
}));

vi.mock("@/lib/require-admin", () => ({
  requireAdmin: mocks.requireAdmin,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    product: {
      count: mocks.productCount,
      aggregate: mocks.aggregate,
      groupBy: mocks.groupBy,
    },
    category: {
      count: mocks.categoryCount,
      findMany: mocks.categoryFindMany,
    },
  },
}));

import { getDashboardAnalytics } from "./get-dashboared-analytics";

describe("dashboard analytics", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    mocks.requireAdmin.mockResolvedValue({
      id: "admin-1",
    });
  });

  it("returns correct KPIs and chart data", async () => {
    // Arrange: simulate three active products
    mocks.productCount
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(1);

    mocks.categoryCount.mockResolvedValue(3);

    mocks.aggregate.mockResolvedValue({
      _sum: { stock: 13 },
    });

    mocks.groupBy.mockResolvedValue([
      { categoryId: "cat-1", _count: { _all: 2 } },
      { categoryId: "cat-2", _count: { _all: 1 } },
    ]);

    mocks.categoryFindMany.mockResolvedValue([
      { id: "cat-1", name: "electronics" },
      { id: "cat-2", name: "accessories" },
      { id: "cat-3", name: "office" },
    ]);

    // Act
    const result = await getDashboardAnalytics();

    // Assert: KPI values
    expect(result.metrics).toEqual({
      activeProducts: 3,
      totalCategories: 3,
      lowStock: 1,
      outOfStock: 1,
      totalStockUnits: 13,
    });

    // Assert: category chart transformation
    expect(result.productsByCategory).toEqual([
      { category: "electronics", products: 2 },
      { category: "accessories", products: 1 },
      { category: "office", products: 0 },
    ]);

    // Assert: stock chart transformation
    expect(result.productsByStockStatus).toEqual([
      { status: "In stock", products: 1 },
      { status: "Low stock", products: 1 },
      { status: "Out of stock", products: 1 },
    ]);

    // Assert: the low-stock query uses the correct boundaries
    expect(mocks.productCount).toHaveBeenNthCalledWith(2, {
      where: {
        archivedAt: null,
        stock: {
          gte: 1,
          lte: 5,
        },
      },
    });

    // Assert: chart aggregation excludes archived records
    expect(mocks.groupBy).toHaveBeenCalledWith({
      by: ["categoryId"],
      where: { archivedAt: null },
      _count: { _all: true },
    });
  });

  it("handles an empty catalog", async () => {
    mocks.productCount.mockResolvedValue(0);
    mocks.categoryCount.mockResolvedValue(0);

    mocks.aggregate.mockResolvedValue({
      _sum: { stock: null },
    });

    mocks.groupBy.mockResolvedValue([]);
    mocks.categoryFindMany.mockResolvedValue([]);

    const result = await getDashboardAnalytics();

    expect(result.metrics.totalStockUnits).toBe(0);
    expect(result.metrics.activeProducts).toBe(0);
    expect(result.productsByCategory).toEqual([]);
  });

  it("does not query analytics for an unauthorized user", async () => {
    mocks.requireAdmin.mockRejectedValueOnce(new Error("Access denied"));

    await expect(getDashboardAnalytics()).rejects.toThrow("Access denied");

    expect(mocks.productCount).not.toHaveBeenCalled();
    expect(mocks.groupBy).not.toHaveBeenCalled();
  });
});
