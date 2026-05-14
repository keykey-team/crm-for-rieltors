'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Users, Workflow, Building, CheckSquare, X, ArrowRight } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useTranslation } from '@/shared/lib/i18n/context';
import { formatPrice } from '@/shared/lib/format';

export function SearchPalette() {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setResults(null);
      setSelected(0);
    }
  }, [open]);

  const doSearch = useCallback((q: string) => {
    if (q.length < 2) { setResults(null); return; }
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(q)}`)
      .then(r => r.json())
      .then(d => { setResults(d); setSelected(0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleInput = (val: string) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 300);
  };

  // Build flat items list for keyboard navigation
  const allItems: { type: string; href: string; label: string; sub?: string }[] = [];
  if (results) {
    results.leads?.forEach((l: any) => allItems.push({
      type: 'lead', href: `/leads/${l.id}`,
      label: `${l.firstName} ${l.lastName ?? ''}`.trim(), sub: l.phone,
    }));
    results.deals?.forEach((d: any) => allItems.push({
      type: 'deal', href: `/deals/${d.id}`,
      label: d.title, sub: d.amount ? formatPrice(d.amount, 'USD', locale) : undefined,
    }));
    results.properties?.forEach((p: any) => allItems.push({
      type: 'property', href: `/properties`,
      label: p.title, sub: p.address,
    }));
    results.tasks?.forEach((tk: any) => allItems.push({
      type: 'task', href: `/tasks`,
      label: tk.title, sub: tk.priority,
    }));
  }

  const navigate = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, allItems.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
    else if (e.key === 'Enter' && allItems[selected]) { navigate(allItems[selected].href); }
  };

  const typeIcon = (type: string) => {
    switch (type) {
      case 'lead': return <Users className="w-4 h-4 text-blue-500" />;
      case 'deal': return <Workflow className="w-4 h-4 text-[#073B34] dark:text-[#CEFD56]" />;
      case 'property': return <Building className="w-4 h-4 text-emerald-500" />;
      case 'task': return <CheckSquare className="w-4 h-4 text-amber-500" />;
      default: return null;
    }
  };

  const typeLabel = (type: string) => {
    switch (type) {
      case 'lead': return t('nav.leads');
      case 'deal': return t('nav.deals');
      case 'property': return t('nav.properties');
      case 'task': return t('nav.tasks');
      default: return '';
    }
  };

  if (!open) return null;

  // Group items by type for section headers
  const groupedTypes = ['lead', 'deal', 'property', 'task'].filter(type =>
    allItems.some(i => i.type === type)
  );
  let itemIdx = -1;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]" onClick={() => setOpen(false)}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg bg-card rounded-2xl border border-border overflow-hidden"
        style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
        onClick={e => e.stopPropagation()}>
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <input ref={inputRef} value={query} onChange={e => handleInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('search.placeholder')}
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground" />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground bg-muted rounded border border-border">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto">
          {loading && (
            <div className="p-6 text-center text-sm text-muted-foreground">{t('common.loading')}...</div>
          )}

          {!loading && results && allItems.length === 0 && (
            <div className="p-8 text-center">
              <Search className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">{t('search.noResults')}</p>
            </div>
          )}

          {!loading && allItems.length > 0 && (
            <div className="py-2">
              {groupedTypes.map(type => (
                <div key={type}>
                  <p className="px-4 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">{typeLabel(type)}</p>
                  {allItems.filter(i => i.type === type).map(item => {
                    itemIdx++;
                    const idx = itemIdx;
                    return (
                      <button key={`${item.type}-${item.href}-${idx}`}
                        onClick={() => navigate(item.href)}
                        onMouseEnter={() => setSelected(idx)}
                        className={cn(
                          'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                          selected === idx ? 'bg-primary/10' : 'hover:bg-muted/50'
                        )}>
                        {typeIcon(item.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.label}</p>
                          {item.sub && <p className="text-xs text-muted-foreground truncate">{item.sub}</p>}
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40" />
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}

          {!loading && !results && (
            <div className="p-6 text-center">
              <p className="text-xs text-muted-foreground">{t('search.hint')}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-muted/30 text-[10px] text-muted-foreground">
          <span>↑↓ {t('search.navigate')}</span>
          <span>↵ {t('search.open')}</span>
        </div>
      </div>
    </div>
  );
}
