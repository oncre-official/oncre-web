import {
  Banknote,
  Briefcase,
  CreditCard,
  FolderKanban,
  LayoutDashboard,
  MessageSquare,
  Phone,
  ShieldCheck,
  User,
  Users,
  UserSquare,
} from "lucide-react";
import type { ComponentType } from "react";

import { ADMIN_USER_ROLES, CASE_LIST_ROLES } from "@/lib/utils/staff-permissions";

export interface StaffNavItem {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  /** Omitted = visible to any authenticated staff member. */
  allowedRoles?: readonly string[];
}

/** UX-only nav filtering — see staff-permissions.ts for why hiding an item is never the real access boundary. */
export const staffNavItems: StaffNavItem[] = [
  { label: "Home", href: "/staff", icon: LayoutDashboard },
  { label: "Merchants", href: "/staff/merchants", icon: Briefcase },
  { label: "Customers", href: "/staff/customers", icon: Users },
  { label: "Cases", href: "/staff/cases", icon: FolderKanban, allowedRoles: CASE_LIST_ROLES },
  { label: "Calls", href: "/staff/calls", icon: Phone },
  { label: "Messages", href: "/staff/messages", icon: MessageSquare },
  { label: "Payments", href: "/staff/payments", icon: Banknote },
  { label: "Credits", href: "/staff/credits", icon: CreditCard },
  { label: "Admin Users", href: "/staff/admin/users", icon: ShieldCheck, allowedRoles: ADMIN_USER_ROLES },
  { label: "Roles", href: "/staff/roles", icon: UserSquare },
  { label: "Profile", href: "/staff/profile", icon: User },
];
