"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { staffNavItems } from "@/features/staff/config/nav";
import { useStaffSessionStore } from "@/lib/stores/staff-session-store";
import { cn } from "@/lib/utils/cn";
import { hasRole } from "@/lib/utils/staff-permissions";

export function StaffSidenav() {
  const pathname = usePathname();
  const roleName = useStaffSessionStore((s) => s.user?.role?.name);

  const items = staffNavItems.filter((item) => !item.allowedRoles || hasRole(roleName, item.allowedRoles));

  return (
    <nav className="flex w-56 shrink-0 flex-col gap-1 border-r border-ink-100 bg-white p-3">
      {items.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/staff" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive ? "bg-brand-50 text-brand-700" : "text-ink-700 hover:bg-ink-50",
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
