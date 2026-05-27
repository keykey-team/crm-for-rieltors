'use client';
import { useTranslation } from '@/shared/lib/i18n/context';
import { useState } from 'react';
import { X } from 'lucide-react';
import { PROPERTY_TYPES, PROPERTY_STATUSES } from '@/shared/lib/constants';
import type { Property, PropertyUpsertInput } from '@/entities/property';
import { parseForm, propertySchema } from '@/shared/lib/validation';

export function PropertyDialog({ property, onSave, onClose }: { property: Property | null; onSave: (d: PropertyUpsertInput) => void | Promise<void>; onClose: () => void }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    title: property?.title ?? '', type: property?.type ?? 'apartment',
    address: property?.address ?? '', district: property?.district ?? '',
    city: property?.city ?? 'Київ', rooms: property?.rooms?.toString() ?? '',
    area: property?.area?.toString() ?? '', floor: property?.floor?.toString() ?? '',
    totalFloors: property?.totalFloors?.toString() ?? '', price: property?.price?.toString() ?? '',
    currency: property?.currency ?? 'USD', status: property?.status ?? 'active',
    description: property?.description ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const upd = (k: string, v: string) => { setForm((p) => ({ ...p, [k]: v })); setErrors((p) => ({ ...p, [k]: '' })); setSubmitError(''); };

  const toNum = (v: string) => (v !== '' ? Number(v) : undefined);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = parseForm(propertySchema, {
      title: form.title,
      address: form.address,
      price: toNum(form.price),
      floor: toNum(form.floor),
      totalFloors: toNum(form.totalFloors),
    });
    if (!validation.ok) { setErrors(validation.errors); return; }
    setErrors({});
    setSaving(true);
    setSubmitError('');
    try {
      await onSave(form);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : t('common.errorSave'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" style={{ boxShadow: 'var(--shadow-lg)' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="font-display font-bold text-lg">{property ? t('properties.dialog.editProperty') : t('properties.dialog.newProperty')}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {submitError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {submitError}
            </div>
          ) : null}
          <div>
            <label className="text-sm font-medium mb-1 block">{t('common.title')} *</label>
            <input value={form.title} onChange={(e) => upd('title', e.target.value)}
              className={`w-full px-3 py-2.5 rounded-xl border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${errors.title ? 'border-destructive/60' : 'border-border'}`} />
            {errors.title && <p className="text-xs text-destructive mt-1">{errors.title}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">{t('common.type')}</label>
              <select value={form.type} onChange={(e) => upd('type', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm">
                {PROPERTY_TYPES.map((pt: any) => <option key={pt.value} value={pt.value}>{t(`const.propertyType.${pt.value}`) || pt.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{t('common.status')}</label>
              <select value={form.status} onChange={(e) => upd('status', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm">
                {PROPERTY_STATUSES.map((ps: any) => <option key={ps.value} value={ps.value}>{t(`const.propertyStatus.${ps.value}`) || ps.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">{t('common.address')} *</label>
            <input value={form.address} onChange={(e) => upd('address', e.target.value)}
              className={`w-full px-3 py-2.5 rounded-xl border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${errors.address ? 'border-destructive/60' : 'border-border'}`} />
            {errors.address && <p className="text-xs text-destructive mt-1">{errors.address}</p>}
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">{t('common.rooms')}</label>
              <input type="number" value={form.rooms} onChange={(e) => upd('rooms', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{t('common.area')} (м²)</label>
              <input type="number" value={form.area} onChange={(e) => upd('area', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{t('common.price')} *</label>
              <input type="number" value={form.price} onChange={(e) => upd('price', e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${errors.price ? 'border-destructive/60' : 'border-border'}`} />
              {errors.price && <p className="text-xs text-destructive mt-1">{errors.price}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">{t('common.floor')}</label>
              <input type="number" value={form.floor} onChange={(e) => upd('floor', e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${errors.floor ? 'border-destructive/60' : 'border-border'}`} />
              {errors.floor && <p className="text-xs text-destructive mt-1">{errors.floor}</p>}
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{t('common.totalFloors')}</label>
              <input type="number" value={form.totalFloors} onChange={(e) => upd('totalFloors', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">{t('common.description')}</label>
            <textarea rows={3} value={form.description} onChange={(e) => upd('description', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-muted">{t('common.cancel')}</button>
            <button type="submit" disabled={saving}
              className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition disabled:opacity-50">
              {saving ? t('common.saving') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
