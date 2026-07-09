import { create } from "zustand";

import { getSession, logout as apiLogout } from "@/lib/api/staff/auth";
import type { OncreUser } from "@/types/user";

interface StaffSessionState {
  user: OncreUser | null;
  status: "idle" | "loading" | "ready";
  hydrate: () => Promise<void>;
  setUser: (user: OncreUser | null) => void;
  logout: () => Promise<void>;
}

/** Client-side mirror of the httpOnly staff session cookie (see /api/staff/auth/session). */
export const useStaffSessionStore = create<StaffSessionState>((set) => ({
  user: null,
  status: "idle",
  async hydrate() {
    set({ status: "loading" });
    try {
      const { user } = await getSession();
      set({ user, status: "ready" });
    } catch {
      set({ user: null, status: "ready" });
    }
  },
  setUser(user) {
    set({ user });
  },
  async logout() {
    await apiLogout();
    set({ user: null });
  },
}));
