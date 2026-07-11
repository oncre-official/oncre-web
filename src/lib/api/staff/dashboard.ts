import { apiRequest } from "@/lib/api/http-json";
import type { DashboardSummary } from "@/types/dashboard";

export function getDashboardSummary(): Promise<DashboardSummary> {
  return apiRequest("/api/staff/dashboard/summary");
}
