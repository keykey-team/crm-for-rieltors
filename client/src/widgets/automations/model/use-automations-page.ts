import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { confirmAction } from '@/shared/lib/confirm-action';
import { createAutomation, deleteAutomation, getAutomations, updateAutomation } from '@/entities/automation';
import type { Automation, AutomationUpsertInput } from '@/entities/automation';

export function useAutomationsPage(t: (k: string) => string) {
  const triggers = useMemo(() => [
    { value: 'stage_change', label: t('automations.trigger.stage_change') },
    { value: 'new_lead', label: t('automations.trigger.new_lead') },
    { value: 'task_overdue', label: t('automations.trigger.task_overdue') },
    { value: 'no_response', label: t('automations.trigger.no_response') },
    { value: 'deal_closed', label: t('automations.trigger.deal_closed') },
  ], [t]);

  const actions = useMemo(() => [
    { value: 'create_task', label: t('automations.action.create_task') },
    { value: 'send_message', label: t('automations.action.send_message') },
    { value: 'assign_agent', label: t('automations.action.assign_agent') },
    { value: 'change_status', label: t('automations.action.change_status') },
    { value: 'notify', label: t('automations.action.notify') },
  ], [t]);

  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<Automation | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setAutomations(await getAutomations());
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = useCallback(async (formData: AutomationUpsertInput) => {
    try {
      if (editing) await updateAutomation(editing.id, formData);
      else await createAutomation(formData);
      toast.success(editing ? t('common.updated') : t('common.created'));
      setShowDialog(false);
      setEditing(null);
      fetchData();
    } catch {
      toast.error(t('common.errorSave'));
      throw new Error(t('common.errorSave'));
    }
  }, [editing, fetchData, t]);

  const toggleActive = useCallback(async (item: Automation) => {
    await updateAutomation(item.id, { isActive: !item.isActive });
    fetchData();
  }, [fetchData]);

  const handleDelete = useCallback(async (id: string) => {
    const ok = await confirmAction(t('automations.deleteAutomation'), { confirm: t('common.delete'), cancel: t('common.cancel') });
    if (!ok) return;
    await deleteAutomation(id);
    toast.success(t('common.deleted'));
    fetchData();
  }, [fetchData, t]);

  return {
    automations,
    loading,
    showDialog,
    setShowDialog,
    editing,
    setEditing,
    triggers,
    actions,
    handleSave,
    toggleActive,
    handleDelete,
  };
}
