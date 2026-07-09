import { create } from "zustand";

import { getSession, logout as apiLogout } from "@/lib/api/portal";
import type { PortalAccount } from "@/types/portal";

interface SessionState {
  account: PortalAccount | null;
  status: "idle" | "loading" | "ready";
  hydrate: () => Promise<void>;
  setAccount: (account: PortalAccount | null) => void;
  logout: () => Promise<void>;
}

/** Client-side mirror of the httpOnly portal session cookie (see /api/auth/session). */
export const useSessionStore = create<SessionState>((set) => ({
  account: null,
  status: "idle",
  async hydrate() {
    set({ status: "loading" });
    try {
      const { account } = await getSession();
      set({ account, status: "ready" });
    } catch {
      set({ account: null, status: "ready" });
    }
  },
  setAccount(account) {
    set({ account });
  },
  async logout() {
    await apiLogout();
    set({ account: null });
  },
}));
