export interface ShippingBillingAddress {
  first_name?: string;
  last_name?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  phone?: string;
}

export interface OrderUser {
  id: number;
  name: string;
  avatar: string;
  email: string;
  phone?: string | null;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  seller_id: number;
  product_name: string;
  sku: string;
  unit_price: string;
  quantity: number;
  tax: string;
  discount: string;
  total_price: string;
  delivery_status: string;
  created_at: string;
  updated_at: string;
  product?: {
    id: number;
    name: string;
    sku: string;
    thumbnail?: string;
  };
}

export interface StatusHistory {
  id: number;
  order_id: number;
  status: string;
  comment: string;
  changed_by_user_id: number;
  created_at: string;
  changed_by?: {
    id: number;
    name: string;
  };
}

export interface OrderDetailData {
  id: number;
  order_no: string;
  user_id: number;
  seller_id: number;
  order_status: string;
  payment_status: string;
  payment_method: string;
  transaction_ref: string;
  subtotal: string;
  tax_amount: string;
  shipping_cost: string;
  discount_amount: string;
  total_amount: string;
  shipping_country: string;
  shipping_state: string;
  shipping_address?: ShippingBillingAddress;
  billing_address?: ShippingBillingAddress;
  notes?: string;
  created_at: string;
  updated_at: string;
  user?: OrderUser;
  seller?: OrderUser;
  items?: OrderItem[];
  status_histories?: StatusHistory[];
}