export interface UserRelation {
  id: number;
  name: string;
  email: string;
}

export interface ProductRelation {
  id: number;
  name: string;
  sku: string;
  thumbnail?: string | null;
}

export interface ProductReview {
  id: number;
  user_id: number;
  seller_id: number | null;
  product_id: number;
  order_no: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  user?: UserRelation;
  seller?: UserRelation;
  product?: ProductRelation;
}

export interface PaginatedReviewsResponse {
  status: boolean;
  message: string;
  data: {
    current_page: number;
    data: ProductReview[];
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface SingleReviewResponse {
  status: boolean;
  message: string;
  data: ProductReview;
}

export interface UpdateReviewPayload {
  rating?: number;
  comment?: string;
}