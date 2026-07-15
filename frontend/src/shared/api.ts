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

let _refreshPromise: Promise<boolean> | null = null;

async function refreshToken(): Promise<boolean> {
  if (_refreshPromise) return _refreshPromise;
  _refreshPromise = (async () => {
    try {
      const refreshToken = useAuthStore.getState().tokens?.refresh_token;
      if (!refreshToken) return false;
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      if (!res.ok) { useAuthStore.getState().logout(); return false; }
      const data = await res.json();
      useAuthStore.getState().setTokens(data);
      return true;
    } catch { return false; }
  })();
  return _refreshPromise;
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${path}`;
  const doFetch = async () => {
    const token = getAccessToken();
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };
    // Don't set Content-Type for FormData (browser sets it with boundary)
    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return fetch(url, { ...options, headers });
  };

  let response = await doFetch();

  // Auto-refresh token on 401
  if (response.status === 401 && !path.includes("/auth/")) {
    _refreshPromise = null;
    const refreshed = await refreshToken();
    if (refreshed) response = await doFetch();
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error((error as any).detail || `Request failed: ${response.status}`);
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

  isAdmin: () => request<{ is_admin: boolean }>("/client/is-admin"),

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

// ---------------------------------------------------------------------------
// Trading Account API
// ---------------------------------------------------------------------------

export interface TradingAccount {
  id: string;
  account_number: string;
  account_name: string;
  account_type: string;
  environment: string;
  base_currency: string;
  leverage: number;
  position_mode: string;
  status: string;
  ai_enabled: boolean;
  created_at: string;
}

export interface AccountDetail {
  account: TradingAccount;
  settings: {
    one_click_enabled: boolean;
    default_order_size: number;
    manual_ai_approval: boolean;
    preferences: any;
  };
  risk_limits: {
    risk_profile: string;
    max_daily_trades: number;
    max_open_positions: number;
    max_position_size: number;
    daily_loss_limit: number;
    daily_profit_target: number;
    max_drawdown: number;
    allowed_instruments: any;
    allowed_sessions: any;
  };
}

export const accountApi = {
  list: () => request<TradingAccount[]>("/client/accounts"),

  create: (data: {
    account_name: string;
    account_type?: string;
    environment?: string;
    base_currency?: string;
    leverage?: number;
    position_mode?: string;
  }) =>
    request<TradingAccount>("/client/accounts", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getDetail: (accountId: string) =>
    request<AccountDetail>(`/client/accounts/${accountId}`),

  update: (accountId: string, data: Record<string, any>) =>
    request<TradingAccount>(`/client/accounts/${accountId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  updateSettings: (accountId: string, data: Record<string, any>) =>
    request<any>(`/client/accounts/${accountId}/settings`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  getMetrics: (accountId: string) =>
    request<any>(`/client/accounts/${accountId}/metrics`),
};

// ---------------------------------------------------------------------------
// KYC API
// ---------------------------------------------------------------------------

export const kycApi = {
  getStatus: () => request<any>("/client/kyc"),

  submit: () =>
    request<any>("/client/kyc", { method: "POST" }),

  uploadFile: async (file: Blob, fileName: string, documentType: string) => {
    const token = useAuthStore.getState().tokens?.access_token;
    const fd = new FormData();
    fd.append("file", file, fileName);
    fd.append("document_type", documentType);
    const res = await fetch(`${API_URL}/client/kyc/documents`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || `Upload failed: ${res.status}`);
    }
    return res.json();
  },
};
