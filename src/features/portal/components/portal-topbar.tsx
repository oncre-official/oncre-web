"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { site } from "@/config/site";
import { useSessionStore } from "@/lib/stores/session-store";

export function PortalTopbar() {
  const router = useRouter();
  const account = useSessionStore((s) => s.account);
  const logout = useSessionStore((s) => s.logout);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <header className="border-b border-ink-100 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <span className="text-lg font-bold text-brand-700">{site.name}</span>
        <div className="flex items-center gap-4">
          {account && (
            <span className="hidden text-sm text-ink-700 sm:inline">{account.business_name}</span>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-900"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
