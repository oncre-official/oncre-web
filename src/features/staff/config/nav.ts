import {
  Banknote,
  Briefcase,
  CreditCard,
  FolderKanban,
  LayoutDashboard,
  MessageSquare,
  Phone,
  Receipt,
  Search,
  ShieldCheck,
  User,
  Users,
  UserSquare,
} from "lucide-react";
import type { ComponentType } from "react";

import {
  ADMIN_USER_ROLES,
  AOP_SUBMISSIONS_ROLES,
  CALL_PRIVILEGED_ROLES,
  CASE_LIST_ROLES,
  PAYMENT_VIEW_ROLES,
} from "@/lib/utils/staff-permissions";

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
  { label: "Search", href: "/staff/search", icon: Search },
  { label: "Merchants", href: "/staff/merchants", icon: Briefcase },
  { label: "Customers", href: "/staff/customers", icon: Users },
  { label: "Cases", href: "/staff/cases", icon: FolderKanban, allowedRoles: CASE_LIST_ROLES },
  { label: "Calls", href: "/staff/calls", icon: Phone, allowedRoles: CALL_PRIVILEGED_ROLES },
  { label: "Messages", href: "/staff/messages", icon: MessageSquare },
  { label: "Payments", href: "/staff/payments", icon: Banknote, allowedRoles: PAYMENT_VIEW_ROLES },
  {
    label: "Field Agent Payments",
    href: "/staff/activation-submissions",
    icon: Receipt,
    allowedRoles: AOP_SUBMISSIONS_ROLES,
  },
  { label: "Credits", href: "/staff/credits", icon: CreditCard },
  { label: "Admin Users", href: "/staff/admin/users", icon: ShieldCheck, allowedRoles: ADMIN_USER_ROLES },
  { label: "Roles", href: "/staff/roles", icon: UserSquare },
  { label: "Profile", href: "/staff/profile", icon: User },
];
