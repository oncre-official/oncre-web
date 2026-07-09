import { apiRequest } from "@/lib/api/http-json";
import type { AdminCreateUserFormValues } from "@/lib/validation/staff.schema";
import type { AdminUpdateUserInput, CreatedStaffUser } from "@/types/admin-user";
import type { ListResult } from "@/types/api";
import type { OncreUser } from "@/types/user";

export function listStaffUsers(params: { skip?: number; limit?: number } = {}): Promise<ListResult<OncreUser>> {
  const query = new URLSearchParams(params as Record<string, string>).toString();
  return apiRequest(`/api/staff/admin/users?${query}`);
}

export function createStaffUser(input: AdminCreateUserFormValues): Promise<CreatedStaffUser> {
  return apiRequest("/api/staff/admin/users", { method: "POST", body: input });
}

export function updateStaffUser(id: string, input: AdminUpdateUserInput): Promise<OncreUser> {
  return apiRequest(`/api/staff/admin/users/${id}`, { method: "PATCH", body: input });
}

export function deleteStaffUser(id: string): Promise<null> {
  return apiRequest(`/api/staff/admin/users/${id}`, { method: "DELETE" });
}
