export interface Communication {
  id: string;
  leadId: string;
  type: string;
  direction?: string | null;
  content: string;
  createdAt: string;
  user?: { id: string; name?: string | null } | null;
}
