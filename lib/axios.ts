import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Attach Auth Bearer Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = Cookies.get('auth_token') || (typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null);
    
    if (token) {
      // Use Axios headers handling safely
      if (config.headers && typeof config.headers.set === 'function') {
        config.headers.set('Authorization', `Bearer ${token}`);
      } else if (config.headers) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response Interceptor: Global Error & Auth Handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;

      if (status === 401) {
        // Only treat this as "your session expired" (and bounce to sign-in) if
        // we actually had a token - a 401 on some other check isn't a logout
        // event, and we don't want to yank someone off the sign-in page itself.
        const hadToken = Boolean(
          Cookies.get('auth_token') || (typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null),
        );

        Cookies.remove('auth_token');
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
          if (hadToken && window.location.pathname !== '/signin') {
            window.location.href = '/signin?expired=1';
          }
        }
      }

      if (status === 403) {
        console.warn('Access denied: You do not have the required permissions.');
      }
    }

    return Promise.reject(error);
  }
);