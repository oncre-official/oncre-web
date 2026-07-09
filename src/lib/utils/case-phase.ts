import type { KanbanPhaseKey } from "@/config/site";
import { Case, CaseStatus } from "@/types/case";

const RESOLVED_STATUSES = new Set<CaseStatus>([
  CaseStatus.FULLY_RECOVERED,
  CaseStatus.PARTIALLY_RECOVERED,
  CaseStatus.COMPLETED,
  CaseStatus.WRITE_OFF,
  CaseStatus.WRITTEN_OFF,
]);

/**
 * Maps a backend `Case` (real or mock — same shape) onto the PRD's 4-column
 * Kanban model. The backend has no `phase` field; it tracks `current_day`
 * (0-21+) and `escalation_level` instead, which line up naturally with the
 * PRD's day ranges (2.3 Sub-flow D).
 */
export function getCaseKanbanPhase(caze: Case): KanbanPhaseKey {
  if (RESOLVED_STATUSES.has(caze.status)) return "RESOLVED";
  if (caze.status === CaseStatus.LEGAL || caze.status === CaseStatus.PENDING_TRANSITION) return "PHASE_3";

  if (caze.current_day <= 7) return "PHASE_1";
  if (caze.current_day <= 14) return "PHASE_2";
  return "PHASE_3";
}

export function isCaseResolved(caze: Case): boolean {
  return RESOLVED_STATUSES.has(caze.status);
}
