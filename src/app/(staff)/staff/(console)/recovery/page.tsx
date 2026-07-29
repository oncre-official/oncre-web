"use client";

import { Plus } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableEmptyState, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";
import { Tabs } from "@/components/ui/tabs";
import { CaseKanbanBoard } from "@/features/staff/components/recovery/case-kanban-board";
import { DisputeQueueTable } from "@/features/staff/components/recovery/dispute-queue-table";
import { MonitoringTrackTable } from "@/features/staff/components/recovery/monitoring-track-table";
import { PassiveRecoveryTable } from "@/features/staff/components/recovery/passive-recovery-table";
import { CreateCaseModal } from "@/features/staff/components/create-case-modal";
import { LogCallOutcomeModal } from "@/features/staff/components/log-call-outcome-modal";
import { NoAccess } from "@/features/staff/components/no-access";
import { StaffCaseDetailDrawer } from "@/features/staff/components/staff-case-detail-drawer";
import { listCases } from "@/lib/api/staff/cases";
import { listCalls, listPrivilegedCalls } from "@/lib/api/staff/calls";
import { useStaffSessionStore } from "@/lib/stores/staff-session-store";
import { handleStaffApiError } from "@/lib/utils/staff-error";
import {
  CALL_PRIVILEGED_ROLES,
  CASE_ACTION_ROLES,
  CASE_CREATE_ROLES,
  CASE_LIST_ROLES,
  hasRole,
  PAYMENT_VIEW_ROLES,
} from "@/lib/utils/staff-permissions";
import { CaseStatus, RecoveryMode, type Case } from "@/types/case";
import { CallStatus, type Call } from "@/types/call";

type RecoveryTab = "cases" | "calls" | "disputes" | "monitoring" | "passive";

const OPEN_CALL_STATUSES = [CallStatus.SCHEDULED, CallStatus.PENDING];

function RecoveryPageInner() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as RecoveryTab) || "cases";

  const sessionStatus = useStaffSessionStore((s) => s.status);
  const roleName = useStaffSessionStore((s) => s.user?.role?.name);
  const canView = hasRole(roleName, CASE_LIST_ROLES);
  const canCreateCase = hasRole(roleName, CASE_CREATE_ROLES);
  const canActOnDisputes = hasRole(roleName, CASE_ACTION_ROLES);
  const canSeeCalls = hasRole(roleName, CALL_PRIVILEGED_ROLES);
  const canSeeMonitoring = hasRole(roleName, PAYMENT_VIEW_ROLES);

  const [tab, setTab] = useState<RecoveryTab>(initialTab);
  const [cases, setCases] = useState<Case[]>([]);
  const [calls, setCalls] = useState<Call[]>([]);
  const [allCalls, setAllCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [logCallId, setLogCallId] = useState<string | null>(null);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);

  const reloadCases = () => {
    listCases({ limit: 200 })
      .then((result) => setCases(result.row))
      .catch(handleStaffApiError);
  };

  useEffect(() => {
    if (!canView) return;
    let cancelled = false;
    const requests: Promise<void>[] = [
      listCases({ limit: 200 }).then((result) => {
        if (!cancelled) setCases(result.row);
      }),
    ];
    if (canSeeCalls) {
      requests.push(
        listPrivilegedCalls({ limit: 200 }).then((result) => {
          if (!cancelled) setCalls(result.row);
        }),
      );
      requests.push(
        listCalls({ limit: 500 }).then((result) => {
          if (!cancelled) setAllCalls(result.row);
        }),
      );
    }
    Promise.all(requests)
      .catch((error) => {
        if (!cancelled) handleStaffApiError(error);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [canView, canSeeCalls]);

  useEffect(() => {
    if (searchParams.get("create") === "1") Promise.resolve().then(() => setModalOpen(true));
  }, [searchParams]);

  const nextCallByCase = useMemo(() => {
    const map = new Map<string, Call>();
    const openCalls = allCalls
      .filter((call) => call.case_id && call.scheduled_for && OPEN_CALL_STATUSES.includes(call.status))
      .sort((a, b) => new Date(a.scheduled_for!).getTime() - new Date(b.scheduled_for!).getTime());

    for (const call of openCalls) {
      if (!map.has(call.case_id)) map.set(call.case_id, call);
    }
    return map;
  }, [allCalls]);

  const activeCases = useMemo(() => cases.filter((c) => c.status === CaseStatus.ACTIVE), [cases]);
  const disputedCases = useMemo(() => cases.filter((c) => c.status === CaseStatus.DISPUTED), [cases]);
  const monitoringCases = useMemo(() => cases.filter((c) => c.recovery_mode === RecoveryMode.PAYMENT_PLAN), [cases]);
  const passiveCases = useMemo(() => cases.filter((c) => c.status === CaseStatus.PARTIALLY_RECOVERED), [cases]);

  const tabs = [
    { key: "cases", label: "Active Cases" },
    ...(canSeeCalls ? [{ key: "calls", label: "Call List" }] : []),
    ...(canActOnDisputes ? [{ key: "disputes", label: `Dispute Queue (${disputedCases.length})` }] : []),
    ...(canSeeMonitoring ? [{ key: "monitoring", label: "Monitoring Track" }] : []),
    ...(canSeeCalls ? [{ key: "passive", label: "Passive Recovery" }] : []),
  ];

  if (sessionStatus !== "ready" || loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="h-6 w-6 text-brand-600" />
      </div>
    );
  }

  if (!canView) return <NoAccess />;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink-900">Recovery</h1>
          <p className="text-sm text-ink-500">Case ingestion, call queue, disputes, and payment-plan monitoring.</p>
        </div>
        {canCreateCase && tab === "cases" && (
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" />
            New case
          </Button>
        )}
      </div>

      <div className="mb-6 max-w-2xl">
        <Tabs tabs={tabs} active={tab} onChange={(key) => setTab(key as RecoveryTab)} />
      </div>

      {tab === "cases" && (
        <CaseKanbanBoard cases={activeCases} nextCallByCase={nextCallByCase} onSelectCase={setSelectedCase} />
      )}

      {tab === "calls" && canSeeCalls && (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Call ID</TableHeaderCell>
              <TableHeaderCell>Case ID</TableHeaderCell>
              <TableHeaderCell>Debtor phone</TableHeaderCell>
              <TableHeaderCell>Type</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {calls.length === 0 ? (
              <TableEmptyState colSpan={6} message="No calls in today's queue." />
            ) : (
              calls.map((call) => (
                <TableRow key={call._id}>
                  <TableCell className="font-mono text-xs">{call.call_id}</TableCell>
                  <TableCell className="font-mono text-xs">{call.case_id ?? "—"}</TableCell>
                  <TableCell>{call.debtor_phone}</TableCell>
                  <TableCell>{call.call_type}</TableCell>
                  <TableCell>
                    <Badge tone="neutral">{call.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="secondary" onClick={() => setLogCallId(call.call_id)}>
                      Log outcome
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}

      {tab === "disputes" && canActOnDisputes && (
        <DisputeQueueTable cases={disputedCases} canAct={canActOnDisputes} onChanged={reloadCases} />
      )}

      {tab === "monitoring" && canSeeMonitoring && <MonitoringTrackTable cases={monitoringCases} />}

      {tab === "passive" && canSeeCalls && <PassiveRecoveryTable cases={passiveCases} />}

      <CreateCaseModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={(caze) => setCases((prev) => [caze, ...prev])}
      />

      <LogCallOutcomeModal callId={logCallId} onClose={() => setLogCallId(null)} onLogged={() => setLogCallId(null)} />

      <StaffCaseDetailDrawer
        caze={selectedCase}
        nextCall={selectedCase ? nextCallByCase.get(selectedCase.case_id) : undefined}
        onClose={() => setSelectedCase(null)}
        onChanged={() => {
          setSelectedCase(null);
          reloadCases();
        }}
      />
    </div>
  );
}

export default function RecoveryPage() {
  return (
    <Suspense>
      <RecoveryPageInner />
    </Suspense>
  );
}
