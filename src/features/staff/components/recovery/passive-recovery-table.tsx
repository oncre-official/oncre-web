"use client";

import { format } from "date-fns";
import { useEffect, useState } from "react";

import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableEmptyState, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";
import { listMessages } from "@/lib/api/staff/messages";
import { formatNaira } from "@/lib/utils/currency";
import type { Case } from "@/types/case";
import { MessageType } from "@/types/message";

interface PassiveRecoveryTableProps {
  cases: Case[];
}

export function PassiveRecoveryTable({ cases }: PassiveRecoveryTableProps) {
  const [nextSend, setNextSend] = useState<Record<string, string | undefined>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (cases.length === 0) return;

    let cancelled = false;

    Promise.all(
      cases.map(async (caze) => {
        const result = await listMessages({
          case_id: caze.case_id,
          message_type: MessageType.PASSIVE_RECOVERY,
          limit: 10,
        }).catch(() => ({ row: [], count: 0 }));

        const now = Date.now();
        const upcoming = result.row
          .filter((message) => message.scheduled_for && new Date(message.scheduled_for).getTime() >= now)
          .sort((a, b) => new Date(a.scheduled_for ?? 0).getTime() - new Date(b.scheduled_for ?? 0).getTime());

        return [caze.case_id, upcoming[0]?.scheduled_for] as const;
      }),
    ).then((results) => {
      if (cancelled) return;
      setNextSend(Object.fromEntries(results));
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
          <TableHeaderCell>Amount</TableHeaderCell>
          <TableHeaderCell>Next Monday SMS</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {cases.length === 0 ? (
          <TableEmptyState colSpan={4} message="No cases on the passive recovery cadence." />
        ) : (
          cases.map((caze) => {
            const scheduledFor = nextSend[caze.case_id];
            return (
              <TableRow key={caze._id}>
                <TableCell className="font-mono text-xs">{caze.case_id}</TableCell>
                <TableCell>{caze.debtor_name}</TableCell>
                <TableCell className="tabular-nums">{formatNaira(caze.amount)}</TableCell>
                <TableCell>{scheduledFor ? format(new Date(scheduledFor), "d MMM yyyy") : "—"}</TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}
