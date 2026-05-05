export interface LeadDialogProps {
  lead: any;
  onSave: (data: LeadFormValues) => Promise<void> | void;
  onClose: () => void;
}

export interface LeadFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  source: string;
  status: string;
  needType: string;
  budget: string;
  priority: string;
  notes: string;
  districts: string;
  propertyType: string;
}
