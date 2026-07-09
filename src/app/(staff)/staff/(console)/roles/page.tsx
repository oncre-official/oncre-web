"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { listRoles } from "@/lib/api/staff/roles";
import { handleStaffApiError } from "@/lib/utils/staff-error";
import type { RoleWithPermissions } from "@/types/role";

export default function RolesPage() {
  const [roles, setRoles] = useState<RoleWithPermissions[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listRoles()
      .then(setRoles)
      .catch(handleStaffApiError)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-ink-900">Roles &amp; permissions</h1>
        <p className="text-sm text-ink-500">Read-only — seeded once by the recovery engine on boot.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner className="h-6 w-6 text-brand-600" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => (
            <Card key={role._id} className="p-4">
              <h3 className="mb-2 text-sm font-semibold text-ink-900">{role.name}</h3>
              <div className="flex flex-wrap gap-1.5">
                {role.permissions && role.permissions.length > 0 ? (
                  role.permissions.map((permission) => (
                    <Badge key={permission._id} tone="neutral">
                      {permission.name}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-ink-400">No permissions</span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
