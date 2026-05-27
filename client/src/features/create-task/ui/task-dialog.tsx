'use client';
import { useTranslation } from '@/shared/lib/i18n/context';
import { useState } from 'react';
import { X } from 'lucide-react';
import { TASK_TYPES, PRIORITIES } from '@/shared/lib/constants';
import type { Task, TaskUpsertInput } from '@/entities/task';
import { toast } from 'sonner';
import { parseForm, taskSchema } from '@/shared/lib/validation';

export function TaskDialog({ task, onSave, onClose }: { task: Task | null; onSave: (d: TaskUpsertInput) => void | Promise<void>; onClose: () => void }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    title: task?.title ?? '', description: task?.description ?? '',
    type: task?.type ?? 'call', priority: task?.priority ?? 'medium',
    dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : '',
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const upd = (k: string, v: string) => { setForm((p) => ({ ...p, [k]: v })); setErrors((p) => ({ ...p, [k]: '' })); };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl w-full max-w-md" style={{ boxShadow: 'var(--shadow-lg)' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="font-display font-bold text-lg">{task ? t('tasks.dialog.editTask') : t('tasks.dialog.newTask')}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted"><X className="w-4 h-4" /></button>
        </div>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const validation = parseForm(taskSchema, { title: form.title, description: form.description || undefined, dueDate: form.dueDate });
            if (!validation.ok) { setErrors(validation.errors); return; }
            setErrors({});
            setSaving(true);
            try {
              const normalizedDueDate =
                form.dueDate && !Number.isNaN(new Date(form.dueDate).getTime())
                  ? new Date(form.dueDate).toISOString()
                  : undefined;
              await onSave({ ...form, dueDate: normalizedDueDate });
            } catch (err: any) {
              toast.error(err?.message || t('common.error'));
            } finally {
              setSaving(false);
            }
          }}
          className="p-6 space-y-4"
        >
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
                {TASK_TYPES.map((tt: any) => <option key={tt.value} value={tt.value}>{t(`const.taskType.${tt.value}`) || tt.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{t('common.priority')}</label>
              <select value={form.priority} onChange={(e) => upd('priority', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm">
                {PRIORITIES.map((p: any) => <option key={p.value} value={p.value}>{t(`const.priority.${p.value}`) || p.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">{t('common.deadline')} *</label>
            <input type="datetime-local" value={form.dueDate} onChange={(e) => upd('dueDate', e.target.value)}
              className={`w-full px-3 py-2.5 rounded-xl border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${errors.dueDate ? 'border-destructive/60' : 'border-border'}`} />
            {errors.dueDate && <p className="text-xs text-destructive mt-1">{errors.dueDate}</p>}
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">{t('common.description')}</label>
            <textarea rows={3} value={form.description} onChange={(e) => upd('description', e.target.value)}
              className={`w-full px-3 py-2.5 rounded-xl border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none ${errors.description ? 'border-destructive/60' : 'border-border'}`} />
            {errors.description && <p className="text-xs text-destructive mt-1">{errors.description}</p>}
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
