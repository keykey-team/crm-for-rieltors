export interface CalendarEvent {
  id: string;
  title: string;
  startDate: string;
  endDate?: string | null;
  location?: string | null;
  description?: string | null;
  type?: string | null;
}

export interface CalendarEventUpsertInput {
  title: string;
  startDate: string;
  endDate?: string;
  location?: string;
  description?: string;
  type?: string;
}

export interface CalendarTokenResponse {
  token: string | null;
}
