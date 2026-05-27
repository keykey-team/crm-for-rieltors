export const DEAL_STAGES = [
  { value: 'new_lead', label: 'Новий лід', color: '#5AC8FA' },
  { value: 'contacted', label: 'Контакт встановлено', color: '#34C759' },
  { value: 'meeting_scheduled', label: 'Зустріч призначено', color: '#AF52DE' },
  { value: 'meeting_done', label: 'Зустріч проведено', color: '#30D158' },
  { value: 'showing', label: 'Покази', color: '#FF9F0A' },
  { value: 'negotiation', label: 'Переговори', color: '#FF6482' },
  { value: 'deposit', label: 'Завдаток', color: '#FF453A' },
  { value: 'documents', label: 'Документи', color: '#FFD60A' },
  { value: 'closed', label: 'Угода завершена', color: '#30D158' },
  { value: 'aftercare', label: 'Aftercare', color: '#64D2FF' },
  { value: 'cancelled', label: 'Скасовано', color: '#8E8E93' },
  { value: 'success', label: 'Успішно', color: '#30D158' },
  { value: 'rejected', label: 'Відмова', color: '#FF453A' },
  { value: 'object_cancelled', label: 'Об\'єкт скасовано', color: '#8E8E93' },
];

/** Stages that cannot be deleted by the user */
export const PROTECTED_STAGES = ['new_lead', 'success', 'rejected', 'object_cancelled'] as const;

/** Visual groups for funnel stages */
export const STAGE_GROUPS = [
  { key: 'incoming', labelKey: 'settings.stageGroupIncoming', stages: ['new_lead'] },
  { key: 'active', labelKey: 'settings.stageGroupActive', stages: ['contacted', 'meeting_scheduled', 'meeting_done', 'showing'] },
  { key: 'closing', labelKey: 'settings.stageGroupClosing', stages: ['negotiation', 'deposit', 'documents'] },
  { key: 'result', labelKey: 'settings.stageGroupResult', stages: ['closed', 'aftercare', 'cancelled', 'rejected'] },
] as const;

export const LEAD_SOURCES = [
  { value: 'manual', label: 'Вручну' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'olx', label: 'OLX' },
  { value: 'dom_ria', label: 'DOM.RIA' },
  { value: 'website', label: 'Сайт' },
  { value: 'referral', label: 'Рекомендація' },
  { value: 'other', label: 'Інше' },
];

export const LEAD_STATUSES = [
  ...DEAL_STAGES,
];

export const PROPERTY_TYPES = [
  { value: 'apartment', label: 'Квартира' },
  { value: 'house', label: 'Будинок' },
  { value: 'commercial', label: 'Комерція' },
  { value: 'land', label: 'Ділянка' },
];

export const PROPERTY_STATUSES = [
  { value: 'active', label: 'Активний', color: '#72BF78' },
  { value: 'sold', label: 'Продано', color: '#A19AD3' },
  { value: 'reserved', label: 'Зарезервовано', color: '#FF9149' },
  { value: 'inactive', label: 'Неактивний', color: '#EF476F' },
];

export const PROPERTY_DEAL_TYPES = [
  { value: 'sale', label: 'Продаж' },
  { value: 'rent', label: 'Оренда' },
];

export const TASK_TYPES = [
  { value: 'call', label: 'Дзвінок', icon: 'Phone' },
  { value: 'message', label: 'Повідомлення', icon: 'MessageSquare' },
  { value: 'meeting', label: 'Зустріч', icon: 'Users' },
  { value: 'showing', label: 'Показ', icon: 'Eye' },
  { value: 'documents', label: 'Документи', icon: 'FileText' },
  { value: 'other', label: 'Інше', icon: 'MoreHorizontal' },
];

export const PRIORITIES = [
  { value: 'low', label: 'Низький', color: '#80D8C3' },
  { value: 'medium', label: 'Середній', color: '#FF9149' },
  { value: 'high', label: 'Високий', color: '#EF476F' },
];

export const KB_CATEGORIES = [
  { value: 'general', label: 'Загальне' },
  { value: 'scripts', label: 'Скрипти' },
  { value: 'checklists', label: 'Чек-лісти' },
  { value: 'templates', label: 'Шаблони' },
  { value: 'legal', label: 'Юридичне' },
  { value: 'marketing', label: 'Маркетинг' },
];

// Helper to localize constant labels using translation function
export function cl(prefix: string, value: string, t: (key: string) => string): string {
  return t(`const.${prefix}.${value}`) || value;
}
