"use client";

import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableEmptyState, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";
import { AdminUserCreatedNotice } from "@/features/staff/components/admin-user-created-notice";
import { AdminUserModal } from "@/features/staff/components/admin-user-modal";
import { NoAccess } from "@/features/staff/components/no-access";
import { deleteStaffUser, listStaffUsers } from "@/lib/api/staff/admin-users";
import { useStaffSessionStore } from "@/lib/stores/staff-session-store";
import { toast } from "@/lib/stores/toast-store";
import { handleStaffApiError } from "@/lib/utils/staff-error";
import { ADMIN_USER_ROLES, hasRole } from "@/lib/utils/staff-permissions";
import type { CreatedStaffUser } from "@/types/admin-user";
import type { OncreUser } from "@/types/user";

export default function AdminUsersPage() {
  const sessionStatus = useStaffSessionStore((s) => s.status);
  const currentUserId = useStaffSessionStore((s) => s.user?._id);
  const roleName = useStaffSessionStore((s) => s.user?.role?.name);
  const canAccess = hasRole(roleName, ADMIN_USER_ROLES);

  const [users, setUsers] = useState<OncreUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [createdUser, setCreatedUser] = useState<CreatedStaffUser | null>(null);

  useEffect(() => {
    if (!canAccess) return;
    let cancelled = false;
    listStaffUsers({ limit: 100 })
      .then((result) => {
        if (!cancelled) setUsers(result.row);
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

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this staff user? This cannot be undone.")) return;
    try {
      await deleteStaffUser(id);
      toast.success("Staff user deleted successfully.");
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (error) {
      handleStaffApiError(error);
    }
  };

  if (sessionStatus !== "ready") {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="h-6 w-6 text-brand-600" />
      </div>
    );
  }

  if (!canAccess) return <NoAccess />;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink-900">Admin Users</h1>
          <p className="text-sm text-ink-500">Staff accounts and their roles.</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Create staff user
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner className="h-6 w-6 text-brand-600" />
        </div>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Email / phone</TableHeaderCell>
              <TableHeaderCell>Role</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length === 0 ? (
              <TableEmptyState colSpan={4} message="No staff users yet." />
            ) : (
              users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user.email ?? user.phone}</TableCell>
                  <TableCell>
                    <Badge tone="brand">{user.role?.name ?? "—"}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge tone={user.status === "active" ? "good" : "neutral"}>{user.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {user._id !== currentUserId && (
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="flex items-center gap-1 text-sm text-status-critical hover:underline"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}

      <AdminUserModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={(user) => {
          setUsers((prev) => [user, ...prev]);
          setCreatedUser(user);
        }}
      />
      <AdminUserCreatedNotice user={createdUser} onClose={() => setCreatedUser(null)} />
    </div>
  );
}
