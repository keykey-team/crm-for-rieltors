'use client';
import { useState, useRef, useEffect, ReactNode } from 'react';
import ReactDOM from 'react-dom';
import { HelpCircle, X } from 'lucide-react';
import { useHints } from '@/shared/lib/hints-context';
import { cn } from '@/shared/lib/utils';

function Portal({ children }: { children: ReactNode }): any {
  const [el, setEl] = useState<HTMLElement | null>(null);
  useEffect(() => { setEl(document.body); }, []);
  if (!el) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (ReactDOM as any).createPortal(children, el);
}

interface HintTooltipProps {
  text: string;
  children?: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  iconClassName?: string;
}

export function HintTooltip({ text, children, position = 'top', className, iconClassName }: HintTooltipProps) {
  const { hintsEnabled } = useHints();
  const [visible, setVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  /* Close on outside click */
  useEffect(() => {
    if (!visible) return;
    const handler = (e: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node) &&
          btnRef.current && !btnRef.current.contains(e.target as Node)) {
        setVisible(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [visible]);

  /* Calculate desktop popover position */
  useEffect(() => {
    if (!visible || !btnRef.current || typeof window === 'undefined') return;
    if (window.innerWidth < 640) { setPos(null); return; } // mobile uses bottom sheet
    const rect = btnRef.current.getBoundingClientRect();
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;
    let top = 0, left = 0;
    const TW = 288; // w-72 = 18rem = 288px
    if (position === 'bottom') {
      top = rect.bottom + scrollY + 8;
      left = rect.left + scrollX + rect.width / 2 - TW / 2;
    } else {
      top = rect.top + scrollY - 8;
      left = rect.left + scrollX + rect.width / 2 - TW / 2;
    }
    // Clamp to viewport
    left = Math.max(12, Math.min(left, window.innerWidth - TW - 12));
    setPos({ top, left });
  }, [visible, position]);

  if (!hintsEnabled) return children ? <>{children}</> : null;

  const close = () => setVisible(false);

  return (
    <span className={cn('relative inline-flex items-center gap-1', className)}>
      {children}
      <button ref={btnRef}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setVisible(!visible); }}
        className={cn(
          'inline-flex items-center justify-center w-5 h-5 rounded-full text-primary/60 hover:text-primary hover:bg-primary/10 transition-all duration-200 flex-shrink-0',
          iconClassName
        )}
        type="button" aria-label="hint">
        <HelpCircle className="w-4 h-4" />
      </button>

      {/* Desktop popover via portal */}
      {visible && pos && (
        <Portal>
          <div ref={tooltipRef}
            className="z-[9999] w-72 animate-in fade-in-0 zoom-in-95 duration-200 hidden sm:block"
            style={{ top: pos.top, left: pos.left, position: 'absolute' }}>
            <div className="relative bg-slate-800 text-white text-xs leading-relaxed rounded-xl px-4 py-3 shadow-xl">
              <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); close(); }}
                className="absolute top-1.5 right-1.5 text-white/50 hover:text-white" type="button">
                <X className="w-3 h-3" />
              </button>
              <div className="pr-4">{text}</div>
            </div>
          </div>
        </Portal>
      )}

      {/* Mobile bottom sheet via portal */}
      {visible && (
        <Portal>
          <div className="fixed inset-0 z-[9999] sm:hidden" onClick={close}>
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
            <div ref={!pos ? tooltipRef : undefined} onClick={e => e.stopPropagation()}
              className="absolute bottom-0 left-0 right-0 bg-card rounded-t-2xl p-5 pb-8 shadow-2xl animate-in slide-in-from-bottom-4 duration-300 safe-area-bottom">
              <div className="flex items-start justify-between gap-3 mb-1">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <HelpCircle className="w-4 h-4 text-primary" />
                </div>
                <button onClick={close} className="p-1.5 rounded-lg hover:bg-muted transition" type="button">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <p className="text-sm leading-relaxed text-foreground mt-2">{text}</p>
            </div>
          </div>
        </Portal>
      )}
    </span>
  );
}