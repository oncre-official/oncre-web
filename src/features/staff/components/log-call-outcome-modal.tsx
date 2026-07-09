"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { logCallOutcome } from "@/lib/api/staff/calls";
import { toast } from "@/lib/stores/toast-store";
import { handleStaffApiError } from "@/lib/utils/staff-error";
import { logCallOutcomeSchema, LogCallOutcomeFormValues } from "@/lib/validation/staff.schema";
import { CallLogOutcome } from "@/types/call";

interface LogCallOutcomeModalProps {
  callId: string | null;
  onClose: () => void;
  onLogged: () => void;
}

const OUTCOME_LABELS: Record<CallLogOutcome, string> = {
  [CallLogOutcome.PROMISED_TO_PAY]: "Promised to pay",
  [CallLogOutcome.PAYMENT_PLAN]: "Requested payment plan",
  [CallLogOutcome.PARTIAL_PAYMENT]: "Partial payment",
  [CallLogOutcome.FULL_PAYMENT]: "Full payment",
  [CallLogOutcome.NO_ANSWER]: "No answer",
  [CallLogOutcome.CALL_BACK_LATER]: "Call back later",
  [CallLogOutcome.REFUSED]: "Refused",
  [CallLogOutcome.DISPUTED]: "Disputed",
  [CallLogOutcome.UNREACHABLE]: "Unreachable",
  [CallLogOutcome.NUMBER_INVALID]: "Number invalid",
};

export function LogCallOutcomeModal({ callId, onClose, onLogged }: LogCallOutcomeModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LogCallOutcomeFormValues>({ resolver: zodResolver(logCallOutcomeSchema) });

  const onSubmit = async (values: LogCallOutcomeFormValues) => {
    if (!callId) return;
    try {
      await logCallOutcome({ ...values, call_id: callId });
      toast.success("Call outcome logged successfully.");
      reset();
      onLogged();
    } catch (error) {
      handleStaffApiError(error);
    }
  };

  return (
    <Modal open={!!callId} onClose={onClose} title="Log call outcome">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <Field label="Outcome" htmlFor="outcome" required error={errors.outcome?.message}>
          <Select id="outcome" defaultValue="" invalid={!!errors.outcome} {...register("outcome")}>
            <option value="" disabled>
              Select an outcome
            </option>
            {Object.values(CallLogOutcome).map((value) => (
              <option key={value} value={value}>
                {OUTCOME_LABELS[value]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Note" htmlFor="note" error={errors.note?.message}>
          <Textarea id="note" rows={3} invalid={!!errors.note} {...register("note")} />
        </Field>
        <Button type="submit" loading={isSubmitting} className="w-full">
          Log outcome
        </Button>
      </form>
    </Modal>
  );
}
