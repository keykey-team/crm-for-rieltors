import { Users, User, Workflow, Edit2, Book, Target, Heart, Palette } from 'lucide-react';

export const ROLES_STATIC = [
  { value: 'admin', labelKey: 'role.admin', descKey: 'common.fullAccess' },
  { value: 'director', labelKey: 'role.director', descKey: 'common.viewAndManage' },
  { value: 'agent', labelKey: 'role.agent', descKey: 'common.basicOps' },
] as const;

export const TABS_STATIC = [
  { key: 'profile', labelKey: 'settings.profile', icon: User },
  { key: 'users', labelKey: 'settings.users', icon: Users, adminOnly: true, feature: 'team' },
  { key: 'funnel', labelKey: 'settings.funnel', icon: Workflow, adminOnly: true },
  { key: 'customFields', labelKey: 'settings.customFields', icon: Edit2, adminOnly: true },
  { key: 'dictionaries', labelKey: 'settings.dictionaries', icon: Book, adminOnly: true },
  { key: 'distribution', labelKey: 'settings.distribution', icon: Target, adminOnly: true, feature: 'distribution' },
  { key: 'aftercare', labelKey: 'settings.aftercare', icon: Heart, adminOnly: true, feature: 'aftercare' },
  { key: 'branding', labelKey: 'settings.branding', icon: Palette, feature: 'branding' },
] as const;
