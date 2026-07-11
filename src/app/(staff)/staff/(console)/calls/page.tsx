"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableEmptyState, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";
import { LogCallOutcomeModal } from "@/features/staff/components/log-call-outcome-modal";
import { NoAccess } from "@/features/staff/components/no-access";
import { listPrivilegedCalls } from "@/lib/api/staff/calls";
import { useStaffSessionStore } from "@/lib/stores/staff-session-store";
import { handleStaffApiError } from "@/lib/utils/staff-error";
import { CALL_PRIVILEGED_ROLES, hasRole } from "@/lib/utils/staff-permissions";
import type { Call } from "@/types/call";

export default function CallsPage() {
  const roleName = useStaffSessionStore((s) => s.user?.role?.name);
  const canAccess = hasRole(roleName, CALL_PRIVILEGED_ROLES);

  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [logCallId, setLogCallId] = useState<string | null>(null);

  useEffect(() => {
    if (!canAccess) return;
    let cancelled = false;
    listPrivilegedCalls({ limit: 100 })
      .then((result) => {
        if (!cancelled) setCalls(result.row);
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
  }, [canAccess]);

  if (!canAccess) return <NoAccess />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-ink-900">Calls</h1>
        <p className="text-sm text-ink-500">Every scheduled and placed call.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner className="h-6 w-6 text-brand-600" />
        </div>
      ) : (
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
              <TableEmptyState colSpan={6} message="No calls yet." />
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

      <LogCallOutcomeModal callId={logCallId} onClose={() => setLogCallId(null)} onLogged={() => setLogCallId(null)} />
    </div>
  );
}
