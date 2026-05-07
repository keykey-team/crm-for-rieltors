import { toast } from 'sonner';

/**
 * Shows a toast confirmation instead of window.confirm().
 * Returns a Promise that resolves to true if confirmed, false if dismissed.
 */
export function confirmAction(message: string, labels?: { confirm?: string; cancel?: string }): Promise<boolean> {
  return new Promise((resolve) => {
    const toastId = toast(message, {
      duration: 10000,
      action: {
        label: labels?.confirm ?? 'Підтвердити',
        onClick: () => { resolve(true); },
      },
      cancel: {
        label: labels?.cancel ?? 'Скасувати',
        onClick: () => { resolve(false); },
      },
      onDismiss: () => { resolve(false); },
      onAutoClose: () => { resolve(false); },
    });
  });
}
