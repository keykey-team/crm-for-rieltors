'use client';

import { useEffect, useMemo, useState } from 'react';
import { Copy, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { getLeads, type Lead } from '@/entities/lead';
import { getProperties, type Property } from '@/entities/property';
import { getPublicUrl } from '@/entities/client-selection';
import { useTranslation } from '@/shared/lib/i18n/context';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog';
import { useCreateSelection } from '../model/useCreateSelection';

export function CreateSelectionPanel({ onCreated }: { onCreated?: () => void }) {
  const { t } = useTranslation();
  const { submit, loading } = useCreateSelection();
  const [open, setOpen] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [leadId, setLeadId] = useState('');
  const [propertyIds, setPropertyIds] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!open) return;
    getLeads().then(setLeads).catch(() => setLeads([]));
    getProperties().then(setProperties).catch(() => setProperties([]));
  }, [open]);

  const filteredProperties = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return properties;
    return properties.filter((item) => [item.title, item.address, item.district, item.city].filter(Boolean).join(' ').toLowerCase().includes(normalized));
  }, [properties, query]);

  const toggleProperty = (id: string) => {
    setPropertyIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleCreate = async () => {
    if (!leadId || propertyIds.length === 0) return;
    const created = await submit({ leadId, propertyIds, title, message });
    await navigator.clipboard.writeText(getPublicUrl(created.publicSlug));
    toast.success(t('selections.createdAndCopied'));
    setPropertyIds([]);
    setTitle('');
    setMessage('');
    setOpen(false);
    onCreated?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm text-white">
          <Plus className="h-4 w-4" />{t('selections.newSelection')}
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-hidden rounded-2xl border-border bg-card p-0 shadow-[var(--shadow-lg)] sm:rounded-2xl">
        <DialogHeader className="border-b border-border px-5 py-4">
          <DialogTitle>{t('selections.newSelection')}</DialogTitle>
          <DialogDescription>{t('selections.createDescription')}</DialogDescription>
        </DialogHeader>
        <div className="grid max-h-[68vh] gap-4 overflow-y-auto px-5 py-4 lg:grid-cols-[1fr_1.2fr]">
          <SelectionMetaForm leads={leads} leadId={leadId} setLeadId={setLeadId} title={title} setTitle={setTitle} message={message} setMessage={setMessage} t={t} />
          <PropertyPicker properties={filteredProperties} propertyIds={propertyIds} query={query} setQuery={setQuery} toggleProperty={toggleProperty} t={t} />
        </div>
        <DialogFooter className="border-t border-border px-5 py-4">
          <button disabled={loading || !leadId || propertyIds.length === 0} onClick={handleCreate} className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm text-white disabled:opacity-50">
            <Copy className="h-4 w-4" />
            {loading ? t('common.saving') : `${t('selections.createAndCopy')} (${propertyIds.length})`}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface SelectionMetaFormProps {
  leads: Lead[]; leadId: string; setLeadId: (value: string) => void;
  title: string; setTitle: (value: string) => void; message: string; setMessage: (value: string) => void;
  t: (key: string) => string;
}

function SelectionMetaForm({ leads, leadId, setLeadId, title, setTitle, message, setMessage, t }: SelectionMetaFormProps) {
  return (
    <div className="space-y-3">
      <select value={leadId} onChange={(e) => setLeadId(e.target.value)} className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm">
        <option value="">{t('selections.selectClient')}</option>
        {leads.map((lead) => <option key={lead.id} value={lead.id}>{[lead.firstName, lead.lastName].filter(Boolean).join(' ')} - {lead.phone}</option>)}
      </select>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('selections.title')} className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm" />
      <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder={t('selections.message')} className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm" rows={5} />
    </div>
  );
}

interface PropertyPickerProps {
  properties: Property[]; propertyIds: string[]; query: string;
  setQuery: (value: string) => void; toggleProperty: (id: string) => void; t: (key: string) => string;
}

function PropertyPicker({ properties, propertyIds, query, setQuery, toggleProperty, t }: PropertyPickerProps) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('selections.searchProperties')} className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-sm" />
      </div>
      <div className="max-h-[44vh] overflow-auto rounded-lg border border-border">
        {properties.map((property) => (
          <label key={property.id} className="flex items-start gap-2 border-b border-border p-3 text-sm last:border-b-0 hover:bg-muted/40">
            <input type="checkbox" checked={propertyIds.includes(property.id)} onChange={() => toggleProperty(property.id)} className="mt-0.5" />
            <span className="min-w-0">
              <span className="block truncate font-medium">{property.title}</span>
              <span className="block truncate text-xs text-muted-foreground">{property.address || property.district || property.city || t('selections.noAddress')}</span>
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
