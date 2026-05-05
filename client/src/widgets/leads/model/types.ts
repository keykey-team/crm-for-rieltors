export type LeadViewMode = 'table' | 'kanban';

export interface LeadFilters {
  search: string;
  status: string;
  source: string;
}
