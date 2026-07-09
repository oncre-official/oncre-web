import type { BadgeProps } from "@/components/ui/badge";
import { CaseStatus } from "@/types/case";

const STATUS_TONE: Record<CaseStatus, NonNullable<BadgeProps["tone"]>> = {
  [CaseStatus.ACTIVE]: "brand",
  [CaseStatus.PENDING_TRANSITION]: "warning",
  [CaseStatus.DISPUTED]: "warning",
  [CaseStatus.LEGAL]: "critical",
  [CaseStatus.WRITE_OFF]: "serious",
  [CaseStatus.WRITTEN_OFF]: "serious",
  [CaseStatus.FULLY_RECOVERED]: "good",
  [CaseStatus.PARTIALLY_RECOVERED]: "good",
  [CaseStatus.COMPLETED]: "good",
};

const STATUS_LABEL: Record<CaseStatus, string> = {
  [CaseStatus.ACTIVE]: "Active",
  [CaseStatus.PENDING_TRANSITION]: "Pending review",
  [CaseStatus.DISPUTED]: "Disputed",
  [CaseStatus.LEGAL]: "Legal escalation",
  [CaseStatus.WRITE_OFF]: "Written off",
  [CaseStatus.WRITTEN_OFF]: "Written off",
  [CaseStatus.FULLY_RECOVERED]: "Fully recovered",
  [CaseStatus.PARTIALLY_RECOVERED]: "Partially recovered",
  [CaseStatus.COMPLETED]: "Completed",
};

export function getCaseStatusTone(status: CaseStatus): NonNullable<BadgeProps["tone"]> {
  return STATUS_TONE[status] ?? "neutral";
}

export function getCaseStatusLabel(status: CaseStatus): string {
  return STATUS_LABEL[status] ?? status;
}
