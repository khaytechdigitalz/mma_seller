export interface WithdrawalUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
}

export interface BankDetail {
  id: number;
  user_id: number;
  bank_code: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  is_active?: number;
}

export interface ProcessedBy {
  id: number;
  name: string;
}

export interface WithdrawalDetail {
  id: number;
  reference: string;
  user_id: number;
  user_bank_detail_id: number;
  amount: string;
  fee: string;
  net_amount: string;
  status: string;
  admin_notes: string | null;
  processed_by_user_id: number | null;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
  user: WithdrawalUser | null;
  bank_detail: BankDetail | null;
  processed_by?: ProcessedBy | null;
}

export interface WithdrawalDetailApiResponse {
  status: boolean;
  data: WithdrawalDetail;
}