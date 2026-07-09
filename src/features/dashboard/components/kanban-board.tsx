"use client";

import { useEffect, useMemo, useState } from "react";

import { Spinner } from "@/components/ui/spinner";
import { kanbanPhases } from "@/config/site";
import { listMyCases } from "@/lib/api/portal";
import { getCaseKanbanPhase } from "@/lib/utils/case-phase";
import { buildCaseBoardCsv, downloadTextFile } from "@/lib/utils/csv";
import { computeDashboardKpis } from "@/lib/utils/kpi";
import { toast } from "@/lib/stores/toast-store";
import type { SourcedCase } from "@/types/portal";

import { CaseDetailDrawer } from "./case-detail-drawer";
import { CaseFilters, CaseFiltersValue } from "./case-filters";
import { KanbanColumn } from "./kanban-column";
import { KpiRow } from "./kpi-row";

const EMPTY_FILTERS: CaseFiltersValue = { phase: "ALL", minAmount: "", maxAmount: "", minDaysOverdue: "" };

export function KanbanBoard() {
  const [cases, setCases] = useState<SourcedCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<CaseFiltersValue>(EMPTY_FILTERS);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  useEffect(() => {
    listMyCases()
      .then(setCases)
      .catch(() => toast.error("Could not load your cases."))
      .finally(() => setLoading(false));
  }, []);

  const filteredCases = useMemo(() => {
    return cases.filter((caze) => {
      if (filters.phase !== "ALL" && getCaseKanbanPhase(caze) !== filters.phase) return false;
      if (filters.minAmount && caze.amount < Number(filters.minAmount)) return false;
      if (filters.maxAmount && caze.amount > Number(filters.maxAmount)) return false;
      if (filters.minDaysOverdue && caze.current_day < Number(filters.minDaysOverdue)) return false;
      return true;
    });
  }, [cases, filters]);

  const kpis = useMemo(() => computeDashboardKpis(filteredCases), [filteredCases]);

  const casesByPhase = useMemo(() => {
    const grouped = new Map(kanbanPhases.map((phase) => [phase.key, [] as SourcedCase[]]));
    for (const caze of filteredCases) grouped.get(getCaseKanbanPhase(caze))?.push(caze);
    return grouped;
  }, [filteredCases]);

  const handleExport = () => {
    downloadTextFile("oncre-board-export.csv", buildCaseBoardCsv(filteredCases));
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="h-6 w-6 text-brand-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <KpiRow kpis={kpis} />
      <CaseFilters value={filters} onChange={setFilters} onExport={handleExport} />
      <div className="flex gap-4 overflow-x-auto pb-2">
        {kanbanPhases.map((phase) => (
          <KanbanColumn
            key={phase.key}
            phase={phase}
            cases={casesByPhase.get(phase.key) ?? []}
            onSelectCase={setSelectedCaseId}
          />
        ))}
      </div>
      <CaseDetailDrawer caseId={selectedCaseId} onClose={() => setSelectedCaseId(null)} />
    </div>
  );
}
