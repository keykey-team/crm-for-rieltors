'use client';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/context';

const STORAGE_KEY = 'crm_telegram_bot_url';

const TelegramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>
);

export function TelegramAssistant() {
  const { t } = useTranslation();
  const [telegramUrl, setTelegramUrl] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const url = localStorage.getItem(STORAGE_KEY);
    if (url) setTelegramUrl(url);

    const handleStorageChange = () => {
      const updated = localStorage.getItem(STORAGE_KEY);
      setTelegramUrl(updated);
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('telegram-url-updated', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('telegram-url-updated', handleStorageChange);
    };
  }, []);

  if (!mounted || !telegramUrl) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {/* Tooltip */}
      {showTooltip && (
        <div className="bg-white rounded-xl border border-border px-4 py-3 max-w-[240px] animate-in fade-in slide-in-from-bottom-2 duration-200" style={{ boxShadow: 'var(--shadow-lg)' }}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-foreground">{t('telegram.callTitle')}</p>
              <p className="text-xs text-muted-foreground mt-1">{t('telegram.callTooltip')}</p>
            </div>
            <button onClick={() => setShowTooltip(false)} className="p-0.5 hover:bg-muted rounded-lg transition flex-shrink-0">
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => window.open(telegramUrl, '_blank', 'noopener,noreferrer')}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={cn(
          'group flex items-center justify-center w-14 h-14 rounded-full',
          'bg-[#2AABEE] hover:bg-[#229ED9] text-white',
          'transition-all duration-300 hover:scale-105',
          'focus:outline-none focus:ring-2 focus:ring-[#2AABEE]/50 focus:ring-offset-2'
        )}
        style={{ boxShadow: '0 4px 20px rgba(42, 171, 238, 0.4)' }}
        aria-label={t('telegram.callTitle')}
      >
        <TelegramIcon className="w-7 h-7" />
      </button>
    </div>
  );
}
