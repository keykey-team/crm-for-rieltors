import { X } from 'lucide-react';

interface DealDialogHeaderProps {
  title: string;
  onClose: () => void;
}

export function DealDialogHeader({ title, onClose }: DealDialogHeaderProps) {
  return (
    <div className="flex items-center justify-between p-6 border-b border-border">
      <h2 className="font-display font-bold text-lg">{title}</h2>
      <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted" type="button">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
