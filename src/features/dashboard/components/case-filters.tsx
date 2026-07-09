import { Download, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { kanbanPhases } from "@/config/site";

export interface CaseFiltersValue {
  phase: string;
  minAmount: string;
  maxAmount: string;
  minDaysOverdue: string;
}

interface CaseFiltersProps {
  value: CaseFiltersValue;
  onChange: (value: CaseFiltersValue) => void;
  onExport: () => void;
}

/** PRD 2.3 step 34 — "Filters: by Phase, Amount Range, Days Overdue. Export button generates CSV." */
export function CaseFilters({ value, onChange, onExport }: CaseFiltersProps) {
  const update = (patch: Partial<CaseFiltersValue>) => onChange({ ...value, ...patch });

  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="mr-1 hidden items-center gap-1.5 text-sm font-medium text-ink-500 sm:flex">
          <SlidersHorizontal className="h-4 w-4" />
          Filter
        </div>

        <div className="w-40">
          <label className="mb-1 block text-xs font-medium text-ink-500">Phase</label>
          <Select value={value.phase} onChange={(e) => update({ phase: e.target.value })}>
            <option value="ALL">All phases</option>
            {kanbanPhases.map((phase) => (
              <option key={phase.key} value={phase.key}>
                {phase.title}
              </option>
            ))}
          </Select>
        </div>

        <div className="w-32">
          <label className="mb-1 block text-xs font-medium text-ink-500">Min amount (₦)</label>
          <Input type="number" value={value.minAmount} onChange={(e) => update({ minAmount: e.target.value })} />
        </div>

        <div className="w-32">
          <label className="mb-1 block text-xs font-medium text-ink-500">Max amount (₦)</label>
          <Input type="number" value={value.maxAmount} onChange={(e) => update({ maxAmount: e.target.value })} />
        </div>

        <div className="w-32">
          <label className="mb-1 block text-xs font-medium text-ink-500">Min days overdue</label>
          <Input
            type="number"
            value={value.minDaysOverdue}
            onChange={(e) => update({ minDaysOverdue: e.target.value })}
          />
        </div>

        <Button variant="secondary" onClick={onExport} className="ml-auto">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>
    </Card>
  );
}
