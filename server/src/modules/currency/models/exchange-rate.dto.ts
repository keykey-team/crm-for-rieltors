export interface ExchangeRateDto {
  rate: number;
  date: string;
  fetchedAt: number;
  stale?: boolean;
}

