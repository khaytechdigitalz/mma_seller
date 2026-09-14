export interface FilterParams {
  year?: string | null;
  month?: string | number | null;
  date_from?: string | null;
  date_to?: string | null;
}

export interface SummaryData {
  total_sales: number;
  total_tax: number;
  total_charge: number;
  total_net_settlement: number;
}

export interface ProductDetail {
  id: number;
  name: string;
  sku: string;
  unit_price: number;
  thumbnail: string;
}

export interface TopProductByCount {
  product_id: number;
  total_units_sold: string;
  product: ProductDetail;
}

export interface TopProductByValue {
  product_id: number;
  total_revenue: string;
  product: ProductDetail;
}

export interface TopSellingProduct {
  product_id: number;
  total_units_sold: string;
  total_revenue: string;
  product: ProductDetail;
}

export interface SellerDetail {
  id: number;
  name: string;
  email: string;
  email_verified_at: string;
  phone: string | null;
  avatar: string;
  type: string;
  last_login: string;
  status: string;
  login_attempts: number;
  created_by: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface TopSellerItem {
  seller_id: number;
  total_orders: number;
  total_sold_value: string;
  seller: SellerDetail;
}

export interface TopSellersData {
  by_order_count: TopSellerItem[];
  by_sales_value: TopSellerItem[];
}

export interface MonthlyChartData {
  month: string;
  total_sales: number;
  total_charge: number;
  net_earnings: number;
}

export interface SalesReportResponse {
  status: boolean;
  data: {
    filters: FilterParams;
    summary: SummaryData;
    top_product_by_count: TopProductByCount;
    top_product_by_value: TopProductByValue;
    top_5_selling_products: TopSellingProduct[];
    top_sellers: TopSellersData;
    monthly_chart: MonthlyChartData[];
  };
}