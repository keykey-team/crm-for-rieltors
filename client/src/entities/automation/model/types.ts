export interface Automation {
  id: string;
  name: string;
  description?: string | null;
  trigger: string;
  triggerValue?: string | null;
  action: string;
  actionValue?: string | null;
  isActive: boolean;
  lastRunAt?: string | null;
  lastRunResult?: string | null;
}

export interface AutomationUpsertInput {
  name: string;
  description?: string;
  trigger: string;
  triggerValue?: string;
  action: string;
  actionValue?: string;
}
