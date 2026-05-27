'use client';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

type Country = {
  code: string;
  flag: string;
  name: string;
  dialCode: string;
  maxDigits: number;
};

const COUNTRIES: Country[] = [
  { code: 'UA', flag: '🇺🇦', name: 'Україна',          dialCode: '+380', maxDigits: 9  },
  { code: 'PL', flag: '🇵🇱', name: 'Польща',           dialCode: '+48',  maxDigits: 9  },
  { code: 'DE', flag: '🇩🇪', name: 'Нiмеччина',        dialCode: '+49',  maxDigits: 11 },
  { code: 'GB', flag: '🇬🇧', name: 'Велика Британiя',  dialCode: '+44',  maxDigits: 10 },
  { code: 'FR', flag: '🇫🇷', name: 'Францiя',          dialCode: '+33',  maxDigits: 9  },
  { code: 'IT', flag: '🇮🇹', name: 'Iталiя',           dialCode: '+39',  maxDigits: 10 },
  { code: 'ES', flag: '🇪🇸', name: 'Iспанiя',          dialCode: '+34',  maxDigits: 9  },
  { code: 'AT', flag: '🇦🇹', name: 'Австрiя',          dialCode: '+43',  maxDigits: 10 },
  { code: 'CZ', flag: '🇨🇿', name: 'Чехiя',            dialCode: '+420', maxDigits: 9  },
  { code: 'SK', flag: '🇸🇰', name: 'Словаччина',       dialCode: '+421', maxDigits: 9  },
  { code: 'RO', flag: '🇷🇴', name: 'Румунiя',          dialCode: '+40',  maxDigits: 9  },
  { code: 'HU', flag: '🇭🇺', name: 'Угорщина',         dialCode: '+36',  maxDigits: 9  },
  { code: 'MD', flag: '🇲🇩', name: 'Молдова',          dialCode: '+373', maxDigits: 8  },
  { code: 'BY', flag: '🇧🇾', name: 'Бiлорусь',         dialCode: '+375', maxDigits: 9  },
  { code: 'GE', flag: '🇬🇪', name: 'Грузiя',           dialCode: '+995', maxDigits: 9  },
  { code: 'TR', flag: '🇹🇷', name: 'Туреччина',        dialCode: '+90',  maxDigits: 10 },
  { code: 'IL', flag: '🇮🇱', name: 'Iзраїль',          dialCode: '+972', maxDigits: 9  },
  { code: 'AE', flag: '🇦🇪', name: 'ОАЕ',              dialCode: '+971', maxDigits: 9  },
  { code: 'KZ', flag: '🇰🇿', name: 'Казахстан',        dialCode: '+7',   maxDigits: 10 },
  { code: 'US', flag: '🇺🇸', name: 'США',              dialCode: '+1',   maxDigits: 10 },
];

const DEFAULT = COUNTRIES[0];

function detectCountry(value: string): { country: Country; local: string } {
  if (!value) return { country: DEFAULT, local: '' };
  const sorted = [...COUNTRIES].sort((a, b) => b.dialCode.length - a.dialCode.length);
  for (const c of sorted) {
    if (value.startsWith(c.dialCode)) {
      return { country: c, local: value.slice(c.dialCode.length) };
    }
  }
  return { country: DEFAULT, local: value.replace(/[^0-9\s\-()]/g, '') };
}

interface PhoneInputProps {
  value: string;
  onChange: (v: string) => void;
  error?: boolean;
  className?: string;
}

export function PhoneInput({ value, onChange, error, className }: PhoneInputProps) {
  const init = detectCountry(value);
  const [country, setCountry] = useState<Country>(init.country);
  const [local, setLocal] = useState(init.local);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLocal = (raw: string) => {
    // strip everything except digits, space, hyphen, parentheses
    const filtered = raw.replace(/[^0-9\s\-()]/g, '');
    const digits = filtered.replace(/\D/g, '');
    if (digits.length > country.maxDigits) return;
    setLocal(filtered);
    onChange(country.dialCode + digits);
  };

  const selectCountry = (c: Country) => {
    setCountry(c);
    setLocal('');
    onChange(c.dialCode);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <div className={cn(
        'flex items-center rounded-xl border bg-muted/30 overflow-hidden transition',
        error ? 'border-destructive/60' : 'border-border',
      )}>
        {/* Country selector button */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1 px-2.5 py-2.5 border-r border-border text-sm shrink-0 hover:bg-muted/50 transition"
        >
          <span className="text-base leading-none">{country.flag}</span>
          <span className="text-xs text-muted-foreground font-mono w-9 text-center">{country.dialCode}</span>
          <ChevronDown className={cn('w-3 h-3 text-muted-foreground transition-transform', open && 'rotate-180')} />
        </button>

        {/* Phone number input */}
        <input
          type="tel"
          inputMode="tel"
          value={local}
          onChange={(e) => handleLocal(e.target.value)}
          placeholder="XX XXX XX XX"
          className="flex-1 px-3 py-2.5 text-sm bg-transparent outline-none min-w-0"
        />
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-30 top-full left-0 mt-1 w-64 bg-popover border border-border rounded-xl shadow-lg overflow-y-auto max-h-60">
          {COUNTRIES.map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => selectCountry(c)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-muted/60 text-left transition',
                c.code === country.code && 'bg-primary/5 text-primary font-medium',
              )}
            >
              <span className="text-base shrink-0">{c.flag}</span>
              <span className="flex-1 truncate">{c.name}</span>
              <span className="text-xs text-muted-foreground font-mono shrink-0">{c.dialCode}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
