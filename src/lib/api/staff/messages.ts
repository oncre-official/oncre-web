import { apiRequest } from "@/lib/api/http-json";
import type { ListResult } from "@/types/api";
import type { Message } from "@/types/message";

export function listMessages(params: { skip?: number; limit?: number } = {}): Promise<ListResult<Message>> {
  const query = new URLSearchParams(params as Record<string, string>).toString();
  return apiRequest(`/api/staff/messages?${query}`);
}
