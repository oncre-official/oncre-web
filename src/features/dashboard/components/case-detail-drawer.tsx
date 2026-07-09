"use client";

import { format } from "date-fns";
import { AlertTriangle, Calendar, Database, Phone, MessageSquare, Wallet } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Drawer } from "@/components/ui/drawer";
import { Spinner } from "@/components/ui/spinner";
import { getCaseDetail } from "@/lib/api/portal";
import { getCaseStatusLabel, getCaseStatusTone } from "@/lib/utils/case-status-tone";
import { cn } from "@/lib/utils/cn";
import { formatNaira } from "@/lib/utils/currency";
import type { Call } from "@/types/call";
import type { Message } from "@/types/message";
import type { Payment } from "@/types/payment";
import type { SourcedCase } from "@/types/portal";

interface CaseDetailDrawerProps {
  caseId: string | null;
  onClose: () => void;
}

interface TimelineEntry {
  id: string;
  icon: "message" | "call" | "payment";
  label: string;
  timestamp: string;
}

function buildTimeline(messages: Message[], calls: Call[], payments: Payment[]): TimelineEntry[] {
  const entries: TimelineEntry[] = [
    ...messages
      .filter((m) => m.sent_at || m.scheduled_for)
      .map((m) => ({
        id: m._id,
        icon: "message" as const,
        label: `SMS — ${m.message_type.replaceAll("_", " ")}: ${m.message_body}`,
        timestamp: (m.sent_at ?? m.scheduled_for)!,
      })),
    ...calls
      .filter((c) => c.scheduled_for)
      .map((c) => ({
        id: c._id,
        icon: "call" as const,
        label: `Call ${c.status} (${c.call_type.replaceAll("_", " ")})`,
        timestamp: c.scheduled_for!,
      })),
    ...payments.map((p) => ({
      id: p._id,
      icon: "payment" as const,
      label: `Payment ${p.status} — ${formatNaira(p.amount_paid ?? p.amount)}`,
      timestamp: p.paid_at ?? p.created_at ?? new Date().toISOString(),
    })),
  ];

  return entries.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

const TIMELINE_ICONS = { message: MessageSquare, call: Phone, payment: Wallet };

export function CaseDetailDrawer({ caseId, onClose }: CaseDetailDrawerProps) {
  const [caze, setCaze] = useState<SourcedCase | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);

  useEffect(() => {
    if (!caseId) return;
    let cancelled = false;

    getCaseDetail(caseId).then(({ case: fetchedCase, calls, messages, payments }) => {
      if (cancelled) return;
      setCaze(fetchedCase);
      setTimeline(buildTimeline(messages, calls, payments));
    });

    return () => {
      cancelled = true;
    };
  }, [caseId]);

  const isLoading = caseId !== null && caze?.case_id !== caseId;

  return (
    <Drawer open={!!caseId} onClose={onClose} title={caze ? caze.debtor_name : "Case detail"}>
      {isLoading || !caze ? (
        <div className="flex justify-center py-12">
          <Spinner className="h-6 w-6 text-brand-600" />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="flex items-start justify-between gap-4 rounded-xl bg-ink-50 p-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-ink-500">Amount owed</p>
              <p className="text-2xl font-semibold tabular-nums text-ink-900">{formatNaira(caze.amount)}</p>
            </div>
            <Badge tone={getCaseStatusTone(caze.status)} className="mt-1">
              {getCaseStatusLabel(caze.status)}
            </Badge>
          </div>

          {caze.dispute && (
            <div className="flex items-start gap-2 rounded-lg bg-status-warning-soft px-3 py-2.5 text-sm text-ink-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-status-warning" />
              <span>Open dispute: {caze.dispute.note ?? "No note provided"}</span>
            </div>
          )}

          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">Case ID</dt>
              <dd className="font-mono text-ink-800">{caze.case_id}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">Day in phase</dt>
              <dd className="text-ink-800">Day {caze.current_day}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">Debtor phone</dt>
              <dd className="flex items-center gap-1.5 text-ink-800">
                <Phone className="h-3.5 w-3.5 text-ink-400" />
                {caze.debtor_phone}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">Due date</dt>
              <dd className="flex items-center gap-1.5 text-ink-800">
                <Calendar className="h-3.5 w-3.5 text-ink-400" />
                {format(new Date(caze.due_date), "d MMM yyyy")}
              </dd>
            </div>
            <div className="col-span-2">
              <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">Record source</dt>
              <dd className="flex items-center gap-1.5 text-ink-800">
                <Database className="h-3.5 w-3.5 text-ink-400" />
                {caze.source === "backend" ? "Synced to the recovery engine" : "Stored locally (demo mode)"}
              </dd>
            </div>
          </dl>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-ink-900">Timeline &amp; communications</h4>
            {timeline.length === 0 ? (
              <p className="text-sm text-ink-500">No activity recorded yet.</p>
            ) : (
              <ol className="relative flex flex-col gap-5 pl-1">
                <div className="absolute top-1 bottom-1 left-[19px] w-px bg-ink-100" aria-hidden="true" />
                {timeline.map((entry) => {
                  const Icon = TIMELINE_ICONS[entry.icon];
                  return (
                    <li key={entry.id} className="relative flex gap-3">
                      <div className="z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700 ring-4 ring-white">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="pt-1">
                        <p className="text-sm text-ink-800">{entry.label}</p>
                        <p className={cn("mt-0.5 text-xs text-ink-500")}>
                          {format(new Date(entry.timestamp), "d MMM yyyy, HH:mm")}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </div>
      )}
    </Drawer>
  );
}
