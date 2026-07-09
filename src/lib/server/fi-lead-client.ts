import "server-only";

import { post, type BackendResult } from "@/lib/server/real-auth-client";
import type { CreateFiLeadInput, FiLead } from "@/types/fi-lead";

/** Server-only client for the real `POST /leads/fi` endpoint — public, unauthenticated. */
export function submitFiLeadToBackend(
  input: CreateFiLeadInput & { bot_suspected: boolean },
): Promise<BackendResult<FiLead>> {
  return post<FiLead>("/leads/fi", input);
}
