import { formatDistanceToNow } from "date-fns";
import { AlertTriangle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import { formatNaira } from "@/lib/utils/currency";
import type { PhaseAccent } from "@/lib/utils/phase-accent";
import type { SourcedCase } from "@/types/portal";

interface CaseCardProps {
  caze: SourcedCase;
  accent: PhaseAccent;
  onClick: () => void;
}

export function CaseCard({ caze, accent, onClick }: CaseCardProps) {
  const lastActivity = caze.updated_at ?? caze.created_at;

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col gap-2.5 rounded-lg border border-ink-100 border-l-[3px] bg-white p-3.5 text-left shadow-sm",
        "transition-shadow hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500",
        accent.border,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-ink-900">{caze.debtor_name}</p>
        <span className="shrink-0 font-mono text-[11px] text-ink-400">{caze.case_id}</span>
      </div>

      <p className="text-lg font-semibold tabular-nums text-ink-900">{formatNaira(caze.amount)}</p>

      {caze.dispute && (
        <Badge tone="warning" className="w-fit">
          <AlertTriangle className="h-3 w-3" />
          Disputed
        </Badge>
      )}

      <div className="flex items-center justify-between border-t border-ink-100 pt-2 text-xs text-ink-500">
        <span>Day {caze.current_day}</span>
        {lastActivity && <span>{formatDistanceToNow(new Date(lastActivity), { addSuffix: true })}</span>}
      </div>
    </button>
  );
}
