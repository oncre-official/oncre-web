import { Inbox } from "lucide-react";

import type { kanbanPhases } from "@/config/site";
import { cn } from "@/lib/utils/cn";
import { formatNaira } from "@/lib/utils/currency";
import { phaseAccents } from "@/lib/utils/phase-accent";
import type { SourcedCase } from "@/types/portal";

import { CaseCard } from "./case-card";

interface KanbanColumnProps {
  phase: (typeof kanbanPhases)[number];
  cases: SourcedCase[];
  onSelectCase: (caseId: string) => void;
}

export function KanbanColumn({ phase, cases, onSelectCase }: KanbanColumnProps) {
  const accent = phaseAccents[phase.key];
  const subtotal = cases.reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="flex min-w-[280px] flex-1 flex-col overflow-hidden rounded-xl border border-ink-100 bg-white shadow-sm">
      <div className={cn("h-1", accent.dot)} aria-hidden="true" />

      <div className="border-b border-ink-100 px-3.5 py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className={cn("h-2 w-2 shrink-0 rounded-full", accent.dot)} aria-hidden="true" />
            <h3 className="text-sm font-semibold text-ink-900">{phase.title}</h3>
          </div>
          <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums", accent.soft, "text-ink-800")}>
            {cases.length}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-ink-500">{phase.subtitle}</p>
        {cases.length > 0 && (
          <p className="mt-1.5 text-xs font-medium tabular-nums text-ink-700">{formatNaira(subtotal)} in this phase</p>
        )}
      </div>

      <div className="flex max-h-[65vh] flex-1 flex-col gap-2.5 overflow-y-auto bg-ink-50/60 p-3">
        {cases.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-2 py-10 text-center">
            <Inbox className="h-6 w-6 text-ink-300" />
            <p className="text-xs text-ink-400">No cases in this phase</p>
          </div>
        ) : (
          cases.map((caze) => (
            <CaseCard key={caze.case_id} caze={caze} accent={accent} onClick={() => onSelectCase(caze.case_id)} />
          ))
        )}
      </div>
    </div>
  );
}
