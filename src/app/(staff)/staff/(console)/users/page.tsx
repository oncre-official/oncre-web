"use client";

import { Plus } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableEmptyState, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";
import { Tabs } from "@/components/ui/tabs";
import { CreateCustomerModal } from "@/features/staff/components/create-customer-modal";
import { CreateMerchantModal } from "@/features/staff/components/create-merchant-modal";
import { StaffDirectoryProfileDrawer, type ProfileTarget } from "@/features/staff/components/staff-directory-profile-drawer";
import { listCustomers } from "@/lib/api/staff/customers";
import { listMerchants } from "@/lib/api/staff/merchants";
import { useStaffSessionStore } from "@/lib/stores/staff-session-store";
import { handleStaffApiError } from "@/lib/utils/staff-error";
import { DEBTOR_CREATE_ROLES, hasRole, MERCHANT_CREATE_ROLES } from "@/lib/utils/staff-permissions";
import { CustomerStatus, type Customer } from "@/types/customer";
import { MerchantApprovalStatus, type Merchant } from "@/types/merchant";

type UsersTab = "merchants" | "debtors";

function UsersPageInner() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as UsersTab) === "debtors" ? "debtors" : "merchants";

  const roleName = useStaffSessionStore((s) => s.user?.role?.name);
  const canCreateMerchant = hasRole(roleName, MERCHANT_CREATE_ROLES);
  const canCreateDebtor = hasRole(roleName, DEBTOR_CREATE_ROLES);

  const [tab, setTab] = useState<UsersTab>(initialTab);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [target, setTarget] = useState<ProfileTarget | null>(null);

  const reloadMerchants = () => {
    listMerchants({ limit: 100 })
      .then((result) => setMerchants(result.row))
      .catch(handleStaffApiError);
  };

  const reloadCustomers = () => {
    listCustomers({ limit: 100 })
      .then((result) => setCustomers(result.row))
      .catch(handleStaffApiError);
  };

  useEffect(() => {
    Promise.all([listMerchants({ limit: 100 }), listCustomers({ limit: 100 })])
      .then(([merchantResult, customerResult]) => {
        setMerchants(merchantResult.row);
        setCustomers(customerResult.row);
      })
      .catch(handleStaffApiError)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // Client-only, deferred via microtask — Modal/Drawer portal to document.body.
    if (searchParams.get("create") === "1") Promise.resolve().then(() => setModalOpen(true));
  }, [searchParams]);

  const canCreate = tab === "merchants" ? canCreateMerchant : canCreateDebtor;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink-900">Users</h1>
          <p className="text-sm text-ink-500">Merchants and debtors recorded in the recovery engine.</p>
        </div>
        {canCreate && (
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" />
            {tab === "merchants" ? "Create merchant" : "Create debtor"}
          </Button>
        )}
      </div>

      <div className="mb-6 max-w-xs">
        <Tabs
          tabs={[
            { key: "merchants", label: "Merchants" },
            { key: "debtors", label: "Debtors" },
          ]}
          active={tab}
          onChange={(key) => setTab(key as UsersTab)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner className="h-6 w-6 text-brand-600" />
        </div>
      ) : tab === "merchants" ? (
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
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Customer ID</TableHeaderCell>
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell>Business</TableHeaderCell>
              <TableHeaderCell>Phone</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.length === 0 ? (
              <TableEmptyState colSpan={5} message="No debtors yet." />
            ) : (
              customers.map((customer) => (
                <TableRow
                  key={customer._id}
                  onClick={() => setTarget({ kind: "customer", record: customer })}
                  className="cursor-pointer hover:bg-ink-50"
                >
                  <TableCell className="font-mono text-xs">{customer.customer_id}</TableCell>
                  <TableCell>{customer.customer_name}</TableCell>
                  <TableCell>{customer.business_name ?? "—"}</TableCell>
                  <TableCell>{customer.customer_phone}</TableCell>
                  <TableCell>
                    <Badge
                      tone={
                        customer.status === CustomerStatus.INACTIVE
                          ? "critical"
                          : customer.status === CustomerStatus.CASH_ONLY
                            ? "warning"
                            : "good"
                      }
                    >
                      {customer.status === CustomerStatus.INACTIVE
                        ? "Deactivated"
                        : customer.status === CustomerStatus.CASH_ONLY
                          ? "Cash only"
                          : "Active"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}

      <CreateMerchantModal
        open={modalOpen && tab === "merchants"}
        onClose={() => setModalOpen(false)}
        onCreated={(merchant) => setMerchants((prev) => [merchant, ...prev])}
      />

      <CreateCustomerModal
        open={modalOpen && tab === "debtors"}
        onClose={() => setModalOpen(false)}
        onCreated={(customer) => setCustomers((prev) => [customer, ...prev])}
      />

      <StaffDirectoryProfileDrawer
        target={target}
        onClose={() => setTarget(null)}
        onChanged={() => {
          setTarget(null);
          reloadMerchants();
          reloadCustomers();
        }}
      />
    </div>
  );
}

export default function UsersPage() {
  return (
    <Suspense>
      <UsersPageInner />
    </Suspense>
  );
}
