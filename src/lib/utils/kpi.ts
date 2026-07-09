import { Case } from "@/types/case";
import { isCaseResolved } from "./case-phase";

export interface DashboardKpis {
  totalCases: number;
  totalDebtValue: number;
  casesResolved: number;
  recoveryRate: number;
}

/** PRD 2.3 Sub-flow D — KPI summary row, computed client-side from the case list. */
export function computeDashboardKpis(cases: Case[]): DashboardKpis {
  const totalCases = cases.length;
  const totalDebtValue = cases.reduce((sum, c) => sum + (c.amount || 0), 0);
  const casesResolved = cases.filter(isCaseResolved).length;
  const recoveryRate = totalCases === 0 ? 0 : Math.round((casesResolved / totalCases) * 100);

  return { totalCases, totalDebtValue, casesResolved, recoveryRate };
}
