import { format } from "date-fns";
import { AlertTriangle, PhoneCall } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Meter } from "@/components/ui/meter";
import { formatNaira } from "@/lib/utils/currency";
import type { Call } from "@/types/call";
import type { Case } from "@/types/case";

const CASE_LIFECYCLE_DAYS = 21;

interface CaseKanbanCardProps {
  caze: Case;
  /** Next open (scheduled/pending) call for this case, when known. */
  nextCall?: Call;
  onClick: () => void;
}

export function CaseKanbanCard({ caze, nextCall, onClick }: CaseKanbanCardProps) {
  const progress = Math.min(100, Math.round((caze.current_day / CASE_LIFECYCLE_DAYS) * 100));

  return (
    <button
      onClick={onClick}
      className="flex flex-col gap-2.5 rounded-lg border border-ink-100 bg-white p-3.5 text-left shadow-sm transition-shadow hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
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

      {nextCall && (
        <div className="flex items-center gap-1.5 text-xs text-ink-500">
          <PhoneCall className="h-3 w-3 shrink-0" />
          <span>Next call {format(new Date(nextCall.scheduled_for!), "d MMM, h:mm a")}</span>
        </div>
      )}

      <div>
        <div className="mb-1 flex items-center justify-between text-xs text-ink-500">
          <span>Day {caze.current_day} of {CASE_LIFECYCLE_DAYS}</span>
          <span>{progress}%</span>
        </div>
        <Meter value={progress} />
      </div>
    </button>
  );
}
