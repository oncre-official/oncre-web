import { apiRequest } from "@/lib/api/http-json";
import type { RoleWithPermissions } from "@/types/role";

export function listRoles(): Promise<RoleWithPermissions[]> {
  return apiRequest("/api/staff/roles");
}
