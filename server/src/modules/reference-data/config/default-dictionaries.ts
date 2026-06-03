export type DictionarySeedCategory =
  | 'source'
  | 'lead_source'
  | 'district'
  | 'property_type'
  | 'property_status'
  | 'property_deal_type'
  | 'operation_type'
  | 'deal_status'
  | 'showing_status'
  | 'rejection_reason'
  | 'document_type'
  | 'repair_type'
  | 'layout_type'
  | 'real_estate_class'
  | 'wall_type'
  | 'heating_type'
  | 'currency'
  | 'object_source'
  | 'payment_condition'
  | 'commission_type'
  | 'commercial_purpose'
  | 'parking_type'
  | 'communication_type'
  | 'media_type'
  | 'publication_channel'
  | 'publication_status'
  | 'need_type'
  | 'tag'
  | 'other';

export type DictionarySeedItem = {
  value: string;
  label: string;
  order?: number;
};

type DictionarySeedMap = Record<DictionarySeedCategory, DictionarySeedItem[]>;

export const DEFAULT_DICTIONARIES: DictionarySeedMap = {
  source: [
    { value: 'manual', label: 'Вручную', order: 0 },
    { value: 'website', label: 'Сайт', order: 1 },
    { value: 'referral', label: 'Рекомендация', order: 2 },
    { value: 'other', label: 'Другое', order: 3 },
  ],
  lead_source: [
    { value: 'manual', label: 'Вручную', order: 0 },
    { value: 'telegram', label: 'Telegram', order: 1 },
    { value: 'instagram', label: 'Instagram', order: 2 },
    { value: 'olx', label: 'OLX', order: 3 },
    { value: 'dom_ria', label: 'DOM.RIA', order: 4 },
    { value: 'website', label: 'Сайт', order: 5 },
    { value: 'referral', label: 'Рекомендация', order: 6 },
    { value: 'other', label: 'Другое', order: 7 },
  ],
  district: [
    { value: 'center', label: 'Центр', order: 0 },
    { value: 'left_bank', label: 'Левый берег', order: 1 },
    { value: 'right_bank', label: 'Правый берег', order: 2 },
    { value: 'suburbs', label: 'Пригород', order: 3 },
  ],
  property_type: [
    { value: 'apartment', label: 'Квартира', order: 0 },
    { value: 'apartments', label: 'Апартаменты', order: 1 },
    { value: 'house', label: 'Дом', order: 2 },
    { value: 'townhouse', label: 'Таунхаус', order: 3 },
    { value: 'duplex', label: 'Дуплекс', order: 4 },
    { value: 'commercial', label: 'Коммерческое помещение', order: 5 },
    { value: 'office', label: 'Офис', order: 6 },
    { value: 'warehouse', label: 'Склад', order: 7 },
    { value: 'parking', label: 'Паркоместо', order: 8 },
    { value: 'storage', label: 'Кладовая', order: 9 },
    { value: 'land', label: 'Земельный участок', order: 10 },
    { value: 'new_build_unit', label: 'Новостройка / юнит', order: 11 },
  ],
  property_status: [
    { value: 'active', label: 'Активный', order: 0 },
    { value: 'reserved', label: 'Зарезервирован', order: 1 },
    { value: 'sold', label: 'Продан', order: 2 },
    { value: 'inactive', label: 'Неактивный', order: 3 },
    { value: 'archived', label: 'Архив', order: 4 },
  ],
  property_deal_type: [
    { value: 'sale', label: 'Продажа', order: 0 },
    { value: 'rent', label: 'Аренда', order: 1 },
  ],
  operation_type: [
    { value: 'sale', label: 'Продажа', order: 0 },
    { value: 'rent', label: 'Аренда', order: 1 },
    { value: 'exchange', label: 'Обмен', order: 2 },
  ],
  deal_status: [
    { value: 'new_lead', label: 'Новый лид', order: 0 },
    { value: 'contacted', label: 'Контакт установлен', order: 1 },
    { value: 'meeting_scheduled', label: 'Встреча назначена', order: 2 },
    { value: 'meeting_done', label: 'Встреча проведена', order: 3 },
    { value: 'showing', label: 'Показ', order: 4 },
    { value: 'negotiation', label: 'Переговоры', order: 5 },
    { value: 'deposit', label: 'Задаток', order: 6 },
    { value: 'documents', label: 'Документы', order: 7 },
    { value: 'closed', label: 'Закрыта', order: 8 },
    { value: 'cancelled', label: 'Отменена', order: 9 },
    { value: 'rejected', label: 'Отказ', order: 10 },
  ],
  showing_status: [
    { value: 'scheduled', label: 'Запланирован', order: 0 },
    { value: 'completed', label: 'Проведен', order: 1 },
    { value: 'cancelled', label: 'Отменен', order: 2 },
    { value: 'no_show', label: 'Клиент не пришел', order: 3 },
  ],
  rejection_reason: [
    { value: 'price_high', label: 'Высокая цена', order: 0 },
    { value: 'location', label: 'Не подходит локация', order: 1 },
    { value: 'condition', label: 'Состояние объекта', order: 2 },
    { value: 'documents', label: 'Проблемы с документами', order: 3 },
    { value: 'financing', label: 'Нет финансирования', order: 4 },
    { value: 'other', label: 'Другая причина', order: 5 },
  ],
  document_type: [
    { value: 'ownership', label: 'Право собственности', order: 0 },
    { value: 'owner_contract', label: 'Договор с собственником', order: 1 },
    { value: 'tech_passport', label: 'Техпаспорт', order: 2 },
    { value: 'extract', label: 'Выписка', order: 3 },
    { value: 'cadastre', label: 'Кадастровый документ', order: 4 },
    { value: 'reservation_contract', label: 'Договор бронирования', order: 5 },
    { value: 'sale_contract', label: 'Договор купли-продажи', order: 6 },
    { value: 'acceptance_act', label: 'Акт приема-передачи', order: 7 },
    { value: 'property_passport', label: 'Паспорт объекта', order: 8 },
    { value: 'price_list', label: 'Прайс-лист', order: 9 },
    { value: 'layout', label: 'Планировка', order: 10 },
    { value: 'presentation', label: 'Презентация', order: 11 },
  ],
  repair_type: [
    { value: 'without_repair', label: 'Без ремонта', order: 0 },
    { value: 'cosmetic', label: 'Косметический', order: 1 },
    { value: 'euro', label: 'Евроремонт', order: 2 },
    { value: 'designer', label: 'Дизайнерский', order: 3 },
  ],
  layout_type: [
    { value: 'studio', label: 'Студия', order: 0 },
    { value: 'free', label: 'Свободная', order: 1 },
    { value: 'separate', label: 'Раздельная', order: 2 },
    { value: 'adjacent', label: 'Смежная', order: 3 },
  ],
  real_estate_class: [
    { value: 'economy', label: 'Эконом', order: 0 },
    { value: 'comfort', label: 'Комфорт', order: 1 },
    { value: 'business', label: 'Бизнес', order: 2 },
    { value: 'premium', label: 'Премиум', order: 3 },
  ],
  wall_type: [
    { value: 'brick', label: 'Кирпич', order: 0 },
    { value: 'monolith', label: 'Монолит', order: 1 },
    { value: 'panel', label: 'Панель', order: 2 },
    { value: 'gas_block', label: 'Газоблок', order: 3 },
    { value: 'wood', label: 'Дерево', order: 4 },
  ],
  heating_type: [
    { value: 'central', label: 'Центральное', order: 0 },
    { value: 'individual_gas', label: 'Индивидуальное газовое', order: 1 },
    { value: 'individual_electric', label: 'Индивидуальное электрическое', order: 2 },
    { value: 'solid_fuel', label: 'Твердотопливное', order: 3 },
    { value: 'none', label: 'Нет', order: 4 },
  ],
  currency: [
    { value: 'USD', label: 'USD', order: 0 },
    { value: 'EUR', label: 'EUR', order: 1 },
    { value: 'UAH', label: 'UAH', order: 2 },
  ],
  object_source: [
    { value: 'owner', label: 'Собственник', order: 0 },
    { value: 'developer', label: 'Застройщик', order: 1 },
    { value: 'agency_partner', label: 'Партнерское агентство', order: 2 },
    { value: 'portal', label: 'Портал', order: 3 },
    { value: 'other', label: 'Другое', order: 4 },
  ],
  payment_condition: [
    { value: 'full', label: 'Полная оплата', order: 0 },
    { value: 'installment', label: 'Рассрочка', order: 1 },
    { value: 'mortgage', label: 'Ипотека', order: 2 },
    { value: 'other', label: 'Другое', order: 3 },
  ],
  commission_type: [
    { value: 'fixed', label: 'Фиксированная', order: 0 },
    { value: 'percent', label: 'Процент', order: 1 },
    { value: 'mixed', label: 'Смешанная', order: 2 },
  ],
  commercial_purpose: [
    { value: 'retail', label: 'Ритейл', order: 0 },
    { value: 'office', label: 'Офис', order: 1 },
    { value: 'warehouse', label: 'Склад', order: 2 },
    { value: 'production', label: 'Производство', order: 3 },
    { value: 'service', label: 'Сервис', order: 4 },
  ],
  parking_type: [
    { value: 'underground', label: 'Подземная', order: 0 },
    { value: 'ground', label: 'Наземная', order: 1 },
    { value: 'garage', label: 'Гараж', order: 2 },
    { value: 'open', label: 'Открытая', order: 3 },
  ],
  communication_type: [
    { value: 'electricity', label: 'Электричество', order: 0 },
    { value: 'gas', label: 'Газ', order: 1 },
    { value: 'water', label: 'Вода', order: 2 },
    { value: 'sewerage', label: 'Канализация', order: 3 },
    { value: 'internet', label: 'Интернет', order: 4 },
  ],
  media_type: [
    { value: 'photo', label: 'Фото', order: 0 },
    { value: 'video', label: 'Видео', order: 1 },
    { value: 'layout', label: 'Планировка', order: 2 },
    { value: 'tour_3d', label: '3D-тур', order: 3 },
    { value: 'presentation', label: 'PDF-презентация', order: 4 },
    { value: 'genplan', label: 'Генплан', order: 5 },
    { value: 'floor_plan', label: 'План этажа', order: 6 },
    { value: 'render', label: 'Рендер', order: 7 },
    { value: 'file', label: 'Файл', order: 8 },
  ],
  publication_channel: [
    { value: 'website', label: 'Сайт агентства', order: 0 },
    { value: 'instagram', label: 'Instagram', order: 1 },
    { value: 'facebook', label: 'Facebook', order: 2 },
    { value: 'telegram', label: 'Telegram', order: 3 },
    { value: 'olx', label: 'OLX', order: 4 },
    { value: 'dom_ria', label: 'DOM.RIA', order: 5 },
    { value: 'lun', label: 'LUN', order: 6 },
  ],
  publication_status: [
    { value: 'draft', label: 'Черновик', order: 0 },
    { value: 'pending', label: 'Ожидает публикации', order: 1 },
    { value: 'published', label: 'Опубликовано', order: 2 },
    { value: 'paused', label: 'Приостановлено', order: 3 },
    { value: 'error', label: 'Ошибка публикации', order: 4 },
    { value: 'archived', label: 'Архив', order: 5 },
  ],
  need_type: [
    { value: 'buy', label: 'Покупка', order: 0 },
    { value: 'rent', label: 'Аренда', order: 1 },
    { value: 'invest', label: 'Инвестиция', order: 2 },
  ],
  tag: [
    { value: 'hot', label: 'Горячий', order: 0 },
    { value: 'new', label: 'Новый', order: 1 },
    { value: 'exclusive', label: 'Эксклюзив', order: 2 },
  ],
  other: [],
};
