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
  mask: string; // X = digit placeholder, other chars are formatting
};

const COUNTRIES: Country[] = [
  { code: 'UA', flag: '🇺🇦', name: 'Україна',         dialCode: '+380', maxDigits: 9,  mask: '(XX) XXX XX XX'   },
  { code: 'PL', flag: '🇵🇱', name: 'Польща',          dialCode: '+48',  maxDigits: 9,  mask: 'XXX XXX XXX'      },
  { code: 'DE', flag: '🇩🇪', name: 'Нiмеччина',       dialCode: '+49',  maxDigits: 11, mask: 'XXXX XXXXXXX'     },
  { code: 'GB', flag: '🇬🇧', name: 'Велика Британiя', dialCode: '+44',  maxDigits: 10, mask: 'XXXX XXXXXX'      },
  { code: 'FR', flag: '🇫🇷', name: 'Францiя',         dialCode: '+33',  maxDigits: 9,  mask: 'X XX XX XX XX'    },
  { code: 'IT', flag: '🇮🇹', name: 'Iталiя',          dialCode: '+39',  maxDigits: 10, mask: 'XXX XXXX XXX'     },
  { code: 'ES', flag: '🇪🇸', name: 'Iспанiя',         dialCode: '+34',  maxDigits: 9,  mask: 'XXX XXX XXX'      },
  { code: 'AT', flag: '🇦🇹', name: 'Австрiя',         dialCode: '+43',  maxDigits: 10, mask: 'XXX XXXXXXX'      },
  { code: 'CZ', flag: '🇨🇿', name: 'Чехiя',           dialCode: '+420', maxDigits: 9,  mask: 'XXX XXX XXX'      },
  { code: 'SK', flag: '🇸🇰', name: 'Словаччина',      dialCode: '+421', maxDigits: 9,  mask: 'XXX XXX XXX'      },
  { code: 'RO', flag: '🇷🇴', name: 'Румунiя',         dialCode: '+40',  maxDigits: 9,  mask: 'XXX XXX XXX'      },
  { code: 'HU', flag: '🇭🇺', name: 'Угорщина',        dialCode: '+36',  maxDigits: 9,  mask: 'XX XXX XXXX'      },
  { code: 'MD', flag: '🇲🇩', name: 'Молдова',         dialCode: '+373', maxDigits: 8,  mask: 'XX XXX XXX'       },
  { code: 'BY', flag: '🇧🇾', name: 'Бiлорусь',        dialCode: '+375', maxDigits: 9,  mask: '(XX) XXX XX XX'   },
  { code: 'GE', flag: '🇬🇪', name: 'Грузiя',          dialCode: '+995', maxDigits: 9,  mask: 'XXX XX XX XX'     },
  { code: 'TR', flag: '🇹🇷', name: 'Туреччина',       dialCode: '+90',  maxDigits: 10, mask: '(XXX) XXX XX XX'  },
  { code: 'IL', flag: '🇮🇱', name: 'Iзраїль',         dialCode: '+972', maxDigits: 9,  mask: 'XX XXX XXXX'      },
  { code: 'AE', flag: '🇦🇪', name: 'ОАЕ',             dialCode: '+971', maxDigits: 9,  mask: 'XX XXX XXXX'      },
  { code: 'KZ', flag: '🇰🇿', name: 'Казахстан',       dialCode: '+7',   maxDigits: 10, mask: '(XXX) XXX XX XX'  },
  { code: 'US', flag: '🇺🇸', name: 'США',             dialCode: '+1',   maxDigits: 10, mask: '(XXX) XXX XXXX'   },
];

const DEFAULT = COUNTRIES[0];

/** Applies mask: X is replaced with a digit, everything else is kept as-is */
function applyMask(digits: string, mask: string): string {
  let result = '';
  let di = 0;
  for (let i = 0; i < mask.length; i++) {
    if (di >= digits.length) break;
    if (mask[i] === 'X') {
      result += digits[di++];
    } else {
      result += mask[i];
    }
  }
  return result;
}

function detectCountry(value: string): { country: Country; digits: string } {
  if (!value) return { country: DEFAULT, digits: '' };
  const sorted = [...COUNTRIES].sort((a, b) => b.dialCode.length - a.dialCode.length);
  for (const c of sorted) {
    if (value.startsWith(c.dialCode)) {
      const raw = value.slice(c.dialCode.length).replace(/\D/g, '');
      return { country: c, digits: raw };
    }
  }
  return { country: DEFAULT, digits: value.replace(/\D/g, '') };
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
  const [display, setDisplay] = useState(() => applyMask(init.digits, init.country.mask));
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Sync display when value changes externally (e.g. form reset)
  useEffect(() => {
    // When value is empty keep the currently selected country, just clear the display
    if (!value) {
      setDisplay('');
      return;
    }
    const { country: c, digits } = detectCountry(value);
    const expected = c.dialCode + digits;
    const current = country.dialCode + display.replace(/\D/g, '');
    if (expected !== current) {
      setCountry(c);
      setDisplay(applyMask(digits, c.mask));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLocal = (raw: string) => {
    // digits only
    const digits = raw.replace(/\D/g, '');
    if (digits.length > country.maxDigits) return;
    const masked = applyMask(digits, country.mask);
    setDisplay(masked);
    // emit '' when no digits so the parent form sees an empty value and can validate "required"
    onChange(digits ? country.dialCode + digits : '');
  };

  const selectCountry = (c: Country) => {
    setCountry(c);
    setDisplay('');
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
          inputMode="numeric"
          value={display}
          onChange={(e) => handleLocal(e.target.value)}
          placeholder={applyMask('0'.repeat(country.maxDigits), country.mask).replace(/0/g, 'X')}
          className="flex-1 px-3 py-2.5 text-sm bg-transparent outline-none min-w-0"
        />
      </div>

      {/* Country dropdown */}
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
