export interface KnowledgeBaseArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt?: string;
  author?: { id: string; name?: string | null } | null;
}

export interface KnowledgeBaseUpsertInput {
  title: string;
  content: string;
  category: string;
}

export interface KnowledgeBaseQuery {
  search?: string;
  category?: string;
}
