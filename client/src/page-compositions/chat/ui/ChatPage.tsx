'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, MessageCircle, Search, User } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useSession } from 'next-auth/react';
import { formatDateTime, getInitials } from '@/shared/lib/format';
import { useTranslation } from '@/shared/lib/i18n/context';

export function ChatPage() {
  const { t } = useTranslation();
  const { data: session } = useSession() || {};
  const userId = (session?.user as any)?.id;
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/chat');
      const data = await res.json();
      setConversations(Array.isArray(data) ? data : []);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  const fetchMessages = useCallback(async () => {
    if (!selectedUser) return;
    try {
      const res = await fetch(`/api/chat?userId=${selectedUser.id}`);
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch { /* ignore */ }
  }, [selectedUser]);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);
  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  useEffect(() => {
    if (selectedUser) {
      pollRef.current = setInterval(() => { fetchMessages(); fetchConversations(); }, 5000);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [selectedUser, fetchMessages, fetchConversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMsg.trim() || !selectedUser) return;
    await fetch('/api/chat', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receiverId: selectedUser.id, text: newMsg }),
    });
    setNewMsg('');
    fetchMessages();
    fetchConversations();
  };

  const filteredConvs = conversations.filter(c => 
    !search || c.user?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  return (
    <div>
      <h1 className="text-2xl font-display font-bold mb-6">
        {t('chat.title')} {totalUnread > 0 && <span className="text-sm bg-primary text-white px-2 py-0.5 rounded-full ml-2">{totalUnread}</span>}
      </h1>

      <div className="flex bg-white rounded-2xl border border-border overflow-hidden" style={{ boxShadow: 'var(--shadow-sm)', height: 'calc(100vh - 180px)', minHeight: '500px' }}>
        <div className="w-80 border-r border-border flex flex-col">
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('common.search')}
                className="w-full pl-9 pr-3 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="space-y-2 p-3">{[1,2,3].map(i => <div key={i} className="h-14 bg-muted animate-pulse rounded-xl" />)}</div>
            ) : filteredConvs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">{t('chat.noConversations')}</p>
            ) : (
              filteredConvs.map(conv => (
                <button key={conv.user?.id} onClick={() => setSelectedUser(conv.user)}
                  className={cn('w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition text-left',
                    selectedUser?.id === conv.user?.id && 'bg-primary/5')}>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold flex-shrink-0">
                    {getInitials(conv.user?.name ?? '?')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate">{conv.user?.name ?? 'User'}</p>
                      {conv.unreadCount > 0 && (
                        <span className="w-5 h-5 bg-primary text-white text-[10px] rounded-full flex items-center justify-center flex-shrink-0">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {conv.lastMessage?.text ?? t('chat.noMessages')}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          {!selectedUser ? (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
              <MessageCircle className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm">{t('chat.selectUser')}</p>
            </div>
          ) : (
            <>
              <div className="px-5 py-3 border-b border-border flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                  {getInitials(selectedUser.name ?? '?')}
                </div>
                <div>
                  <p className="text-sm font-medium">{selectedUser.name ?? 'User'}</p>
                  <p className="text-xs text-muted-foreground">{selectedUser.role}</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                {messages.map(msg => {
                  const isMine = msg.senderId === userId;
                  return (
                    <div key={msg.id} className={cn('flex', isMine ? 'justify-end' : 'justify-start')}>
                      <div className={cn('max-w-[70%] rounded-2xl px-4 py-2.5',
                        isMine ? 'bg-primary text-white rounded-br-md' : 'bg-muted rounded-bl-md')}>
                        <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                        <p className={cn('text-[10px] mt-1', isMine ? 'text-white/70' : 'text-muted-foreground')}>
                          {formatDateTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <div className="px-5 py-3 border-t border-border">
                <div className="flex gap-2">
                  <input value={newMsg} onChange={e => setNewMsg(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                    placeholder={t('chat.typeMessage')}
                    className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  <button onClick={sendMessage} className="p-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
