"use client";

import { Plus } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableEmptyState, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";
import { CreateMerchantModal } from "@/features/staff/components/create-merchant-modal";
import { StaffDirectoryProfileDrawer, type ProfileTarget } from "@/features/staff/components/staff-directory-profile-drawer";
import { listMerchants } from "@/lib/api/staff/merchants";
import { useStaffSessionStore } from "@/lib/stores/staff-session-store";
import { handleStaffApiError } from "@/lib/utils/staff-error";
import { hasRole, MERCHANT_CUSTOMER_CREATE_ROLES } from "@/lib/utils/staff-permissions";
import { MerchantApprovalStatus, type Merchant } from "@/types/merchant";

function MerchantsPageInner() {
  const searchParams = useSearchParams();
  const roleName = useStaffSessionStore((s) => s.user?.role?.name);
  const canCreate = hasRole(roleName, MERCHANT_CUSTOMER_CREATE_ROLES);

  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [target, setTarget] = useState<ProfileTarget | null>(null);

  const reload = () => {
    listMerchants({ limit: 100 })
      .then((result) => setMerchants(result.row))
      .catch(handleStaffApiError);
  };

  useEffect(() => {
    listMerchants({ limit: 100 })
      .then((result) => setMerchants(result.row))
      .catch(handleStaffApiError)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // Client-only (never runs during SSR, unlike a lazy useState initializer) — required
    // since Modal/Drawer portal to document.body and would crash if opened during SSR.
    // Deferred via a microtask so the setState call isn't synchronous within the effect body.
    if (searchParams.get("create") === "1") Promise.resolve().then(() => setModalOpen(true));
  }, [searchParams]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink-900">Merchants</h1>
          <p className="text-sm text-ink-500">Every merchant recorded in the recovery engine.</p>
        </div>
        {canCreate && (
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Create merchant
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
              <TableHeaderCell>Merchant ID</TableHeaderCell>
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell>Store</TableHeaderCell>
              <TableHeaderCell>Phone</TableHeaderCell>
              <TableHeaderCell>Location</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Approval</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {merchants.length === 0 ? (
              <TableEmptyState colSpan={7} message="No merchants yet." />
            ) : (
              merchants.map((merchant) => (
                <TableRow
                  key={merchant._id}
                  onClick={() => setTarget({ kind: "merchant", record: merchant })}
                  className="cursor-pointer hover:bg-ink-50"
                >
                  <TableCell className="font-mono text-xs">{merchant.merchant_id}</TableCell>
                  <TableCell>{merchant.merchant_name}</TableCell>
                  <TableCell>{merchant.merchant_store_name}</TableCell>
                  <TableCell>{merchant.merchant_phone}</TableCell>
                  <TableCell>{merchant.location}</TableCell>
                  <TableCell>
                    <Badge tone={merchant.is_active === false ? "critical" : merchant.activated ? "good" : "neutral"}>
                      {merchant.is_active === false ? "Deactivated" : merchant.activated ? "Activated" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {merchant.approval_status === MerchantApprovalStatus.PENDING && (
                      <Badge tone="warning">Pending approval</Badge>
                    )}
                    {merchant.approval_status === MerchantApprovalStatus.REJECTED && (
                      <Badge tone="critical">Rejected</Badge>
                    )}
                    {merchant.approval_status === MerchantApprovalStatus.APPROVED && (
                      <span className="text-xs text-ink-400">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}

      <CreateMerchantModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={(merchant) => setMerchants((prev) => [merchant, ...prev])}
      />

      <StaffDirectoryProfileDrawer
        target={target}
        onClose={() => setTarget(null)}
        onChanged={() => {
          setTarget(null);
          reload();
        }}
      />
    </div>
  );
}

export default function MerchantsPage() {
  return (
    <Suspense>
      <MerchantsPageInner />
    </Suspense>
  );
}
