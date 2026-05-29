export interface RankedProperty {
  id: string;
  title: string;
  type: string;
  status: string;
  address: string;
  district: string | null;
  rooms: number | null;
  area: number | null;
  price: number;
  currency: string;
  score: number;
  matchedBy: string[];
}

export type ClientReaction = 'like' | 'dislike' | 'want_to_view';
