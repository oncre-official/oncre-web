import { apiRequest } from "@/lib/api/http-json";
import type { ChangePinFormValues } from "@/lib/validation/staff.schema";
import type { OncreUser } from "@/types/user";

export function getSession(): Promise<{ user: OncreUser | null }> {
  return apiRequest("/api/staff/auth/session");
}

export function getProfile(): Promise<OncreUser> {
  return apiRequest("/api/staff/users/profile");
}

export function changePin(input: ChangePinFormValues): Promise<OncreUser> {
  return apiRequest("/api/staff/users/update-pin", { method: "PATCH", body: input });
}

export function login(value: string, password: string): Promise<{ user: OncreUser }> {
  return apiRequest("/api/staff/auth/login", { method: "POST", body: { value, password } });
}

export function logout(): Promise<null> {
  return apiRequest("/api/staff/auth/logout", { method: "POST" });
}
