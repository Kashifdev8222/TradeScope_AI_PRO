/**
 * TradeScope AI — Auth Store (Zustand)
 * Manages auth state: user profile, tokens, loading states.
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
  // State
  user: UserProfile | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  setAuth: (user: UserProfile, tokens: AuthTokens) => void;
  setTokens: (tokens: AuthTokens) => void;
  setUser: (user: UserProfile) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  tokens: null,
  isLoading: true,
  isAuthenticated: false,

  setAuth: (user, tokens) =>
    set({
      user,
      tokens,
      isAuthenticated: true,
      isLoading: false,
    }),

  setTokens: (tokens) => set({ tokens }),

  setUser: (user) => set({ user }),

  setLoading: (loading) => set({ isLoading: loading }),

  logout: () =>
    set({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
    }),
}));
