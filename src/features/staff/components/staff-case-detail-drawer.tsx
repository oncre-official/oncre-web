"use client";

import { format } from "date-fns";
import { AlertTriangle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { escalateDispute, resolveDispute } from "@/lib/api/staff/cases";
import { useStaffSessionStore } from "@/lib/stores/staff-session-store";
import { formatNaira } from "@/lib/utils/currency";
import { getCaseStatusLabel, getCaseStatusTone } from "@/lib/utils/case-status-tone";
import { handleStaffApiError } from "@/lib/utils/staff-error";
import { CASE_ACTION_ROLES, hasRole } from "@/lib/utils/staff-permissions";
import { toast } from "@/lib/stores/toast-store";
import { CaseStatus, type Case } from "@/types/case";

import { TransitionCaseForm } from "./transition-case-form";

interface StaffCaseDetailDrawerProps {
  caze: Case | null;
  onClose: () => void;
  onChanged: () => void;
}

export function StaffCaseDetailDrawer({ caze, onClose, onChanged }: StaffCaseDetailDrawerProps) {
  const roleName = useStaffSessionStore((s) => s.user?.role?.name);
  const canAct = hasRole(roleName, CASE_ACTION_ROLES);

  if (!caze) return null;

  const handleResolve = async () => {
    if (!caze.dispute) return;
    try {
      await resolveDispute(caze.dispute._id);
      toast.success("Dispute resolved successfully.");
      onChanged();
    } catch (error) {
      handleStaffApiError(error);
    }
  };

  const handleEscalate = async () => {
    if (!caze.dispute) return;
    try {
      await escalateDispute(caze.dispute._id);
      toast.success("Dispute escalated successfully.");
      onChanged();
    } catch (error) {
      handleStaffApiError(error);
    }
  };

  return (
    <Drawer open={!!caze} onClose={onClose} title={caze.debtor_name}>
      <div className="flex flex-col gap-6">
        <div className="flex items-start justify-between gap-4 rounded-xl bg-ink-50 p-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-ink-500">Amount owed</p>
            <p className="text-2xl font-semibold tabular-nums text-ink-900">{formatNaira(caze.amount)}</p>
          </div>
          <Badge tone={getCaseStatusTone(caze.status)} className="mt-1">
            {getCaseStatusLabel(caze.status)}
          </Badge>
        </div>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">Case ID</dt>
            <dd className="font-mono text-ink-800">{caze.case_id}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">Day in phase</dt>
            <dd className="text-ink-800">Day {caze.current_day}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">Merchant</dt>
            <dd className="text-ink-800">{caze.merchant?.merchant_name ?? caze.merchant_id}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">Debtor phone</dt>
            <dd className="text-ink-800">{caze.debtor_phone}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">Due date</dt>
            <dd className="text-ink-800">{format(new Date(caze.due_date), "d MMM yyyy")}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">Escalation level</dt>
            <dd className="text-ink-800">Tier {caze.escalation_level}</dd>
          </div>
        </dl>

        {caze.dispute && (
          <div className="flex flex-col gap-3 rounded-lg bg-status-warning-soft p-4">
            <div className="flex items-start gap-2 text-sm text-ink-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-status-warning" />
              <span>Open dispute: {caze.dispute.note ?? "No note provided"}</span>
            </div>
            {canAct && (
              <div className="flex gap-2">
                <Button size="sm" onClick={handleResolve}>
                  Resolve dispute
                </Button>
                <Button size="sm" variant="danger" onClick={handleEscalate}>
                  Escalate to legal
                </Button>
              </div>
            )}
          </div>
        )}

        {caze.status === CaseStatus.PENDING_TRANSITION && canAct && (
          <TransitionCaseForm caseObjectId={caze._id} onDone={onChanged} />
        )}

        {!canAct && (
          <p className="text-xs text-ink-400">
            Your role can view this case but not act on disputes or transitions.
          </p>
        )}
      </div>
    </Drawer>
  );
}
