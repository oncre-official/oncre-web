"use client";

import { format } from "date-fns";
import {
  AlertOctagon,
  Briefcase,
  CalendarClock,
  CheckCircle2,
  PauseCircle,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { ComponentType } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableEmptyState, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";
import { staffNavItems } from "@/features/staff/config/nav";
import { listCases } from "@/lib/api/staff/cases";
import { getDashboardSummary } from "@/lib/api/staff/dashboard";
import { useStaffSessionStore } from "@/lib/stores/staff-session-store";
import { getCaseStatusLabel, getCaseStatusTone } from "@/lib/utils/case-status-tone";
import { formatNaira, formatNairaCompact } from "@/lib/utils/currency";
import { formatCompactNumber } from "@/lib/utils/format";
import { handleStaffApiError } from "@/lib/utils/staff-error";
import {
  CASE_LIST_ROLES,
  DASHBOARD_PAYMENT_ROLES,
  DASHBOARD_QUICK_ACTIONS,
  hasRole,
} from "@/lib/utils/staff-permissions";
import type { Case } from "@/types/case";
import type { DashboardSummary } from "@/types/dashboard";

interface KpiTile {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
  chipBg: string;
  chipText: string;
}

export function StaffDashboard() {
  const roleName = useStaffSessionStore((s) => s.user?.role?.name);
  const canViewCases = hasRole(roleName, CASE_LIST_ROLES);
  const canViewPayments = hasRole(roleName, DASHBOARD_PAYMENT_ROLES);

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recentCases, setRecentCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = useCallback(() => {
    const requests: Promise<void>[] = [getDashboardSummary().then((result) => setSummary(result))];

    if (canViewCases) {
      requests.push(
        listCases({ limit: 200 }).then((result) => {
          const sorted = [...result.row].sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));
          setRecentCases(sorted.slice(0, 5));
        }),
      );
    }

    return Promise.allSettled(requests).then((results) => {
      const failure = results.find((r): r is PromiseRejectedResult => r.status === "rejected");
      if (failure) handleStaffApiError(failure.reason);
    });
  }, [canViewCases]);

  useEffect(() => {
    loadDashboard().finally(() => setLoading(false));
  }, [loadDashboard]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboard().finally(() => setRefreshing(false));
  };

  const quickActions = DASHBOARD_QUICK_ACTIONS.filter((item) => hasRole(roleName, item.allowedRoles));
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

  const kpis = summary?.kpis;

  const tiles: KpiTile[] = [
    {
      label: "Total Active Cases",
      value: formatCompactNumber(kpis?.total_active_cases ?? 0),
      icon: Briefcase,
      chipBg: "bg-brand-50",
      chipText: "text-brand-700",
    },
    {
      label: "Total Recovered This Month",
      value: formatCompactNumber(kpis?.total_recovered_this_month ?? 0),
      icon: CheckCircle2,
      chipBg: "bg-status-good-soft",
      chipText: "text-status-good",
    },
    {
      label: "Cases in Call Queue Today",
      value: formatCompactNumber(kpis?.cases_in_call_queue_today ?? 0),
      icon: CalendarClock,
      chipBg: "bg-brand-50",
      chipText: "text-brand-700",
    },
    {
      label: "Passive Cases",
      value: formatCompactNumber(kpis?.passive_cases ?? 0),
      icon: PauseCircle,
      chipBg: "bg-status-warning-soft",
      chipText: "text-status-warning",
    },
  ];

  const pipeline = summary?.payment_pipeline;
  const upcomingPayments = summary?.upcoming_payments ?? [];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-ink-900">Dashboard</h1>
          {summary?.generated_at && (
            <p className="text-xs text-ink-400">Updated as of {format(new Date(summary.generated_at), "d MMM yyyy, h:mm a")}</p>
          )}
        </div>
        <Button variant="secondary" size="sm" loading={refreshing} onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {tiles.map((tile) => (
          <Card key={tile.label} className="p-4">
            <div className="flex items-start justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-500">{tile.label}</p>
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tile.chipBg}`}>
                <tile.icon className={`h-4 w-4 ${tile.chipText}`} />
              </span>
            </div>
            <p className="mt-2 text-[28px] font-semibold leading-tight text-ink-900">{tile.value}</p>
          </Card>
        ))}
      </div>

      {canViewCases && summary?.escalation_pipeline && (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-ink-900">Recovery pipeline by tier</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {summary.escalation_pipeline.map((bucket) => (
              <Card key={bucket.level} className="p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-ink-500">L{bucket.level}</p>
                <p className="mt-2 text-2xl font-semibold tabular-nums text-ink-900">{bucket.count}</p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {canViewPayments && pipeline && (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-ink-900">Payment pipeline</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card className="flex items-center gap-3 p-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-status-good-soft">
                <CheckCircle2 className="h-4 w-4 text-status-good" />
              </span>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-ink-500">Received</p>
                <p className="text-lg font-semibold text-ink-900">
                  {pipeline.received.count} · {formatNairaCompact(pipeline.received.total)}
                </p>
              </div>
            </Card>
            <Card className="flex items-center gap-3 p-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-status-warning-soft">
                <CalendarClock className="h-4 w-4 text-status-warning" />
              </span>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-ink-500">Pending</p>
                <p className="text-lg font-semibold text-ink-900">
                  {pipeline.pending.count} · {formatNairaCompact(pipeline.pending.total)}
                </p>
              </div>
            </Card>
            <Card className="flex items-center gap-3 p-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-status-critical-soft">
                <AlertOctagon className="h-4 w-4 text-status-critical" />
              </span>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-ink-500">Missed</p>
                <p className="text-lg font-semibold text-ink-900">
                  {pipeline.missed.count} · {formatNairaCompact(pipeline.missed.total)}
                </p>
              </div>
            </Card>
          </div>
        </div>
      )}

      {canViewPayments && (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-ink-900">Upcoming payments this week</h2>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Debtor</TableHeaderCell>
                <TableHeaderCell>Amount</TableHeaderCell>
                <TableHeaderCell>Due date</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {upcomingPayments.length === 0 ? (
                <TableEmptyState colSpan={3} message="No tranches due this week." />
              ) : (
                upcomingPayments.map((payment) => (
                  <TableRow key={payment.installment_id}>
                    <TableCell>{payment.debtor_name}</TableCell>
                    <TableCell className="tabular-nums">{formatNaira(payment.amount)}</TableCell>
                    <TableCell>{format(new Date(payment.due_date), "d MMM yyyy")}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {quickActions.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-ink-900">Quick actions</h2>
          <div className="flex flex-wrap gap-3">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href}>
                <Button variant="secondary">{action.label}</Button>
              </Link>
            ))}
          </div>
        </div>
      )}

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
                  href="/staff/recovery"
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
