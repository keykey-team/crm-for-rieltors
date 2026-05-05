interface DealDialogActionsProps {
  saving: boolean;
  onClose: () => void;
  t: (key: string) => string;
}

export function DealDialogActions({ saving, onClose, t }: DealDialogActionsProps) {
  return (
    <div className="flex justify-end gap-3 pt-2">
      <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-muted">
        {t('common.cancel')}
      </button>
      <button
        type="submit"
        disabled={saving}
        className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
      >
        {saving ? t('common.saving') : t('common.save')}
      </button>
    </div>
  );
}
