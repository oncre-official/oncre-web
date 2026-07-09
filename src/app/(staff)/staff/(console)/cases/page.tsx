"use client";

import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableEmptyState, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";
import { CreateCaseModal } from "@/features/staff/components/create-case-modal";
import { NoAccess } from "@/features/staff/components/no-access";
import { StaffCaseDetailDrawer } from "@/features/staff/components/staff-case-detail-drawer";
import { listCases } from "@/lib/api/staff/cases";
import { useStaffSessionStore } from "@/lib/stores/staff-session-store";
import { formatNaira } from "@/lib/utils/currency";
import { getCaseStatusLabel, getCaseStatusTone } from "@/lib/utils/case-status-tone";
import { handleStaffApiError } from "@/lib/utils/staff-error";
import { CASE_ACTION_ROLES, CASE_LIST_ROLES, hasRole } from "@/lib/utils/staff-permissions";
import type { Case } from "@/types/case";

export default function CasesPage() {
  const sessionStatus = useStaffSessionStore((s) => s.status);
  const roleName = useStaffSessionStore((s) => s.user?.role?.name);
  const canView = hasRole(roleName, CASE_LIST_ROLES);
  const canCreate = hasRole(roleName, CASE_ACTION_ROLES);

  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);

  const reload = () => {
    setLoading(true);
    listCases({ limit: 100 })
      .then((result) => setCases(result.row))
      .catch(handleStaffApiError)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!canView) return;
    let cancelled = false;
    listCases({ limit: 100 })
      .then((result) => {
        if (!cancelled) setCases(result.row);
      })
      .catch((error) => {
        if (!cancelled) handleStaffApiError(error);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [canView]);

  if (sessionStatus !== "ready") {
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
          <h1 className="text-xl font-semibold text-ink-900">Cases</h1>
          <p className="text-sm text-ink-500">Every recovery case in the engine.</p>
        </div>
        {canCreate && (
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Create case
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner className="h-6 w-6 text-brand-600" />
        </div>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Case ID</TableHeaderCell>
              <TableHeaderCell>Debtor</TableHeaderCell>
              <TableHeaderCell>Amount</TableHeaderCell>
              <TableHeaderCell>Day</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cases.length === 0 ? (
              <TableEmptyState colSpan={5} message="No cases yet." />
            ) : (
              cases.map((caze) => (
                <TableRow key={caze._id} onClick={() => setSelectedCase(caze)} className="cursor-pointer hover:bg-ink-50">
                  <TableCell className="font-mono text-xs">{caze.case_id}</TableCell>
                  <TableCell>{caze.debtor_name}</TableCell>
                  <TableCell className="tabular-nums">{formatNaira(caze.amount)}</TableCell>
                  <TableCell>Day {caze.current_day}</TableCell>
                  <TableCell>
                    <Badge tone={getCaseStatusTone(caze.status)}>{getCaseStatusLabel(caze.status)}</Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}

      <CreateCaseModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={(caze) => setCases((prev) => [caze, ...prev])}
      />

      <StaffCaseDetailDrawer
        caze={selectedCase}
        onClose={() => setSelectedCase(null)}
        onChanged={() => {
          setSelectedCase(null);
          reload();
        }}
      />
    </div>
  );
}
