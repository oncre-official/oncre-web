"use client";

import { format } from "date-fns";
import { AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { CreatePaymentPlanModal } from "@/features/staff/components/create-payment-plan-modal";
import { escalateDispute, getDebtEvaluation, resolveDispute } from "@/lib/api/staff/cases";
import { useStaffSessionStore } from "@/lib/stores/staff-session-store";
import { formatNaira } from "@/lib/utils/currency";
import { getCaseStatusLabel, getCaseStatusTone } from "@/lib/utils/case-status-tone";
import { handleStaffApiError } from "@/lib/utils/staff-error";
import { CASE_ACTION_ROLES, hasRole, PAYMENT_PLAN_CREATE_ROLES } from "@/lib/utils/staff-permissions";
import { toast } from "@/lib/stores/toast-store";
import type { Call } from "@/types/call";
import { CaseStatus, type Case, type DebtEvaluation } from "@/types/case";

import { TransitionCaseForm } from "./transition-case-form";

interface StaffCaseDetailDrawerProps {
  caze: Case | null;
  /** Next open (scheduled/pending) call for this case, when known — omitted for roles that can't view call logs. */
  nextCall?: Call;
  onClose: () => void;
  onChanged: () => void;
}

export function StaffCaseDetailDrawer({ caze, nextCall, onClose, onChanged }: StaffCaseDetailDrawerProps) {
  const roleName = useStaffSessionStore((s) => s.user?.role?.name);
  const canAct = hasRole(roleName, CASE_ACTION_ROLES);
  const canConvertToPlan = hasRole(roleName, PAYMENT_PLAN_CREATE_ROLES);

  const [evaluation, setEvaluation] = useState<DebtEvaluation | null>(null);
  const [planModalOpen, setPlanModalOpen] = useState(false);

  useEffect(() => {
    if (!caze) return;

    let cancelled = false;
    getDebtEvaluation(caze._id)
      .then((result) => {
        if (!cancelled) setEvaluation(result);
      })
      .catch(() => {
        if (!cancelled) setEvaluation(null);
      });
    return () => {
      cancelled = true;
    };
  }, [caze]);

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
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">Next scheduled call</dt>
            <dd className="text-ink-800">
              {nextCall ? format(new Date(nextCall.scheduled_for!), "d MMM yyyy, h:mm a") : "—"}
            </dd>
          </div>
        </dl>

        {evaluation && (
          <div className="rounded-lg bg-ink-50 p-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-500">Debt evaluation</p>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div>
                <dt className="text-xs text-ink-500">Debt age</dt>
                <dd className="text-ink-800">{evaluation.debt_age_years} yrs · {evaluation.bracket}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-500">Commission weight</dt>
                <dd className="text-ink-800">{evaluation.commission_weight}×</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-xs text-ink-500">Weighted commission estimate</dt>
                <dd className="font-medium text-ink-900">{formatNaira(evaluation.weighted_commission_estimate)}</dd>
              </div>
            </dl>
          </div>
        )}

        {canConvertToPlan && caze.status === CaseStatus.ACTIVE && !caze.payment_plan_id && (
          <Button variant="secondary" onClick={() => setPlanModalOpen(true)}>
            Convert to payment plan
          </Button>
        )}

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

      {canConvertToPlan && (
        <CreatePaymentPlanModal
          key={caze._id}
          open={planModalOpen}
          defaultCaseId={caze.case_id}
          onClose={() => setPlanModalOpen(false)}
          onCreated={() => {
            setPlanModalOpen(false);
            onChanged();
          }}
        />
      )}
    </Drawer>
  );
}
