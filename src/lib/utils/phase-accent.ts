import type { KanbanPhaseKey } from "@/config/site";

export interface PhaseAccent {
  /** Small solid indicator (dot, progress fill) — never used for body text (fails AA as text). */
  dot: string;
  /** Left accent bar / ring — structural, not text. */
  border: string;
  /** Soft tint background for header chips and icon chips. */
  soft: string;
  /** Icon glyph color, only ever placed on the matching `soft` background. */
  icon: string;
}

/**
 * The four Kanban columns are an ordinal escalation sequence, not arbitrary
 * categories — Phase 1→2 ride the brand-blue ramp itself (deepens with
 * urgency, and keeps the dashboard visually part of the same brand system),
 * while Phase 3 and Resolved borrow the status palette directly since they
 * carry real state ("at risk" / "done"), not just sequence position.
 */
export const phaseAccents: Record<KanbanPhaseKey, PhaseAccent> = {
  PHASE_1: { dot: "bg-brand-300", border: "border-brand-300", soft: "bg-brand-50", icon: "text-brand-700" },
  PHASE_2: { dot: "bg-brand-400", border: "border-brand-400", soft: "bg-brand-100", icon: "text-brand-700" },
  PHASE_3: {
    dot: "bg-status-serious",
    border: "border-status-serious",
    soft: "bg-status-serious-soft",
    icon: "text-status-serious",
  },
  RESOLVED: {
    dot: "bg-status-good",
    border: "border-status-good",
    soft: "bg-status-good-soft",
    icon: "text-status-good",
  },
};
