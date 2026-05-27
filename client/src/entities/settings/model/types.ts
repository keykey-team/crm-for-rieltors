import type { User } from '@/entities/user';

export interface ProfileSettings {
  id?: string;
  name?: string | null;
  phone?: string | null;
  avatar?: string | null;
}

export interface BrandSettings {
  brandName?: string | null;
  brandLogo?: string | null;
  themeMode?: string | null;
  sidebarGlass?: boolean | null;
  sidebarOpacity?: number | null;
  gradientBg?: boolean | null;
}

export interface Funnel {
  id: string;
  name: string;
  isDefault: boolean;
  isActive: boolean;
  order: number;
  stages: FunnelStage[];
}

export interface FunnelStage {
  id: string;
  label: string;
  value: string;
  color: string;
  funnelId?: string | null;
  isDefault?: boolean;
}

export interface DealCustomField {
  id: string;
  name: string;
  label: string;
  fieldType: string;
  options?: string | null;
}

export interface DictionaryItem {
  id: string;
  category: string;
  value: string;
  label: string;
}

export interface DistributionRule {
  id: string;
  name?: string;
  source?: string;
  managerId?: string;
}

export interface AftercarePlan {
  id: string;
  name: string;
}

export type TeamUser = User;
