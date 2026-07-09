"use client";

import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableEmptyState, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";
import { CreateCustomerModal } from "@/features/staff/components/create-customer-modal";
import { listCustomers } from "@/lib/api/staff/customers";
import { useStaffSessionStore } from "@/lib/stores/staff-session-store";
import { handleStaffApiError } from "@/lib/utils/staff-error";
import { hasRole, MERCHANT_CUSTOMER_CREATE_ROLES } from "@/lib/utils/staff-permissions";
import { CustomerStatus, type Customer } from "@/types/customer";

export default function CustomersPage() {
  const roleName = useStaffSessionStore((s) => s.user?.role?.name);
  const canCreate = hasRole(roleName, MERCHANT_CUSTOMER_CREATE_ROLES);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    listCustomers({ limit: 100 })
      .then((result) => setCustomers(result.row))
      .catch(handleStaffApiError)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink-900">Customers</h1>
          <p className="text-sm text-ink-500">Every debtor/customer recorded in the recovery engine.</p>
        </div>
        {canCreate && (
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Create customer
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
              <TableHeaderCell>Customer ID</TableHeaderCell>
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell>Business</TableHeaderCell>
              <TableHeaderCell>Phone</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.length === 0 ? (
              <TableEmptyState colSpan={5} message="No customers yet." />
            ) : (
              customers.map((customer) => (
                <TableRow key={customer._id}>
                  <TableCell className="font-mono text-xs">{customer.customer_id}</TableCell>
                  <TableCell>{customer.customer_name}</TableCell>
                  <TableCell>{customer.business_name ?? "—"}</TableCell>
                  <TableCell>{customer.customer_phone}</TableCell>
                  <TableCell>
                    <Badge tone={customer.status === CustomerStatus.ACTIVE ? "good" : "neutral"}>
                      {customer.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}

      <CreateCustomerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={(customer) => setCustomers((prev) => [customer, ...prev])}
      />
    </div>
  );
}
