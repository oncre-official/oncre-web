"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { transitionCase } from "@/lib/api/staff/cases";
import { toast } from "@/lib/stores/toast-store";
import { handleStaffApiError } from "@/lib/utils/staff-error";
import { transitionCaseSchema, TransitionCaseFormValues } from "@/lib/validation/staff.schema";
import { TransitionOutcome } from "@/types/case";

const OUTCOME_LABELS: Record<TransitionOutcome, string> = {
  [TransitionOutcome.FULLY_RECOVERED]: "Fully recovered",
  [TransitionOutcome.PARTIALLY_RECOVERED]: "Partially recovered",
  [TransitionOutcome.ESCALATE_TO_LEGAL]: "Escalate to legal",
  [TransitionOutcome.WRITE_OFF]: "Write off",
};

interface TransitionCaseFormProps {
  caseObjectId: string;
  onDone: () => void;
}

/** PRD-adjacent: the backend's own `PENDING_TRANSITION` resolution flow (CaseController#transition). */
export function TransitionCaseForm({ caseObjectId, onDone }: TransitionCaseFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TransitionCaseFormValues>({ resolver: zodResolver(transitionCaseSchema) });

  const onSubmit = async (values: TransitionCaseFormValues) => {
    try {
      await transitionCase(caseObjectId, values);
      toast.success("Case transitioned successfully.");
      onDone();
    } catch (error) {
      handleStaffApiError(error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 rounded-lg border border-ink-100 p-4" noValidate>
      <h4 className="text-sm font-semibold text-ink-900">Transition case</h4>

      <Field label="Outcome" htmlFor="outcome" required error={errors.outcome?.message}>
        <Select id="outcome" defaultValue="" invalid={!!errors.outcome} {...register("outcome")}>
          <option value="" disabled>
            Select an outcome
          </option>
          {Object.values(TransitionOutcome).map((value) => (
            <option key={value} value={value}>
              {OUTCOME_LABELS[value]}
            </option>
          ))}
        </Select>
      </Field>

      <Field
        label="Type CONFIRM to proceed"
        htmlFor="confirmationText"
        required
        error={errors.confirmationText?.message}
      >
        <Input id="confirmationText" invalid={!!errors.confirmationText} {...register("confirmationText")} />
      </Field>

      <Field label="Note" htmlFor="note" error={errors.note?.message}>
        <Textarea id="note" rows={2} invalid={!!errors.note} {...register("note")} />
      </Field>

      <Button type="submit" variant="danger" loading={isSubmitting}>
        Confirm transition
      </Button>
    </form>
  );
}
