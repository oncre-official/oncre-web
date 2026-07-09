import { apiRequest } from "@/lib/api/http-json";
import type { LgaRecord, StateRecord } from "@/types/shared";

export function listStates(): Promise<StateRecord[]> {
  return apiRequest("/api/staff/shared/state");
}

export function listLgas(stateId?: string): Promise<LgaRecord[]> {
  const query = stateId ? `?stateId=${encodeURIComponent(stateId)}` : "";
  return apiRequest(`/api/staff/shared/lga${query}`);
}
