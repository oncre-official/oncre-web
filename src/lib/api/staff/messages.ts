import { apiRequest, toQueryString } from "@/lib/api/http-json";
import type { ListResult } from "@/types/api";
import type { Message } from "@/types/message";

export function listMessages(params: { skip?: number; limit?: number } = {}): Promise<ListResult<Message>> {
  return apiRequest(`/api/staff/messages?${toQueryString(params)}`);
}
