export interface RefundUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
}

export interface RefundOrder {
  id: number;
  order_no: string;
  payment_status: string;
}

export interface RefundItem {
  id: number;
  refund_no: string;
  order_id: number;
  order_no: string;
  transaction_ref: string;
  user_id: number;
  seller_id: number;
  refund_amount: string;
  reason: string;
  evidence_urls: string[] | null;
  status: string;
  admin_notes: string | null;
  processed_by_user_id: number | null;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
  user: RefundUser | null;
  seller: RefundUser | null;
  order: RefundOrder | null;
}

export interface MetricDetail {
  count: number;
  value: number;
}

export interface RefundMetrics {
  pending: MetricDetail;
  approved: MetricDetail;
  declined: MetricDetail;
  total: MetricDetail;
}

export interface RefundApiResponse {
  status: boolean;
  metrics: RefundMetrics;
  data: {
    current_page: number;
    data: RefundItem[];
    from: number;
    to: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}