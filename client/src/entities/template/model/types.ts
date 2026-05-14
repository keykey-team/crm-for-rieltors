export interface Template {
  id: string;
  name: string;
  type: string;
  category: string;
  content: string;
}

export interface TemplateUpsertInput {
  name: string;
  type: string;
  category: string;
  content: string;
}

export interface TemplatesQuery {
  type?: string;
}
