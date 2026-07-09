"use client";

import { Briefcase, CheckCircle2, FolderKanban, ShieldCheck, TrendingUp, Users, Wallet } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { ComponentType } from "react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Meter } from "@/components/ui/meter";
import { Spinner } from "@/components/ui/spinner";
import { staffNavItems } from "@/features/staff/config/nav";
import { listStaffUsers } from "@/lib/api/staff/admin-users";
import { listCases } from "@/lib/api/staff/cases";
import { listCustomers } from "@/lib/api/staff/customers";
import { listMerchants } from "@/lib/api/staff/merchants";
import { listPayments } from "@/lib/api/staff/payments";
import { useStaffSessionStore } from "@/lib/stores/staff-session-store";
import { getCaseStatusLabel, getCaseStatusTone } from "@/lib/utils/case-status-tone";
import { formatNairaCompact } from "@/lib/utils/currency";
import { formatCompactNumber } from "@/lib/utils/format";
import { computeDashboardKpis } from "@/lib/utils/kpi";
import { ADMIN_USER_ROLES, CASE_LIST_ROLES, hasRole } from "@/lib/utils/staff-permissions";
import type { Case } from "@/types/case";
import { PaymentStatus } from "@/types/payment";

interface StatTile {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
  chipBg: string;
  chipText: string;
  meter?: number;
}

export function StaffDashboard() {
  const roleName = useStaffSessionStore((s) => s.user?.role?.name);
  const canViewCases = hasRole(roleName, CASE_LIST_ROLES);
  const canViewAdminUsers = hasRole(roleName, ADMIN_USER_ROLES);

  const [loading, setLoading] = useState(true);
  const [merchantCount, setMerchantCount] = useState(0);
  const [customerCount, setCustomerCount] = useState(0);
  const [cases, setCases] = useState<Case[]>([]);
  const [paymentsCollected, setPaymentsCollected] = useState(0);
  const [staffUserCount, setStaffUserCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const requests: Promise<void>[] = [
      listMerchants({ limit: 1 }).then((r) => {
        if (!cancelled) setMerchantCount(r.count);
      }),
      listCustomers({ limit: 1 }).then((r) => {
        if (!cancelled) setCustomerCount(r.count);
      }),
      listPayments({ limit: 200 }).then((r) => {
        if (!cancelled) {
          const collected = r.row.filter((p) => p.status === PaymentStatus.PAID).reduce((sum, p) => sum + p.amount, 0);
          setPaymentsCollected(collected);
        }
      }),
    ];

    if (canViewCases) {
      requests.push(
        listCases({ limit: 200 }).then((r) => {
          if (!cancelled) setCases(r.row);
        }),
      );
    }
    if (canViewAdminUsers) {
      requests.push(
        listStaffUsers({ limit: 1 }).then((r) => {
          if (!cancelled) setStaffUserCount(r.count);
        }),
      );
    }

    Promise.allSettled(requests).then(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [canViewCases, canViewAdminUsers]);

  const caseKpis = computeDashboardKpis(cases);
  const recentCases = [...cases]
    .sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""))
    .slice(0, 5);

  const tiles: StatTile[] = [
    {
      label: "Total merchants",
      value: formatCompactNumber(merchantCount),
      icon: Briefcase,
      chipBg: "bg-brand-50",
      chipText: "text-brand-700",
    },
    {
      label: "Total customers",
      value: formatCompactNumber(customerCount),
      icon: Users,
      chipBg: "bg-brand-50",
      chipText: "text-brand-700",
    },
    {
      label: "Payments collected",
      value: formatNairaCompact(paymentsCollected),
      icon: Wallet,
      chipBg: "bg-status-good-soft",
      chipText: "text-status-good",
    },
  ];

  if (canViewCases) {
    tiles.push(
      {
        label: "Total cases",
        value: formatCompactNumber(caseKpis.totalCases),
        icon: FolderKanban,
        chipBg: "bg-brand-50",
        chipText: "text-brand-700",
      },
      {
        label: "Cases resolved",
        value: formatCompactNumber(caseKpis.casesResolved),
        icon: CheckCircle2,
        chipBg: "bg-status-good-soft",
        chipText: "text-status-good",
      },
      {
        label: "Recovery rate",
        value: `${caseKpis.recoveryRate}%`,
        icon: TrendingUp,
        chipBg: "bg-status-good-soft",
        chipText: "text-status-good",
        meter: caseKpis.recoveryRate,
      },
    );
  }

  if (canViewAdminUsers) {
    tiles.push({
      label: "Staff users",
      value: formatCompactNumber(staffUserCount),
      icon: ShieldCheck,
      chipBg: "bg-brand-50",
      chipText: "text-brand-700",
    });
  }

  const quickLinks = staffNavItems.filter(
    (item) => item.href !== "/staff" && (!item.allowedRoles || hasRole(roleName, item.allowedRoles)),
  );

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="h-6 w-6 text-brand-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {tiles.map((tile) => (
          <Card key={tile.label} className="p-4">
            <div className="flex items-start justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-500">{tile.label}</p>
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tile.chipBg}`}>
                <tile.icon className={`h-4 w-4 ${tile.chipText}`} />
              </span>
            </div>
            <p className="mt-2 text-[28px] font-semibold leading-tight text-ink-900">{tile.value}</p>
            {tile.meter !== undefined && (
              <Meter value={tile.meter} fillClassName="bg-status-good" trackClassName="bg-status-good-soft" className="mt-3" />
            )}
          </Card>
        ))}
      </div>

      {canViewCases && (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-ink-900">Recent cases</h2>
          {recentCases.length === 0 ? (
            <p className="text-sm text-ink-500">No cases yet.</p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-ink-100 bg-white">
              {recentCases.map((caze) => (
                <Link
                  key={caze._id}
                  href="/staff/cases"
                  className="flex items-center justify-between border-b border-ink-100 px-4 py-3 text-sm last:border-b-0 hover:bg-ink-50"
                >
                  <span className="font-mono text-xs text-ink-500">{caze.case_id}</span>
                  <span className="flex-1 px-4 text-ink-800">{caze.debtor_name}</span>
                  <Badge tone={getCaseStatusTone(caze.status)}>{getCaseStatusLabel(caze.status)}</Badge>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      <div>
        <h2 className="mb-3 text-sm font-semibold text-ink-900">Quick links</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {quickLinks.map((item) => (
            <Link key={item.href} href={item.href}>
              <Card className="flex flex-col items-center gap-2 p-5 text-center transition-shadow hover:shadow-md">
                <item.icon className="h-6 w-6 text-brand-700" />
                <span className="text-sm font-medium text-ink-800">{item.label}</span>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
