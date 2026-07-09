import { apiRequest } from "./http-json";
import { CreateFiLeadInput, FiLead } from "@/types/fi-lead";

export function submitFiLead(input: CreateFiLeadInput & { website?: string }): Promise<FiLead> {
  return apiRequest<FiLead>("/api/leads/fi", { method: "POST", body: input });
}
