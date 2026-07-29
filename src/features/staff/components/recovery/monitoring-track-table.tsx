"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableEmptyState, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";
import { listInstallments } from "@/lib/api/staff/payments";
import { formatNaira } from "@/lib/utils/currency";
import type { Case } from "@/types/case";
import { InstallmentPaymentStatus } from "@/types/payment";

interface MonitoringTrackTableProps {
  cases: Case[];
}

interface InstallmentSummary {
  paid: number;
  pending: number;
  overdue: number;
}

export function MonitoringTrackTable({ cases }: MonitoringTrackTableProps) {
  const [summaries, setSummaries] = useState<Record<string, InstallmentSummary>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (cases.length === 0) return;

    let cancelled = false;

    Promise.all(
      cases.map(async (caze) => {
        const installments = await listInstallments(caze.case_id).catch(() => []);
        const summary = installments.reduce<InstallmentSummary>(
          (acc, installment) => {
            if (installment.status === InstallmentPaymentStatus.PAID) acc.paid += 1;
            else if (installment.status === InstallmentPaymentStatus.OVERDUE) acc.overdue += 1;
            else acc.pending += 1;
            return acc;
          },
          { paid: 0, pending: 0, overdue: 0 },
        );
        return [caze.case_id, summary] as const;
      }),
    ).then((results) => {
      if (cancelled) return;
      setSummaries(Object.fromEntries(results));
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [cases]);

  if (loading && cases.length > 0) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="h-6 w-6 text-brand-600" />
      </div>
    );
  }

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Case ID</TableHeaderCell>
          <TableHeaderCell>Debtor</TableHeaderCell>
          <TableHeaderCell>Outstanding</TableHeaderCell>
          <TableHeaderCell>Instalments</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {cases.length === 0 ? (
          <TableEmptyState colSpan={4} message="No cases on active payment plans." />
        ) : (
          cases.map((caze) => {
            const summary = summaries[caze.case_id] ?? { paid: 0, pending: 0, overdue: 0 };
            return (
              <TableRow key={caze._id}>
                <TableCell className="font-mono text-xs">{caze.case_id}</TableCell>
                <TableCell>{caze.debtor_name}</TableCell>
                <TableCell className="tabular-nums">{formatNaira(caze.outstanding_balance ?? caze.amount)}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge tone="good">{summary.paid} paid</Badge>
                    <Badge tone="warning">{summary.pending} pending</Badge>
                    <Badge tone="critical">{summary.overdue} overdue</Badge>
                  </div>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}
