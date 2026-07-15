/**
 * TradeScope AI — Account Store
 * Tracks the currently selected trading account.
 */
import { create } from "zustand";

export interface SelectedAccount {
  id: string;
  account_number: string;
  account_name: string;
  environment: string;
  base_currency: string;
  leverage: number;
  position_mode: string;
  status: string;
}

interface AccountState {
  selected: SelectedAccount | null;
  setSelected: (account: SelectedAccount | null) => void;
}

const KEY = "tradescope_selected_account";

// Load from localStorage
const load = (): SelectedAccount | null => {
  try {
    const d = localStorage.getItem(KEY);
    if (d) return JSON.parse(d);
  } catch {}
  return null;
};

export const useAccountStore = create<AccountState>((set) => ({
  selected: load(),
  setSelected: (account) => {
    try {
      if (account) localStorage.setItem(KEY, JSON.stringify(account));
      else localStorage.removeItem(KEY);
    } catch {}
    set({ selected: account });
  },
}));
