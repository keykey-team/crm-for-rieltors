import type { ChatMessage, ChatRoom } from "../model/types";

async function parseJson<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok)
    throw new Error((data && (data.error || data.message)) || "Request failed");
  return data as T;
}

export async function getChatRooms(): Promise<ChatRoom[]> {
  const res = await fetch("/api/chat");
  const data = await parseJson<unknown>(res);
  return Array.isArray(data) ? (data as ChatRoom[]) : [];
}

export async function getChatMessages(roomId: string): Promise<ChatMessage[]> {
  const res = await fetch(`/api/chat?roomId=${roomId}`);
  const data = await parseJson<unknown>(res);
  return Array.isArray(data) ? (data as ChatMessage[]) : [];
}

export async function getThreadMessages(
  roomId: string,
  threadId: string,
): Promise<ChatMessage[]> {
  const res = await fetch(`/api/chat?roomId=${roomId}&threadId=${threadId}`);
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
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseJson<ChatMessage>(res);
}

export async function createChatRoom(payload: {
  name?: string;
  memberIds: string[];
}): Promise<any> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "createRoom", ...payload }),
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
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseJson<any>(res);
}

export async function deleteChatRoom(roomId: string): Promise<void> {
  const res = await fetch(`/api/chat/rooms?roomId=${roomId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete chat room");
}
