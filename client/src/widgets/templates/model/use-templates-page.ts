import { useCallback, useEffect, useMemo, useState } from 'react';
import { MessageSquare, ListChecks, FileCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { toast } from 'sonner';
import { confirmAction } from '@/shared/lib/confirm-action';
import { createTemplate, deleteTemplate, getTemplates, updateTemplate } from '@/entities/template';
import type { Template, TemplateUpsertInput } from '@/entities/template';

interface TemplateTypeOption {
  value: string;
  label: string;
  icon: LucideIcon;
}

interface TemplateCategoryOption {
  value: string;
  label: string;
}

export function useTemplatesPage(t: (k: string) => string) {
  const templateTypes = useMemo<TemplateTypeOption[]>(() => [
    { value: 'message', label: t('templates.message'), icon: MessageSquare },
    { value: 'checklist', label: t('templates.checklist'), icon: ListChecks },
    { value: 'document', label: t('templates.document'), icon: FileCheck },
  ], [t]);

  const templateCategories = useMemo<TemplateCategoryOption[]>(() => [
    { value: 'general', label: t('templates.category.general') },
    { value: 'welcome', label: t('templates.category.welcome') },
    { value: 'follow_up', label: t('templates.category.follow_up') },
    { value: 'showing', label: t('templates.category.showing') },
    { value: 'deposit', label: t('templates.category.deposit') },
    { value: 'deal', label: t('templates.category.deal') },
    { value: 'aftercare', label: t('templates.category.aftercare') },
  ], [t]);

  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<Template | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setTemplates(await getTemplates({ type: typeFilter || undefined }));
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [typeFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = useCallback(async (formData: TemplateUpsertInput) => {
    try {
      if (editing) await updateTemplate(editing.id, formData);
      else await createTemplate(formData);
      toast.success(editing ? t('common.updated') : t('common.created'));
      setShowDialog(false);
      setEditing(null);
      fetchData();
    } catch {
      toast.error(t('common.errorSave'));
    }
  }, [editing, fetchData, t]);

  const handleDelete = useCallback(async (id: string) => {
    const ok = await confirmAction(t('templates.deleteTemplate'), { confirm: t('common.delete'), cancel: t('common.cancel') });
    if (!ok) return;
    await deleteTemplate(id);
    toast.success(t('common.deleted'));
    fetchData();
  }, [fetchData, t]);

  const copyContent = useCallback((content: string) => {
    navigator.clipboard.writeText(content);
    toast.success(t('common.copiedToClipboard'));
  }, [t]);

  return {
    templates,
    loading,
    typeFilter,
    setTypeFilter,
    showDialog,
    setShowDialog,
    editing,
    setEditing,
    templateTypes,
    templateCategories,
    handleSave,
    handleDelete,
    copyContent,
  };
}
