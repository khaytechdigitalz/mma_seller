import { AxiosError } from 'axios';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  meta?: Record<string, any>;
}

export const handleApiError = (error: unknown): string => {
  if (error instanceof AxiosError) {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.response?.data?.errors) {
      const firstKey = Object.keys(error.response.data.errors)[0];
      return error.response.data.errors[firstKey][0];
    }
  }
  return 'An unexpected error occurred. Please try again.';
};