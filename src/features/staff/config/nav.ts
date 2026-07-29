import {
  Banknote,
  Bell,
  CreditCard,
  FolderKanban,
  LayoutDashboard,
  Receipt,
  Search,
  Settings as SettingsIcon,
  User,
  Users,
  UserSquare,
} from "lucide-react";
import type { ComponentType } from "react";

import {
  AOP_SUBMISSIONS_ROLES,
  CASE_LIST_ROLES,
  PAYMENT_VIEW_ROLES,
  SETTINGS_MODULE_ROLES,
  USERS_MODULE_ROLES,
} from "@/lib/utils/staff-permissions";

export interface StaffNavItem {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  /** Omitted = visible to any authenticated staff member. */
  allowedRoles?: readonly string[];
  /** "module" = one of the SOW's 6 operational modules; "utility" = pre-existing functionality not yet folded into a module. */
  section: "module" | "utility";
}

/**
 * The 6 SOW modules (Dashboard, Users, Recovery, Reminder, Payment, Settings)
 * in order, followed by pre-existing utility pages not restructured this pass.
 * Reminder/Payment/Settings still point at today's pages until their own
 * build phase. UX-only nav filtering — see staff-permissions.ts for why
 * hiding an item is never the real access boundary.
 */
export const staffNavItems: StaffNavItem[] = [
  { label: "Dashboard", href: "/staff", icon: LayoutDashboard, section: "module" },
  { label: "Users", href: "/staff/users", icon: Users, allowedRoles: USERS_MODULE_ROLES, section: "module" },
  { label: "Recovery", href: "/staff/recovery", icon: FolderKanban, allowedRoles: CASE_LIST_ROLES, section: "module" },
  { label: "Reminder", href: "/staff/messages", icon: Bell, section: "module" },
  { label: "Payment", href: "/staff/payments", icon: Banknote, allowedRoles: PAYMENT_VIEW_ROLES, section: "module" },
  {
    label: "Settings",
    href: "/staff/admin/users",
    icon: SettingsIcon,
    allowedRoles: SETTINGS_MODULE_ROLES,
    section: "module",
  },
  {
    label: "Roles",
    href: "/staff/roles",
    icon: UserSquare,
    allowedRoles: SETTINGS_MODULE_ROLES,
    section: "module",
  },

  { label: "Search", href: "/staff/search", icon: Search, section: "utility" },
  {
    label: "Field Agent Payments",
    href: "/staff/activation-submissions",
    icon: Receipt,
    allowedRoles: AOP_SUBMISSIONS_ROLES,
    section: "utility",
  },
  { label: "Credits", href: "/staff/credits", icon: CreditCard, section: "utility" },
  { label: "Profile", href: "/staff/profile", icon: User, section: "utility" },
];
