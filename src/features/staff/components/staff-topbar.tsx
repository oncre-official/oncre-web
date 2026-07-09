"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { site } from "@/config/site";
import { useStaffSessionStore } from "@/lib/stores/staff-session-store";

export function StaffTopbar() {
  const router = useRouter();
  const user = useStaffSessionStore((s) => s.user);
  const logout = useStaffSessionStore((s) => s.logout);

  const handleLogout = async () => {
    await logout();
    router.push("/staff/login");
  };

  return (
    <header className="border-b border-ink-100 bg-white">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-brand-700">{site.name}</span>
          <span className="text-sm text-ink-400">Staff Console</span>
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <div className="hidden items-center gap-2 sm:flex">
              <span className="text-sm text-ink-700">{user.email ?? user.phone}</span>
              {user.role && <Badge tone="brand">{user.role.name}</Badge>}
            </div>
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
