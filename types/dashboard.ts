export interface DashboardMetrics {
  total_sales: number;
  total_orders: number;
  total_customers: number;
  refund_requests: number;
  stock_products: string | number;
  abandoned_carts: number;
  payment_failures: number;
}

export interface MonthlyRevenueItem {
  month: string;
  revenue: number;
}

export interface TopCountry {
  shipping_country: string;
  total_sales: string;
}

export interface TopState {
  shipping_state: string;
  total_sales: string;
}

export interface RecentOrderItem {
  order_no: string;
  id: number;
  user_id: number;
  total_amount: string;
  order_status: string;
  created_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface StockUpdateItem {
  id: number;
  name: string;
  category_id: number;
  seller_id: number;
  status: string;
  category?: {
    id: number;
    name: string;
  };
  seller?: {
    id: number;
    name: string;
  };
}

export interface DashboardData {
  metrics: DashboardMetrics;
  order_status_chart: Record<string, number>;
  monthly_revenue_chart: MonthlyRevenueItem[];
  top_countries: TopCountry[];
  top_states?: Array<{ shipping_state: string; total_sales: string }>;
  fulfillment_status: Record<string, number>;
  recent_orders: RecentOrderItem[];
  stock_updates: StockUpdateItem[];
}

export interface DashboardResponse {
  status: boolean;
  message: string;
  data: DashboardData;
}