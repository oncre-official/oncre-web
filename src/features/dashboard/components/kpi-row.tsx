import { CheckCircle2, Layers, TrendingUp, Wallet } from "lucide-react";
import type { ComponentType } from "react";

import { Card } from "@/components/ui/card";
import { Meter } from "@/components/ui/meter";
import { cn } from "@/lib/utils/cn";
import { formatNairaCompact } from "@/lib/utils/currency";
import { formatCompactNumber } from "@/lib/utils/format";
import type { DashboardKpis } from "@/lib/utils/kpi";

interface StatTileConfig {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
  chipBg: string;
  chipText: string;
  meter?: number;
}

/** PRD 2.3 step 30 — the KPI summary row, as stat tiles (label · value · icon), one with a recovery-rate meter. */
export function KpiRow({ kpis }: { kpis: DashboardKpis }) {
  const tiles: StatTileConfig[] = [
    {
      label: "Total cases",
      value: formatCompactNumber(kpis.totalCases),
      icon: Layers,
      chipBg: "bg-brand-50",
      chipText: "text-brand-700",
    },
    {
      label: "Total debt value",
      value: formatNairaCompact(kpis.totalDebtValue),
      icon: Wallet,
      chipBg: "bg-brand-50",
      chipText: "text-brand-700",
    },
    {
      label: "Cases resolved",
      value: formatCompactNumber(kpis.casesResolved),
      icon: CheckCircle2,
      chipBg: "bg-status-good-soft",
      chipText: "text-status-good",
    },
    {
      label: "Recovery rate",
      value: `${kpis.recoveryRate}%`,
      icon: TrendingUp,
      chipBg: "bg-status-good-soft",
      chipText: "text-status-good",
      meter: kpis.recoveryRate,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {tiles.map((tile) => (
        <Card key={tile.label} className="p-4">
          <div className="flex items-start justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-500">{tile.label}</p>
            <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", tile.chipBg)}>
              <tile.icon className={cn("h-4 w-4", tile.chipText)} />
            </span>
          </div>
          <p className="mt-2 text-[28px] font-semibold leading-tight text-ink-900">{tile.value}</p>
          {tile.meter !== undefined && (
            <Meter value={tile.meter} fillClassName="bg-status-good" trackClassName="bg-status-good-soft" className="mt-3" />
          )}
        </Card>
      ))}
    </div>
  );
}
