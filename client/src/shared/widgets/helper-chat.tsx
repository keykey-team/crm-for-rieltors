'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, X, Send, Loader2, AlertTriangle, Database, BookOpen } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/shared/lib/i18n/context';
import { cn } from '@/shared/lib/utils';

function interp(template: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce(
    (str, [k, v]) => str.replace(new RegExp(`\\{${k}\\}`, 'g'), v),
    template
  );
}

type ChatMode = 'helper' | 'assistant';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function HelperChat() {
  const { t } = useTranslation();
  const { data: session, status } = useSession() || {};
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<ChatMode>('helper');
  const [helperMessages, setHelperMessages] = useState<ChatMessage[]>([]);
  const [assistantMessages, setAssistantMessages] = useState<ChatMessage[]>([]);
  const messages = mode === 'helper' ? helperMessages : assistantMessages;
  const setMessages = mode === 'helper' ? setHelperMessages : setAssistantMessages;
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [used, setUsed] = useState(0);
  const [limit, setLimit] = useState(20);
  const [plan, setPlan] = useState('free');
  const [limitReached, setLimitReached] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Hide on auth pages
  const hiddenPaths = ['/login', '/signup'];
  const isHidden = hiddenPaths.some(p => pathname.startsWith(p));

  // Load chat history & usage on open
  const loadUsage = useCallback(async () => {
    try {
      const res = await fetch('/api/helper');
      if (!res.ok) return;
      const data = await res.json();
      setUsed(data.used);
      setLimit(data.limit);
      setPlan(data.plan);
      setLimitReached(data.used >= data.limit);
      if (data.history?.length && !initialized) {
        // Separate history: assistant-mode messages are prefixed with [assistant]
        const helperHist: ChatMessage[] = [];
        const assistHist: ChatMessage[] = [];
        for (const m of data.history) {
          const msg: ChatMessage = { role: m.role, content: m.content.replace(/^\[assistant\]\s*/, '') };
          if (m.content.startsWith('[assistant]')) {
            assistHist.push(msg);
          } else {
            helperHist.push(msg);
          }
        }
        setHelperMessages(helperHist);
        setAssistantMessages(assistHist);
        setInitialized(true);
      }
    } catch {
      // silent
    }
  }, [initialized]);

  useEffect(() => {
    if (isOpen && status === 'authenticated' && !initialized) {
      loadUsage();
    }
  }, [isOpen, status, initialized, loadUsage]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const panel = document.getElementById('helper-chat-panel');
      const btn = document.getElementById('helper-chat-btn');
      if (panel?.contains(target) || btn?.contains(target)) return;
      setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  // Switch mode — keep separate histories
  const switchMode = (newMode: ChatMode) => {
    if (newMode === mode) return;
    setMode(newMode);
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading || limitReached) return;

    setInput('');
    const userMsg: ChatMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    const apiUrl = mode === 'assistant' ? '/api/assistant' : '/api/helper';

    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-10),
        }),
      });

      if (res.status === 429) {
        const data = await res.json();
        setUsed(data.used);
        setLimit(data.limit);
        setLimitReached(true);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: t('helper.limitReachedMsg'),
        }]);
        setIsLoading(false);
        return;
      }

      if (!res.ok) throw new Error('API error');

      // Stream response
      const reader = res.body?.getReader();
      if (!reader) throw new Error('No stream');

      const decoder = new TextDecoder();
      let assistantContent = '';
      let partialRead = '';

      // Add empty assistant message to stream into
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        partialRead += decoder.decode(value, { stream: true });
        const lines = partialRead.split('\n');
        partialRead = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            try {
              const parsed = JSON.parse(data);
              if (parsed.done) {
                setUsed(parsed.used);
                setLimit(parsed.limit);
                setLimitReached(parsed.used >= parsed.limit);
              } else if (parsed.content) {
                assistantContent += parsed.content;
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    role: 'assistant',
                    content: assistantContent,
                  };
                  return updated;
                });
              }
            } catch {
              // skip
            }
          }
        }
      }
    } catch (error) {
      console.error('Helper chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: t('helper.errorMsg'),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (isHidden || status !== 'authenticated') return null;

  const remaining = Math.max(0, limit - used);
  const usagePercent = limit > 0 ? (used / limit) * 100 : 0;

  return (
    <>
      {/* Toggle button */}
      <button
        id="helper-chat-btn"
        onClick={() => setIsOpen(v => !v)}
        className={cn(
          'fixed bottom-5 right-6 z-[9999] w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105',
          isOpen
            ? 'bg-muted-foreground text-white'
            : 'bg-[#073B34] text-[#CEFD56]'
        )}
        aria-label="FREEMO R Хелпер"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div
          id="helper-chat-panel"
          className="fixed bottom-[88px] right-6 z-[9999] w-[400px] max-w-[calc(100vw-32px)] h-[560px] max-h-[calc(100vh-120px)] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          {/* Header */}
          <div className="flex-shrink-0 bg-[#073B34] text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#CEFD56]/20 flex items-center justify-center">
                {mode === 'assistant' ? (
                  <Database className="w-4 h-4 text-[#CEFD56]" />
                ) : (
                  <MessageCircle className="w-4 h-4 text-[#CEFD56]" />
                )}
              </div>
              <div>
                <h4 className="text-sm font-semibold">
                  {mode === 'assistant' ? t('assistant.title') : 'FREEMO R Хелпер'}
                </h4>
                <p className="text-[10px] text-white/60">
                  {interp(t('helper.usageCounter'), { used: String(used), limit: String(limit) })}
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/10 rounded-lg transition">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mode switcher */}
          <div className="flex-shrink-0 px-3 pt-2 pb-0 flex gap-1 bg-muted/20">
            <button
              onClick={() => switchMode('helper')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg text-xs font-medium transition-all',
                mode === 'helper'
                  ? 'bg-card text-foreground border border-border border-b-transparent shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <BookOpen className="w-3 h-3" />
              {t('assistant.modeHelper')}
            </button>
            <button
              onClick={() => switchMode('assistant')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg text-xs font-medium transition-all',
                mode === 'assistant'
                  ? 'bg-card text-foreground border border-border border-b-transparent shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Database className="w-3 h-3" />
              {t('assistant.modeAssistant')}
            </button>
          </div>

          {/* Usage bar */}
          <div className="flex-shrink-0 px-4 py-1.5 bg-muted/30 border-b border-border">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
              <span>{interp(t('helper.messagesLeft'), { count: String(remaining) })}</span>
              <span className="uppercase font-medium">{plan}</span>
            </div>
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  usagePercent > 90 ? 'bg-red-500' : usagePercent > 70 ? 'bg-amber-500' : 'bg-[#073B34]'
                )}
                style={{ width: `${Math.min(100, usagePercent)}%` }}
              />
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground/60">
                <div className="w-12 h-12 rounded-2xl bg-[#073B34]/10 dark:bg-[#CEFD56]/10 flex items-center justify-center mb-3">
                  {mode === 'assistant' ? (
                    <Database className="w-6 h-6 text-[#073B34] dark:text-[#CEFD56]" />
                  ) : (
                    <MessageCircle className="w-6 h-6 text-[#073B34] dark:text-[#CEFD56]" />
                  )}
                </div>
                <p className="text-sm font-medium mb-1">
                  {mode === 'assistant' ? t('assistant.welcomeTitle') : t('helper.welcomeTitle')}
                </p>
                <p className="text-xs">
                  {mode === 'assistant' ? t('assistant.welcomeSubtitle') : t('helper.welcomeSubtitle')}
                </p>
                {mode === 'assistant' && (
                  <div className="mt-3 flex flex-wrap gap-1.5 justify-center">
                    {[t('assistant.hint1'), t('assistant.hint2'), t('assistant.hint3')].map((h, i) => (
                      <button key={i} onClick={() => { setInput(h); inputRef.current?.focus(); }}
                        className="text-[11px] px-2.5 py-1 bg-muted/80 rounded-lg hover:bg-muted transition text-foreground/70 hover:text-foreground">
                        {h}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                <div
                  className={cn(
                    'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap',
                    msg.role === 'user'
                      ? 'bg-[#073B34] text-white rounded-br-md'
                      : 'bg-muted text-foreground rounded-bl-md'
                  )}
                >
                  {msg.content || (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span className="text-xs">{t('helper.thinking')}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Limit reached banner */}
          {limitReached && (
            <div className="flex-shrink-0 px-4 py-2.5 bg-amber-50 dark:bg-amber-950/30 border-t border-amber-200 dark:border-amber-800/40 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-300">
                {t('helper.limitBanner')}
              </p>
            </div>
          )}

          {/* Input */}
          <div className="flex-shrink-0 p-3 border-t border-border bg-card">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={limitReached ? t('helper.limitReachedPlaceholder') : mode === 'assistant' ? t('assistant.placeholder') : t('helper.placeholder')}
                disabled={isLoading || limitReached}
                rows={1}
                className="flex-1 resize-none px-3 py-2.5 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#073B34]/20 dark:focus:ring-[#CEFD56]/20 placeholder:text-muted-foreground/50 disabled:opacity-50 max-h-24"
                style={{ minHeight: '40px' }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading || limitReached}
                className="p-2.5 rounded-xl bg-[#073B34] text-[#CEFD56] hover:opacity-90 transition disabled:opacity-30 flex-shrink-0"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
