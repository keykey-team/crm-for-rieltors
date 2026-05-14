export interface ChatRoom {
  id: string;
  type: 'direct' | 'group' | string;
  name?: string | null;
  unreadCount?: number;
  members?: Array<{ id: string; name?: string | null; avatar?: string | null; role?: string | null }>;
  lastMessage?: { text?: string; sender?: { name?: string | null } } | null;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  text: string;
  threadId?: string | null;
  createdAt: string;
  sender?: { id: string; name?: string | null; avatar?: string | null } | null;
  _count?: { replies?: number };
}
