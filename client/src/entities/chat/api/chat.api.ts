import type { ChatMessage, ChatRoom } from "../model/types";

const CURRENT_AGENCY_KEY = 'crm_current_agency_id';

async function parseJson<T>(res: Response): Promise<T> {
  const raw = await res.text();
  let data: any = null;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = raw;
  }
  if (!res.ok) {
    const message =
      typeof data === 'string'
        ? data
        : data && typeof data === 'object'
          ? (data.error || data.message)
          : undefined;
    throw new Error(message || "Request failed");
  }
  return data as T;
}

function withAgencyHeader(headers: HeadersInit = {}): Headers {
  const result = new Headers(headers);
  if (typeof window !== 'undefined') {
    const currentAgencyId = window.localStorage.getItem(CURRENT_AGENCY_KEY);
    if (currentAgencyId) result.set('X-Agency-Id', currentAgencyId);
  }
  return result;
}

export async function getChatRooms(): Promise<ChatRoom[]> {
  const res = await fetch("/api/chat", { headers: withAgencyHeader() });
  const data = await parseJson<unknown>(res);
  return Array.isArray(data) ? (data as ChatRoom[]) : [];
}

export async function getChatUsers(): Promise<Array<{ id: string; name?: string | null; email?: string | null; role?: string | null; avatar?: string | null }>> {
  try {
    const res = await fetch('/api/chat/users', { headers: withAgencyHeader() });
    const data = await parseJson<unknown>(res);
    if (Array.isArray(data)) {
      return data as Array<{ id: string; name?: string | null; email?: string | null; role?: string | null; avatar?: string | null }>;
    }
  } catch {
    // Compatibility fallback when backend doesn't expose /api/chat/users yet.
  }

  const fallbackRes = await fetch('/api/users', { headers: withAgencyHeader() });
  const fallbackData = await parseJson<unknown>(fallbackRes);
  return Array.isArray(fallbackData)
    ? (fallbackData as Array<{ id: string; name?: string | null; email?: string | null; role?: string | null; avatar?: string | null }>)
    : [];
}

export async function getChatMessages(roomId: string): Promise<ChatMessage[]> {
  const res = await fetch(`/api/chat?roomId=${roomId}`, { headers: withAgencyHeader() });
  const data = await parseJson<unknown>(res);
  return Array.isArray(data) ? (data as ChatMessage[]) : [];
}

export async function getThreadMessages(
  roomId: string,
  threadId: string,
): Promise<ChatMessage[]> {
  const res = await fetch(`/api/chat?roomId=${roomId}&threadId=${threadId}`, { headers: withAgencyHeader() });
  const data = await parseJson<unknown>(res);
  return Array.isArray(data) ? (data as ChatMessage[]) : [];
}

export async function sendChatMessage(payload: {
  roomId: string;
  text: string;
  mentions?: string[];
  threadId?: string;
}): Promise<ChatMessage> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: withAgencyHeader({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  return parseJson<ChatMessage>(res);
}

export async function createChatRoom(payload: {
  name?: string;
  memberIds: string[];
}): Promise<any> {
  const res = await fetch("/api/chat/rooms", {
    method: "POST",
    headers: withAgencyHeader({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  return parseJson<any>(res);
}

export async function updateChatRoom(payload: {
  roomId: string;
  name?: string;
  addMemberIds?: string[];
  removeMemberIds?: string[];
}): Promise<any> {
  const res = await fetch("/api/chat/rooms", {
    method: "PUT",
    headers: withAgencyHeader({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  return parseJson<any>(res);
}

export async function deleteChatRoom(roomId: string): Promise<void> {
  const res = await fetch(`/api/chat/rooms?roomId=${roomId}`, {
    method: "DELETE",
    headers: withAgencyHeader(),
  });
  if (!res.ok) throw new Error("Failed to delete chat room");
}
