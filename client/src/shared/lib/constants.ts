export const DEAL_STAGES = [
  { value: 'new_lead', label: 'Новий лід', color: '#60B5FF' },
  { value: 'contacted', label: 'Контакт встановлено', color: '#80D8C3' },
  { value: 'meeting_scheduled', label: 'Зустріч призначено', color: '#A19AD3' },
  { value: 'meeting_done', label: 'Зустріч проведено', color: '#72BF78' },
  { value: 'showing', label: 'Покази', color: '#FF9149' },
  { value: 'negotiation', label: 'Переговори', color: '#FF90BB' },
  { value: 'deposit', label: 'Завдаток', color: '#FF9898' },
  { value: 'documents', label: 'Документи', color: '#FFD166' },
  { value: 'closed', label: 'Угода завершена', color: '#06D6A0' },
  { value: 'aftercare', label: 'Aftercare', color: '#118AB2' },
  { value: 'rejected', label: 'Відмова', color: '#EF476F' },
];

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
  { value: 'new', label: 'Новий', color: '#60B5FF' },
  { value: 'active', label: 'Активний', color: '#72BF78' },
  { value: 'warm', label: 'Теплий', color: '#FF9149' },
  { value: 'cold', label: 'Холодний', color: '#A19AD3' },
  { value: 'lost', label: 'Втрачений', color: '#EF476F' },
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
