/**
 * TradeScope AI — API Service
 * Centralized API client for the FastAPI backend.
 */
import Constants from "expo-constants";
import { useAuthStore } from "./stores/authStore";

const API_URL = Constants.expoConfig?.extra?.apiUrl as string;

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function getAccessToken(): string | null {
  return useAuthStore.getState().tokens?.access_token ?? null;
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${path}`;
  const token = getAccessToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      (error as any).detail || `Request failed: ${response.status}`
    );
  }

  return response.json();
}

// ---------------------------------------------------------------------------
// Auth API
// ---------------------------------------------------------------------------

export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  country?: string;
  accept_terms: boolean;
  accept_risk_disclosure: boolean;
}

export interface AuthResponse {
  user: import("../stores/authStore").UserProfile;
  tokens: import("../stores/authStore").AuthTokens;
}

export const authApi = {
  register: (data: RegisterPayload) =>
    request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (email: string, password: string) =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  logout: () =>
    request<{ message: string }>("/auth/logout", { method: "POST" }),

  refresh: (refresh_token: string) =>
    request<import("../stores/authStore").AuthTokens>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh_token }),
    }),

  forgotPassword: (email: string) =>
    request<{ message: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, new_password: string) =>
    request<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, new_password }),
    }),

  getProfile: () => request<import("../stores/authStore").UserProfile>("/client/profile"),

  updateProfile: (data: Record<string, any>) =>
    request<import("../stores/authStore").UserProfile>("/client/profile", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};

// ---------------------------------------------------------------------------
// Admin API
// ---------------------------------------------------------------------------

export interface AdminUser {
  id: string;
  client_code: string;
  full_name: string;
  email?: string;
  phone: string | null;
  country: string | null;
  status: string;
  kyc_status: string;
  base_currency: string;
  created_at: string;
  auth_user_id: string;
}

export interface AdminUsersResponse {
  users: AdminUser[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface AdminUserDetail {
  profile: Record<string, any>;
  roles: Array<{ role_id: string; code: string; name: string }>;
  trading_accounts: any[];
}

export const adminApi = {
  me: () => request<AdminUserDetail>("/admin/me"),

  listUsers: (params?: Record<string, any>) => {
    const query = new URLSearchParams(params).toString();
    return request<AdminUsersResponse>(`/admin/users${query ? `?${query}` : ""}`);
  },

  getUserDetail: (userId: string) =>
    request<AdminUserDetail>(`/admin/users/${userId}`),

  activateUser: (userId: string, reason: string) =>
    request<any>(`/admin/users/${userId}/activate`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),

  suspendUser: (userId: string, reason: string) =>
    request<any>(`/admin/users/${userId}/suspend`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),

  restrictUser: (userId: string, reason: string) =>
    request<any>(`/admin/users/${userId}/restrict`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),

  closeUser: (userId: string, reason: string) =>
    request<any>(`/admin/users/${userId}/close`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),

  enableAI: (userId: string, reason: string) =>
    request<any>(`/admin/users/${userId}/ai/enable`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),

  disableAI: (userId: string, reason: string) =>
    request<any>(`/admin/users/${userId}/ai/disable`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),

  assignRole: (userId: string, roleCode: string) =>
    request<any>(`/admin/users/${userId}/roles`, {
      method: "POST",
      body: JSON.stringify({ role_code: roleCode }),
    }),
};
