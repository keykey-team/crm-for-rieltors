'use client';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Send, MessageCircle, Search, Users, Plus, Hash, User, Reply, X, AtSign, ChevronLeft, Settings, Pencil, UserMinus, UserPlus, Check, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import { formatDateTime, getInitials } from '@/lib/format';
import { useTranslation } from '@/lib/i18n/context';
import { confirmAction } from '@/lib/confirm-action';

interface MentionUser {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
}

// ────── Mention Input Component ──────
function MentionInput({
  value,
  onChange,
  onSend,
  users,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: (text: string, mentionIds: string[]) => void;
  users: MentionUser[];
  placeholder: string;
}) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [query, setQuery] = useState('');
  const [cursorIdx, setCursorIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    if (!query) return users;
    const q = query.toLowerCase();
    return users.filter(u => u.name?.toLowerCase().includes(q));
  }, [users, query]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    onChange(v);
    const pos = e.target.selectionStart ?? v.length;
    // Check if user is typing @mention
    const textBefore = v.slice(0, pos);
    const atMatch = textBefore.match(/@(\w*)$/);
    if (atMatch) {
      setShowSuggestions(true);
      setQuery(atMatch[1]);
      setCursorIdx(0);
    } else {
      setShowSuggestions(false);
    }
  };

  const insertMention = (user: MentionUser) => {
    const pos = inputRef.current?.selectionStart ?? value.length;
    const textBefore = value.slice(0, pos);
    const textAfter = value.slice(pos);
    const atIdx = textBefore.lastIndexOf('@');
    const newText = textBefore.slice(0, atIdx) + `@${user.name} ` + textAfter;
    onChange(newText);
    setShowSuggestions(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showSuggestions && filtered.length > 0) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setCursorIdx(i => Math.min(i + 1, filtered.length - 1)); return; }
      if (e.key === 'ArrowUp') { e.preventDefault(); setCursorIdx(i => Math.max(i - 1, 0)); return; }
      if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); insertMention(filtered[cursorIdx]); return; }
      if (e.key === 'Escape') { setShowSuggestions(false); return; }
    }
    if (e.key === 'Enter' && !e.shiftKey && !showSuggestions) {
      e.preventDefault();
      // Extract mentions
      const mentionIds = users
        .filter(u => value.includes(`@${u.name}`))
        .map(u => u.id);
      onSend(value, mentionIds);
    }
  };

  return (
    <div className="relative flex-1">
      <input ref={inputRef} value={value} onChange={handleChange} onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
      {showSuggestions && filtered.length > 0 && (
        <div className="absolute bottom-full left-0 mb-1 w-64 bg-popover border border-border rounded-xl shadow-lg max-h-48 overflow-y-auto z-50">
          {filtered.map((u, i) => (
            <button key={u.id} onClick={() => insertMention(u)}
              className={cn('w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted/50 transition',
                i === cursorIdx && 'bg-primary/5')}>
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold">
                {getInitials(u.name ?? '?')}
              </div>
              <span className="truncate">{u.name}</span>
              {u.role && <span className="text-xs text-muted-foreground ml-auto">{u.role}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ────── Message Bubble with @highlight ──────
function MessageBubble({
  msg, isMine, users, onThreadClick,
}: {
  msg: any; isMine: boolean; users: MentionUser[];
  onThreadClick?: (msg: any) => void;
}) {
  const { t } = useTranslation();
  const renderText = (text: string) => {
    // Highlight @mentions
    const parts = text.split(/(@\S+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        const name = part.slice(1);
        const mentionedUser = users.find(u => u.name === name);
        if (mentionedUser) {
          return <span key={i} className="bg-primary/15 text-primary font-medium px-0.5 rounded">{part}</span>;
        }
      }
      return <span key={i}>{part}</span>;
    });
  };

  const replyCount = msg._count?.replies || 0;

  return (
    <div className={cn('flex', isMine ? 'justify-end' : 'justify-start')}>
      <div className="max-w-[70%] group">
        {!isMine && (
          <p className="text-[10px] text-muted-foreground mb-0.5 px-1">{msg.sender?.name}</p>
        )}
        <div className={cn('rounded-2xl px-4 py-2.5 relative',
          isMine ? 'bg-primary text-white rounded-br-md' : 'bg-muted rounded-bl-md')}>
          <p className="text-sm whitespace-pre-wrap">{renderText(msg.text)}</p>
          <p className={cn('text-[10px] mt-1', isMine ? 'text-white/70' : 'text-muted-foreground')}>
            {formatDateTime(msg.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2 mt-0.5 px-1">
          {onThreadClick && (
            <button onClick={() => onThreadClick(msg)}
              className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition opacity-0 group-hover:opacity-100">
              <Reply className="w-3 h-3" />
              {replyCount > 0 ? `${replyCount} ${t('chat.replies')}` : t('chat.reply')}
            </button>
          )}
          {replyCount > 0 && (
            <button onClick={() => onThreadClick?.(msg)}
              className="text-[10px] text-primary font-medium hover:underline">
              {replyCount} {t('chat.replies')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ────── Thread Panel ──────
function ThreadPanel({
  parentMsg, roomId, userId, users, onClose,
}: {
  parentMsg: any; roomId: string; userId: string; users: MentionUser[];
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [replies, setReplies] = useState<any[]>([]);
  const [newReply, setNewReply] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  const fetchReplies = useCallback(async () => {
    const res = await fetch(`/api/chat?roomId=${roomId}&threadId=${parentMsg.id}`);
    const data = await res.json();
    setReplies(Array.isArray(data) ? data : []);
  }, [roomId, parentMsg.id]);

  useEffect(() => { fetchReplies(); }, [fetchReplies]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [replies]);

  const sendReply = async (text: string, mentionIds: string[]) => {
    if (!text.trim()) return;
    await fetch('/api/chat', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId, text, threadId: parentMsg.id, mentions: mentionIds }),
    });
    setNewReply('');
    fetchReplies();
  };

  return (
    <div className="absolute inset-0 md:relative md:inset-auto md:w-80 border-l border-border flex flex-col bg-card z-10">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-1.5">
          <Reply className="w-4 h-4" /> {t('chat.thread')}
        </h3>
        <button onClick={onClose} className="p-1 hover:bg-muted rounded-lg"><X className="w-4 h-4" /></button>
      </div>

      {/* Parent message */}
      <div className="px-4 py-3 border-b border-border bg-muted/20">
        <p className="text-xs text-muted-foreground mb-0.5">{parentMsg.sender?.name}</p>
        <p className="text-sm">{parentMsg.text}</p>
        <p className="text-[10px] text-muted-foreground mt-1">{formatDateTime(parentMsg.createdAt)}</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {replies.map(r => (
          <MessageBubble key={r.id} msg={r} isMine={r.senderId === userId} users={users} />
        ))}
        <div ref={endRef} />
      </div>

      <div className="px-3 py-2 border-t border-border flex gap-2">
        <MentionInput value={newReply} onChange={setNewReply}
          onSend={sendReply} users={users} placeholder={t('chat.replyPlaceholder')} />
        <button onClick={() => sendReply(newReply, users.filter(u => newReply.includes(`@${u.name}`)).map(u => u.id))}
          className="p-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ────── Create Group Dialog ──────
function CreateGroupDialog({
  users, onClose, onCreate,
}: {
  users: MentionUser[]; onClose: () => void;
  onCreate: (name: string, memberIds: string[]) => void;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');

  const filtered = users.filter(u =>
    !search || u.name?.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl w-full max-w-[420px] max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold">{t('chat.createGroup')}</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-lg"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          <input value={name} onChange={e => setName(e.target.value)}
            placeholder={t('chat.groupName')}
            className="w-full px-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
          <div>
            <label className="text-xs text-muted-foreground font-medium mb-1.5 block">{t('chat.addMembers')}</label>
            <div className="relative mb-2">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder={t('common.search')}
                className="w-full pl-8 pr-3 py-1.5 border border-border rounded-lg text-sm focus:outline-none" />
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {filtered.map(u => (
                <button key={u.id} onClick={() => toggle(u.id)}
                  className={cn('w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition',
                    selected.has(u.id) ? 'bg-primary/10 text-primary' : 'hover:bg-muted/50')}>
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold">
                    {getInitials(u.name ?? '?')}
                  </div>
                  <span className="flex-1 text-left truncate">{u.name}</span>
                  {selected.has(u.id) && <span className="text-primary text-xs">✓</span>}
                </button>
              ))}
            </div>
          </div>
          {selected.size > 0 && (
            <p className="text-xs text-muted-foreground">{t('chat.selectedCount')}: {selected.size}</p>
          )}
        </div>
        <div className="px-5 py-3 border-t border-border flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-xl border border-border hover:bg-muted transition">{t('common.cancel')}</button>
          <button onClick={() => onCreate(name, Array.from(selected))}
            disabled={selected.size === 0}
            className="px-4 py-2 text-sm bg-primary text-white rounded-xl hover:bg-primary/90 transition disabled:opacity-50">
            {t('common.create')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ────── Group Settings Panel ──────
function GroupSettingsPanel({
  room, allUsers, userId, onClose, onUpdated, onDelete,
}: {
  room: any; allUsers: MentionUser[]; userId: string;
  onClose: () => void; onUpdated: (room: any) => void; onDelete: () => void;
}) {
  const { t } = useTranslation();
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(room.name || '');
  const [saving, setSaving] = useState(false);
  const [addSearch, setAddSearch] = useState('');
  const [showAddMembers, setShowAddMembers] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const currentMemberIds = new Set((room.members || []).map((m: any) => m.id));
  const availableUsers = allUsers.filter(u => !currentMemberIds.has(u.id));
  const filteredAvailable = availableUsers.filter(u =>
    !addSearch || u.name?.toLowerCase().includes(addSearch.toLowerCase())
  );

  useEffect(() => {
    if (editingName) setTimeout(() => nameInputRef.current?.focus(), 50);
  }, [editingName]);

  const saveName = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/chat/rooms', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: room.id, name: name.trim() }),
      });
      const data = await res.json();
      onUpdated({ ...room, name: name.trim(), members: data.members?.map((m: any) => m.user) || room.members });
    } catch { /* ignore */ }
    setSaving(false);
    setEditingName(false);
  };

  const addMember = async (uid: string) => {
    try {
      const res = await fetch('/api/chat/rooms', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: room.id, addMemberIds: [uid] }),
      });
      const data = await res.json();
      onUpdated({ ...room, members: data.members?.map((m: any) => m.user) || room.members });
    } catch { /* ignore */ }
  };

  const removeMember = async (uid: string) => {
    const ok = await confirmAction(t('chat.confirmRemoveMember'));
    if (!ok) return;
    try {
      const res = await fetch('/api/chat/rooms', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: room.id, removeMemberIds: [uid] }),
      });
      const data = await res.json();
      onUpdated({ ...room, members: data.members?.map((m: any) => m.user) || room.members });
    } catch { /* ignore */ }
  };

  return (
    <div className="absolute inset-0 md:relative md:inset-auto md:w-80 border-l border-border flex flex-col bg-card z-10">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-1.5">
          <Settings className="w-4 h-4" /> {t('chat.groupSettings')}
        </h3>
        <button onClick={onClose} className="p-1 hover:bg-muted rounded-lg"><X className="w-4 h-4" /></button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Group name */}
        <div className="px-4 py-4 border-b border-border">
          <label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{t('chat.groupName')}</label>
          {editingName ? (
            <div className="flex items-center gap-2 mt-1.5">
              <input ref={nameInputRef} value={name} onChange={e => setName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false); }}
                className="flex-1 px-2.5 py-1.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              <button onClick={saveName} disabled={saving}
                className="p-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50">
                <Check className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => { setEditingName(false); setName(room.name || ''); }}
                className="p-1.5 hover:bg-muted rounded-lg">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between mt-1.5">
              <p className="text-sm font-medium">{room.name || t('chat.group')}</p>
              <button onClick={() => setEditingName(true)}
                className="p-1.5 hover:bg-muted rounded-lg transition" title={t('chat.editName')}>
                <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
          )}
        </div>

        {/* Members */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
              {t('chat.members')} ({(room.members || []).length})
            </label>
            <button onClick={() => setShowAddMembers(!showAddMembers)}
              className={cn('p-1.5 rounded-lg transition', showAddMembers ? 'bg-primary/10 text-primary' : 'hover:bg-muted')}>
              <UserPlus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add members search */}
          {showAddMembers && (
            <div className="mb-3 p-2.5 bg-muted/30 rounded-xl">
              <div className="relative mb-2">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input value={addSearch} onChange={e => setAddSearch(e.target.value)}
                  placeholder={t('common.search')}
                  className="w-full pl-8 pr-3 py-1.5 border border-border rounded-lg text-sm bg-background focus:outline-none" />
              </div>
              {filteredAvailable.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-2">{t('chat.noUsersToAdd')}</p>
              ) : (
                <div className="max-h-32 overflow-y-auto space-y-0.5">
                  {filteredAvailable.map(u => (
                    <button key={u.id} onClick={() => addMember(u.id)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm hover:bg-card transition">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[9px] font-bold">
                        {getInitials(u.name ?? '?')}
                      </div>
                      <span className="flex-1 text-left truncate text-xs">{u.name}</span>
                      <Plus className="w-3 h-3 text-primary" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Member list */}
          <div className="space-y-1">
            {(room.members || []).map((m: any) => {
              const isMe = m.id === userId;
              return (
                <div key={m.id} className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-muted/30 transition group">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                    {getInitials(m.name ?? '?')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{m.name}{isMe ? ` (${t('chat.you')})` : ''}</p>
                    {m.role && <p className="text-[10px] text-muted-foreground">{m.role}</p>}
                  </div>
                  {!isMe && (
                    <button onClick={() => removeMember(m.id)}
                      className="p-1.5 rounded-lg hover:bg-destructive/10 transition opacity-0 group-hover:opacity-100"
                      title={t('chat.removeMember')}>
                      <UserMinus className="w-3.5 h-3.5 text-destructive" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Delete group */}
        <div className="px-4 py-4 border-t border-border">
          <button onClick={onDelete}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-destructive bg-destructive/5 hover:bg-destructive/10 transition">
            <Trash2 className="w-4 h-4" /> {t('chat.deleteChat')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ────── Main Chat Client ──────
export function ChatClient() {
  const { t } = useTranslation();
  const { data: session } = useSession() || {};
  const userId = (session?.user as any)?.id;
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [allUsers, setAllUsers] = useState<MentionUser[]>([]);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [threadMsg, setThreadMsg] = useState<any>(null);
  const [showMobileSidebar, setShowMobileSidebar] = useState(true);
  const [showGroupSettings, setShowGroupSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchRooms = useCallback(async () => {
    try {
      const res = await fetch('/api/chat');
      const data = await res.json();
      setRooms(Array.isArray(data) ? data : []);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  const fetchMessages = useCallback(async () => {
    if (!selectedRoom) return;
    try {
      const res = await fetch(`/api/chat?roomId=${selectedRoom.id}`);
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch { /* ignore */ }
  }, [selectedRoom]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setAllUsers(
        (Array.isArray(data) ? data : [])
          .filter((u: any) => u.id !== userId)
          .map((u: any) => ({ id: u.id, name: u.name ?? u.email, avatar: u.avatar, role: u.role }))
      );
    } catch { /* ignore */ }
  }, [userId]);

  useEffect(() => { fetchRooms(); fetchUsers(); }, [fetchRooms, fetchUsers]);
  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  useEffect(() => {
    if (selectedRoom) {
      pollRef.current = setInterval(() => { fetchMessages(); fetchRooms(); }, 5000);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [selectedRoom, fetchMessages, fetchRooms]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string, mentionIds: string[]) => {
    if (!text.trim() || !selectedRoom) return;
    await fetch('/api/chat', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId: selectedRoom.id, text, mentions: mentionIds }),
    });
    setNewMsg('');
    fetchMessages();
    fetchRooms();
  };

  const startDM = async (user: MentionUser) => {
    // Find existing DM room
    const existing = rooms.find(r =>
      r.type === 'direct' && r.members.some((m: any) => m.id === user.id)
    );
    if (existing) {
      setSelectedRoom(existing);
      setShowMobileSidebar(false);
      return;
    }
    // Create DM
    const res = await fetch('/api/chat', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'createRoom', memberIds: [user.id] }),
    });
    const room = await res.json();
    fetchRooms();
    setSelectedRoom({ id: room.id, type: 'direct', name: null, members: room.members?.map((m: any) => m.user) || [] });
    setShowMobileSidebar(false);
  };

  const createGroup = async (name: string, memberIds: string[]) => {
    const res = await fetch('/api/chat', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'createRoom', name, memberIds }),
    });
    const room = await res.json();
    setShowCreateGroup(false);
    fetchRooms();
    setSelectedRoom({ id: room.id, type: 'group', name, members: room.members?.map((m: any) => m.user) || [] });
    setShowMobileSidebar(false);
  };

  const deleteRoom = async (roomId: string) => {
    const ok2 = await confirmAction(t('chat.confirmDeleteChat'));
    if (!ok2) return;
    await fetch(`/api/chat/rooms?roomId=${roomId}`, { method: 'DELETE' });
    if (selectedRoom?.id === roomId) setSelectedRoom(null);
    fetchRooms();
  };

  const getRoomDisplayName = (room: any) => {
    if (room.name) return room.name;
    if (room.type === 'direct') {
      const other = room.members?.find((m: any) => m.id !== userId);
      return other?.name ?? t('chat.directMessage');
    }
    return room.members?.map((m: any) => m.name).join(', ') || t('chat.group');
  };

  const getRoomAvatar = (room: any) => {
    if (room.type === 'group') {
      return <Users className="w-4 h-4" />;
    }
    const other = room.members?.find((m: any) => m.id !== userId);
    return <span className="text-xs font-bold">{getInitials(other?.name ?? '?')}</span>;
  };

  const filteredRooms = rooms.filter(r =>
    !search || getRoomDisplayName(r).toLowerCase().includes(search.toLowerCase())
  );

  // Users not yet in any DM
  const availableForDM = allUsers.filter(u =>
    !rooms.some(r => r.type === 'direct' && r.members.some((m: any) => m.id === u.id))
  );

  const totalUnread = rooms.reduce((sum, r) => sum + (r.unreadCount || 0), 0);

  const roomUsers = useMemo(() => {
    if (!selectedRoom) return allUsers;
    return (selectedRoom.members || []).filter((m: any) => m.id !== userId).map((m: any) => ({
      id: m.id, name: m.name ?? 'User', avatar: m.avatar, role: m.role,
    }));
  }, [selectedRoom, allUsers, userId]);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#073B34] to-emerald-800 flex items-center justify-center shadow-sm">
          <MessageCircle className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-display font-bold tracking-tight flex items-center gap-2">
            {t('chat.title')} {totalUnread > 0 && <span className="text-sm bg-primary text-white px-2 py-0.5 rounded-full">{totalUnread}</span>}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">{t('chat.subtitle')}</p>
        </div>
      </div>

      <div className="flex relative bg-card rounded-2xl border border-border overflow-hidden" style={{ boxShadow: 'var(--shadow-sm)', height: 'calc(100vh - 180px)', minHeight: '400px', maxHeight: 'calc(100dvh - 100px)' }}>
        {/* Sidebar */}
        <div className={cn('w-full md:w-80 border-r border-border flex flex-col flex-shrink-0',
          !showMobileSidebar && 'hidden md:flex')}>
          <div className="p-3 border-b border-border flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('common.search')}
                className="w-full pl-9 pr-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <button onClick={() => setShowCreateGroup(true)}
              className="p-2 hover:bg-muted rounded-xl transition" title={t('chat.createGroup')}>
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Available users for new DM — always visible */}
            {(() => {
              const filtered = availableForDM.filter(u => !search || u.name?.toLowerCase().includes(search.toLowerCase()));
              return filtered.length > 0 ? (
                <div className="px-3 pt-2">
                  <p className="text-[10px] text-muted-foreground font-medium uppercase mb-1">{t('chat.contacts')}</p>
                  {filtered.map(u => (
                    <button key={u.id} onClick={() => startDM(u)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted/50 transition text-left text-sm">
                      <div className="w-8 h-8 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center text-green-600 text-xs font-bold">
                        {getInitials(u.name ?? '?')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{u.name}</p>
                        <p className="text-[10px] text-muted-foreground">{t('chat.newConversation')}</p>
                      </div>
                    </button>
                  ))}
                  <div className="border-b border-border mt-1 mb-1" />
                </div>
              ) : null;
            })()}

            {loading ? (
              <div className="space-y-2 p-3">{[1,2,3].map(i => <div key={i} className="h-14 bg-muted animate-pulse rounded-xl" />)}</div>
            ) : filteredRooms.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">{t('chat.noConversations')}</p>
            ) : (
              filteredRooms.map(room => (
                <button key={room.id} onClick={() => { setSelectedRoom(room); setThreadMsg(null); setShowGroupSettings(false); setShowMobileSidebar(false); }}
                  className={cn('w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition text-left',
                    selectedRoom?.id === room.id && 'bg-primary/5')}>
                  <div className={cn('w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                    room.type === 'group' ? 'bg-violet-50 text-violet-600' : 'bg-primary/10 text-primary')}>
                    {getRoomAvatar(room)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate">{getRoomDisplayName(room)}</p>
                      {room.unreadCount > 0 && (
                        <span className="w-5 h-5 bg-primary text-white text-[10px] rounded-full flex items-center justify-center flex-shrink-0">
                          {room.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {room.lastMessage ? (
                        <>
                          {room.type === 'group' && room.lastMessage.sender?.name && (
                            <span className="font-medium">{room.lastMessage.sender.name.split(' ')[0]}: </span>
                          )}
                          {room.lastMessage.text}
                        </>
                      ) : t('chat.noMessages')}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Main chat area */}
        <div className={cn('flex-1 flex flex-col min-w-0',
          showMobileSidebar && 'hidden md:flex')}>
          {!selectedRoom ? (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
              <MessageCircle className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm">{t('chat.selectChat')}</p>
              <button onClick={() => setShowCreateGroup(true)}
                className="mt-3 px-4 py-2 bg-primary text-white rounded-xl text-sm hover:bg-primary/90 transition flex items-center gap-2">
                <Plus className="w-4 h-4" /> {t('chat.createGroup')}
              </button>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="px-5 py-3 border-b border-border flex items-center gap-3">
                <button onClick={() => { setShowMobileSidebar(true); setSelectedRoom(null); }}
                  className="md:hidden p-1 hover:bg-muted rounded-lg">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className={cn('w-8 h-8 rounded-full flex items-center justify-center',
                  selectedRoom.type === 'group' ? 'bg-violet-50 text-violet-600' : 'bg-primary/10 text-primary')}>
                  {getRoomAvatar(selectedRoom)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{getRoomDisplayName(selectedRoom)}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedRoom.type === 'group'
                      ? `${selectedRoom.members?.length ?? 0} ${t('chat.members')}`
                      : selectedRoom.members?.find((m: any) => m.id !== userId)?.role ?? ''}
                  </p>
                </div>
                {selectedRoom.type === 'group' ? (
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-1.5">
                      {(selectedRoom.members || []).slice(0, 4).map((m: any) => (
                        <div key={m.id} className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[9px] font-bold text-muted-foreground" title={m.name}>
                          {getInitials(m.name ?? '?')}
                        </div>
                      ))}
                      {(selectedRoom.members?.length || 0) > 4 && (
                        <div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[9px] font-bold text-muted-foreground">
                          +{selectedRoom.members.length - 4}
                        </div>
                      )}
                    </div>
                    <button onClick={() => { setShowGroupSettings(!showGroupSettings); setThreadMsg(null); }}
                      className={cn('p-1.5 rounded-lg transition', showGroupSettings ? 'bg-violet-100 text-violet-600' : 'hover:bg-muted text-muted-foreground')}
                      title={t('chat.groupSettings')}>
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => deleteRoom(selectedRoom.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition"
                    title={t('chat.deleteChat')}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 flex overflow-hidden">
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                  {messages.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">{t('chat.noMessages')}</p>
                  )}
                  {messages.map(msg => (
                    <MessageBubble key={msg.id} msg={msg} isMine={msg.senderId === userId}
                      users={roomUsers} onThreadClick={(m) => setThreadMsg(m)} />
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Thread panel */}
                {threadMsg && (
                  <ThreadPanel parentMsg={threadMsg} roomId={selectedRoom.id} userId={userId}
                    users={roomUsers} onClose={() => setThreadMsg(null)} />
                )}

                {/* Group settings panel */}
                {showGroupSettings && selectedRoom?.type === 'group' && (
                  <GroupSettingsPanel
                    room={selectedRoom}
                    allUsers={allUsers}
                    userId={userId}
                    onClose={() => setShowGroupSettings(false)}
                    onUpdated={(updatedRoom: any) => {
                      setSelectedRoom(updatedRoom);
                      fetchRooms();
                    }}
                    onDelete={() => deleteRoom(selectedRoom.id)}
                  />
                )}
              </div>

              {/* Input */}
              <div className="px-5 py-3 border-t border-border flex gap-2">
                <MentionInput value={newMsg} onChange={setNewMsg}
                  onSend={sendMessage} users={roomUsers} placeholder={t('chat.typeMessage')} />
                <button onClick={() => sendMessage(newMsg, roomUsers.filter((u: MentionUser) => newMsg.includes(`@${u.name}`)).map((u: MentionUser) => u.id))}
                  className="p-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Create Group Dialog */}
      {showCreateGroup && (
        <CreateGroupDialog users={allUsers} onClose={() => setShowCreateGroup(false)} onCreate={createGroup} />
      )}
    </div>
  );
}
