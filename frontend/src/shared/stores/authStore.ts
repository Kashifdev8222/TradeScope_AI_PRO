/**
 * TradeScope AI — Auth Store (Zustand + localStorage persistence)
 */
import { create } from "zustand";

export interface UserProfile {
  id: string;
  client_code: string;
  full_name: string;
  email: string;
  phone: string | null;
  country: string | null;
  base_currency: string;
  timezone: string;
  status: string;
  kyc_status: string;
  risk_disclosure_version: string | null;
  terms_version: string | null;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

interface AuthState {
  user: UserProfile | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setAuth: (user: UserProfile, tokens: AuthTokens) => void;
  setTokens: (tokens: AuthTokens) => void;
  setUser: (user: UserProfile) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  hydrate: () => void;
}

// localStorage keys
const KEY_USER = "tradescope_user";
const KEY_TOKENS = "tradescope_tokens";

const loadFromStorage = () => {
  try {
    const u = localStorage.getItem(KEY_USER);
    const t = localStorage.getItem(KEY_TOKENS);
    if (u && t) {
      return { user: JSON.parse(u), tokens: JSON.parse(t), isAuthenticated: true };
    }
  } catch {}
  return { user: null, tokens: null, isAuthenticated: false };
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  tokens: null,
  isLoading: true,
  isAuthenticated: false,

  hydrate: () => {
    const data = loadFromStorage();
    set({ ...data, isLoading: false });
  },

  setAuth: (user, tokens) => {
    try {
      localStorage.setItem(KEY_USER, JSON.stringify(user));
      localStorage.setItem(KEY_TOKENS, JSON.stringify(tokens));
    } catch {}
    set({ user, tokens, isAuthenticated: true, isLoading: false });
  },

  setTokens: (tokens) => {
    try { localStorage.setItem(KEY_TOKENS, JSON.stringify(tokens)); } catch {}
    set({ tokens });
  },

  setUser: (user) => {
    try { localStorage.setItem(KEY_USER, JSON.stringify(user)); } catch {}
    set({ user });
  },

  setLoading: (loading) => set({ isLoading: loading }),

  logout: () => {
    try {
      localStorage.removeItem(KEY_USER);
      localStorage.removeItem(KEY_TOKENS);
    } catch {}
    set({ user: null, tokens: null, isAuthenticated: false, isLoading: false });
  },
}));
