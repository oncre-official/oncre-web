import { Inbox } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { formatNaira } from "@/lib/utils/currency";
import type { Call } from "@/types/call";
import type { Case } from "@/types/case";

import { CaseKanbanCard } from "./case-kanban-card";

const TIERS = [
  { level: 1, title: "L1 — Follow-up", subtitle: "Days 1–3", dot: "bg-brand-300", soft: "bg-brand-50" },
  { level: 2, title: "L2 — Formal notice", subtitle: "Days 4–7", dot: "bg-brand-400", soft: "bg-brand-100" },
  { level: 3, title: "L3 — Final demand", subtitle: "Days 8–14", dot: "bg-status-serious", soft: "bg-status-serious-soft" },
  { level: 4, title: "L4 — Credit consequence", subtitle: "Days 15–21", dot: "bg-status-critical", soft: "bg-status-critical-soft" },
] as const;

interface CaseKanbanBoardProps {
  cases: Case[];
  /** case_id → next open (scheduled/pending) call, when known. Empty for roles that can't view call logs. */
  nextCallByCase?: Map<string, Call>;
  onSelectCase: (caze: Case) => void;
}

export function CaseKanbanBoard({ cases, nextCallByCase, onSelectCase }: CaseKanbanBoardProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {TIERS.map((tier) => {
        const tierCases = cases.filter((caze) => caze.escalation_level === tier.level);
        const subtotal = tierCases.reduce((sum, c) => sum + c.amount, 0);

        return (
          <div
            key={tier.level}
            className="flex min-w-[280px] flex-1 flex-col overflow-hidden rounded-xl border border-ink-100 bg-white shadow-sm"
          >
            <div className={cn("h-1", tier.dot)} aria-hidden="true" />

            <div className="border-b border-ink-100 px-3.5 py-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={cn("h-2 w-2 shrink-0 rounded-full", tier.dot)} aria-hidden="true" />
                  <h3 className="text-sm font-semibold text-ink-900">{tier.title}</h3>
                </div>
                <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums text-ink-800", tier.soft)}>
                  {tierCases.length}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-ink-500">{tier.subtitle}</p>
              {tierCases.length > 0 && (
                <p className="mt-1.5 text-xs font-medium tabular-nums text-ink-700">{formatNaira(subtotal)} in this tier</p>
              )}
            </div>

            <div className="flex max-h-[65vh] flex-1 flex-col gap-2.5 overflow-y-auto bg-ink-50/60 p-3">
              {tierCases.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-2 px-2 py-10 text-center">
                  <Inbox className="h-6 w-6 text-ink-300" />
                  <p className="text-xs text-ink-400">No cases in this tier</p>
                </div>
              ) : (
                tierCases.map((caze) => (
                  <CaseKanbanCard
                    key={caze._id}
                    caze={caze}
                    nextCall={nextCallByCase?.get(caze.case_id)}
                    onClick={() => onSelectCase(caze)}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
