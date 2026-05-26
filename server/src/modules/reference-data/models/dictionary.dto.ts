export interface DictionaryQuery {
  category?: string;
}

export interface DictionaryReorderItem {
  id: string;
  order: number;
}

export interface DictionaryUpdateInput {
  id?: string;
  items?: DictionaryReorderItem[];
  [key: string]: unknown;
}

