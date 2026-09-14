export interface AuditUser {
  id: number;
  name: string;
  email: string;
  type: string;
}

export interface AuditLogItem {
  id: number;
  user_id: number;
  user_type: string | null;
  action: string;
  description: string;
  ip_address: string;
  user_agent: string;
  device: string | null;
  browser: string | null;
  platform: string | null;
  payload: Record<string, any> | null;
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  user: AuditUser;
}

export interface PaginationLink {
  url: string | null;
  label: string;
  page: number | null;
  active: boolean;
}

export interface AuditLogResponse {
  status: boolean;
  data: {
    current_page: number;
    data: AuditLogItem[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: PaginationLink[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
}