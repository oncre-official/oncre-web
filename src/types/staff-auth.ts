import type { OncreUser } from "./user";

/** Body for the real backend's `POST /api/v1/auth/login` (`{ value, password }` — email or phone in one field). */
export interface StaffLoginInput {
  value: string;
  password: string;
}

/** What the staff session cookie carries — the real backend JWT plus the user snapshot from login time. */
export interface StaffSession {
  token: string;
  user: OncreUser;
}
