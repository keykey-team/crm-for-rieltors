'use client';

import { useEffect, useId } from 'react';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { addPropertyPricePoint } from '@/entities/property-price-history';

const schema = z.object({
  price: z.coerce.number().positive(),
  currency: z.string().trim().min(3).max(3).optional(),
  reason: z.string().trim().min(1).max(120).optional(),
  note: z.string().trim().max(500).optional(),
});

type FormValues = z.infer<typeof schema>;

export function AddPricePointModal({
  propertyId,
  t,
  onClose,
  onSaved,
}: {
  propertyId: string;
  t: (k: string) => string;
  onClose: () => void;
  onSaved: () => void | Promise<void>;
}) {
  const { data: session } = useSession();
  const titleId = useId();
  const role = (session?.user as any)?.role;
  const allowed = role === 'admin' || role === 'director';
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { currency: 'USD', reason: 'manual' },
  });

  if (!allowed) return null;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" role="dialog" aria-modal="true" aria-labelledby={titleId} onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-card p-4" onClick={(e) => e.stopPropagation()}>
        <h4 id={titleId} className="mb-3 font-semibold">{t('priceHistory.addPoint')}</h4>
        <form
          className="space-y-3"
          onSubmit={handleSubmit(async (values) => {
            await addPropertyPricePoint(propertyId, values);
            await onSaved();
            onClose();
          })}
        >
          <div>
            <input className="w-full rounded-xl border px-3 py-2 text-sm" placeholder={t('priceHistory.price')} {...register('price')} />
            {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input className="rounded-xl border px-3 py-2 text-sm" placeholder={t('priceHistory.currency')} {...register('currency')} />
            <input className="rounded-xl border px-3 py-2 text-sm" placeholder={t('priceHistory.reason')} {...register('reason')} />
          </div>
          <textarea className="w-full rounded-xl border px-3 py-2 text-sm" placeholder={t('priceHistory.note')} {...register('note')} />
          <div className="flex justify-end gap-2">
            <button type="button" className="rounded-xl px-4 py-2 text-sm" onClick={onClose}>{t('common.cancel')}</button>
            <button type="submit" className="rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground" disabled={isSubmitting}>
              {isSubmitting ? t('common.saving') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
