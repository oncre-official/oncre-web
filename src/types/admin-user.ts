import type { OncreUser } from "./user";

/** Mirrors oncre-backend `AdminCreateUserDto` (src/app/admin/dto/create-user.dto.ts). Password is server-generated, never client-supplied. */
export interface AdminCreateUserInput {
  first_name?: string;
  last_name?: string;
  zone?: string;
  country_code?: string;
  phone?: string;
  email?: string;
  role_id: string;
}

/** `PartialType(AdminCreateUserDto)` on the backend — every field optional. */
export type AdminUpdateUserInput = Partial<AdminCreateUserInput>;

/**
 * `POST /api/v1/admin/user` responds with `{ ...user.toObject(), password: <plaintext> }` —
 * the one place the backend ever returns a plaintext password, and only once, at creation.
 * Never persist or re-display this after the initial response.
 */
export interface CreatedStaffUser extends OncreUser {
  password: string;
}
