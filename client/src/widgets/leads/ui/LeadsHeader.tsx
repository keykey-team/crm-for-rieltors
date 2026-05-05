import { Plus, Upload } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface LeadsHeaderProps {
  total: number;
  importing: boolean;
  t: (key: string) => string;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onCreate: () => void;
}

export function LeadsHeader({ total, importing, t, onImport, onCreate }: LeadsHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-display font-bold">{t('leads.title')}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {total} {t('common.contacts')}
        </p>
      </div>
      <div className="flex gap-2">
        <label
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 border border-border rounded-xl text-sm font-medium cursor-pointer hover:bg-muted transition',
            importing && 'opacity-50 pointer-events-none',
          )}
        >
          <Upload className="w-4 h-4" /> {importing ? t('leads.importing') : 'Excel'}
          <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={onImport} disabled={importing} />
        </label>
        <button
          onClick={onCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition"
        >
          <Plus className="w-4 h-4" /> {t('leads.addLead')}
        </button>
      </div>
    </div>
  );
}
