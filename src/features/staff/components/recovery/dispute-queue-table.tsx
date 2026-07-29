"use client";

import { Table, TableBody, TableCell, TableEmptyState, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { escalateDispute, resolveDispute } from "@/lib/api/staff/cases";
import { formatNaira } from "@/lib/utils/currency";
import { handleStaffApiError } from "@/lib/utils/staff-error";
import { toast } from "@/lib/stores/toast-store";
import type { Case } from "@/types/case";

interface DisputeQueueTableProps {
  cases: Case[];
  canAct: boolean;
  onChanged: () => void;
}

export function DisputeQueueTable({ cases, canAct, onChanged }: DisputeQueueTableProps) {
  const handleResolve = async (caze: Case) => {
    if (!caze.dispute) return;
    try {
      await resolveDispute(caze.dispute._id);
      toast.success(`Dispute resolved for ${caze.case_id}.`);
      onChanged();
    } catch (error) {
      handleStaffApiError(error);
    }
  };

  const handleEscalate = async (caze: Case) => {
    if (!caze.dispute) return;
    try {
      await escalateDispute(caze.dispute._id);
      toast.success(`Dispute escalated for ${caze.case_id}.`);
      onChanged();
    } catch (error) {
      handleStaffApiError(error);
    }
  };

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Case ID</TableHeaderCell>
          <TableHeaderCell>Debtor</TableHeaderCell>
          <TableHeaderCell>Amount</TableHeaderCell>
          <TableHeaderCell>Note</TableHeaderCell>
          {canAct && <TableHeaderCell>Actions</TableHeaderCell>}
        </TableRow>
      </TableHead>
      <TableBody>
        {cases.length === 0 ? (
          <TableEmptyState colSpan={canAct ? 5 : 4} message="No disputes awaiting review." />
        ) : (
          cases.map((caze) => (
            <TableRow key={caze._id}>
              <TableCell className="font-mono text-xs">{caze.case_id}</TableCell>
              <TableCell>{caze.debtor_name}</TableCell>
              <TableCell className="tabular-nums">{formatNaira(caze.amount)}</TableCell>
              <TableCell className="max-w-xs truncate text-ink-500">{caze.dispute?.note || "—"}</TableCell>
              {canAct && (
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleResolve(caze)}>
                      Resolve
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleEscalate(caze)}>
                      Escalate
                    </Button>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
