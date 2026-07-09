export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export interface Role {
  _id: string;
  name: string;
  description?: string;
}

/** Mirrors oncre-backend `User` model (src/app/user/model/user.model.ts). */
export interface OncreUser {
  _id: string;
  country_code: string;
  phone?: string;
  email?: string;
  role_id: string;
  role?: Role;
  phone_verified: boolean;
  email_verified: boolean;
  password_changed: boolean;
  status: UserStatus;
  last_login?: string;
  created_at?: string;
}
