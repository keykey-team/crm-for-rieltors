export interface DealDialogProps {
  deal: any;
  onSave: (data: DealFormValues) => Promise<void> | void;
  onClose: () => void;
}

export interface DealFormValues {
  title: string;
  stage: string;
  amount: string;
  commission: string;
  notes: string;
}
