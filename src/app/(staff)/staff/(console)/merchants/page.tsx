"use client";

import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableEmptyState, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";
import { CreateMerchantModal } from "@/features/staff/components/create-merchant-modal";
import { listMerchants } from "@/lib/api/staff/merchants";
import { useStaffSessionStore } from "@/lib/stores/staff-session-store";
import { handleStaffApiError } from "@/lib/utils/staff-error";
import { hasRole, MERCHANT_CUSTOMER_CREATE_ROLES } from "@/lib/utils/staff-permissions";
import type { Merchant } from "@/types/merchant";

export default function MerchantsPage() {
  const roleName = useStaffSessionStore((s) => s.user?.role?.name);
  const canCreate = hasRole(roleName, MERCHANT_CUSTOMER_CREATE_ROLES);

  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    listMerchants({ limit: 100 })
      .then((result) => setMerchants(result.row))
      .catch(handleStaffApiError)
      .finally(() => setLoading(false));
  }, []);

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
            </TableRow>
          </TableHead>
          <TableBody>
            {merchants.length === 0 ? (
              <TableEmptyState colSpan={6} message="No merchants yet." />
            ) : (
              merchants.map((merchant) => (
                <TableRow key={merchant._id}>
                  <TableCell className="font-mono text-xs">{merchant.merchant_id}</TableCell>
                  <TableCell>{merchant.merchant_name}</TableCell>
                  <TableCell>{merchant.merchant_store_name}</TableCell>
                  <TableCell>{merchant.merchant_phone}</TableCell>
                  <TableCell>{merchant.location}</TableCell>
                  <TableCell>
                    <Badge tone={merchant.activated ? "good" : "neutral"}>
                      {merchant.activated ? "Activated" : "Pending"}
                    </Badge>
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
    </div>
  );
}
