export type DashboardMetrics = {
  activeProducts: number;
  totalCategories: number;
  lowStock: number;
  outOfStock: number;
  totalStockUnits: number;
};

export type CategoryChartPoint = {
  category: string;
  products: number;
};

export type StockChartPoint = {
  status: string;
  products: number;
};

export type DashboardAnalytics = {
  metrics: DashboardMetrics;
  productsByCategory: CategoryChartPoint[];
  productsByStockStatus: StockChartPoint[];
};
