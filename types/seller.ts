export interface SellerDetailsResponse {
  status: boolean;
  data: {
    seller: {
      id: number;
      name: string;
      email: string;
      phone: string | null;
      avatar: string | null;
      type: string;
      status: string;
      storefront: {
        id: number;
        name: string;
        slug: string;
        logo: string;
        banner: string;
        description: string;
        currency: string;
      };
      wallet: {
        balance: string;
        pending_balance: string;
      };
    };
    metrics: {
      orders: {
        total_orders_count: number;
        total_orders_value: number;
        completed_orders_count: number;
        completed_orders_value: number;
      };
      refunds: {
        total_refunds_count: number;
        total_refunds_value: number;
      };
    };
  };
}

export interface PaginatedResponse<T> {
  status: boolean;
  data: {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
    data: T[];
  };
}