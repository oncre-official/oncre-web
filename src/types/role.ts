import type { Role } from "./user";

/** Mirrors oncre-backend `Permission` model (src/app/role/model/permission.model.ts). */
export interface Permission {
  _id: string;
  name: string;
  description?: string;
}

/** `GET /api/v1/roles` populates each role's permissions via the RolePermission join. */
export interface RoleWithPermissions extends Role {
  permissions: Permission[];
}
