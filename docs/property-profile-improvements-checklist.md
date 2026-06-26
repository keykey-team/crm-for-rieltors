# Чеклист доработок профиля объекта

Дата: 2026-06-03
Статус: завершено

## Backend и API
- [x] Добавлен endpoint GET /properties/:id/profile
- [x] Реализован агрегированный payload профиля в service/repository модуля объекта (статистика цены, сделки, показы, активность, метрики)
- [x] Схема объекта расширена optional-полями под бизнес-характеристики и описания: internalCode, source, owner/developer contacts, layoutType, repairType, heatingType, wallType, realEstateClass, commercialPurpose, parkingType, managerComment, internalDescription, publicDescription
- [x] В схему добавлен relation `PropertyDocument` для документов объекта
- [x] В схему добавлен relation `PropertyMediaLink` для внешних медиа-материалов объекта
- [x] В схему добавлен relation `PropertyPublication` для публикаций объекта по каналам
- [x] В публикации по каналам добавлены служебные даты `publishedAt` и `lastSyncedAt`
- [x] Prisma schema обновлена и Prisma Client пересобран под новые поля
- [x] Создана Prisma migration `20260603094732_add_property_profile_publications` для накопленных изменений карточки объекта
- [x] Валидация property API обновлена: валюта переведена с жесткого enum на dictionary-backed значение
- [x] Валидация property API расширена под документы объекта, publication-поля и новые type-specific характеристики

## Клиентские контракты и загрузка данных
- [x] Добавлены DTO-типы профиля в модель сущности объекта
- [x] Добавлен клиентский API-метод getPropertyProfile(id)
- [x] Подключена загрузка профиля в quick preview объектов
- [x] Добавлен отдельный route/page для профиля объекта

## UX-доработки (preview + profile)
- [x] Расширены вкладки preview: детали, история цены, связи, активность
- [x] Добавлена группировка активности (сегодня/вчера/по датам)
- [x] Добавлены KPI-карточки (сделки/показы/метрики цены)
- [x] Добавлена навигация из preview в полную страницу профиля
- [x] В профиль объекта добавлен блок характеристик по новым полям объекта
- [x] В профиль объекта добавлены публичное и внутреннее описания, а также комментарий менеджера
- [x] В профиль объекта добавлены owner/developer контакты
- [x] В профиль объекта добавлен блок документов объекта со ссылками на открытие файлов
- [x] В профиль объекта добавлены publication badges, теги, коммуникации и блок медиа-материалов
- [x] В профиль объекта добавлен блок каналов размещения со статусами и ссылками
- [x] В профиль и quick preview объекта добавены даты публикации и последней синхронизации по каналам
- [x] В списке объектов и quick preview добавлен компактный summary по каналам публикации
- [x] В список объектов добавлен фильтр по каналу публикации с протяжкой в backend query
- [x] В список объектов добавлен фильтр по статусу публикации с протяжкой в backend query
- [x] Для фильтров списка объектов добавлены активные chips и быстрый сброс
- [x] Empty state списка объектов учитывает активные фильтры и предлагает очистить их
- [x] Фильтры и режим отображения списка объектов синхронизированы с URL страницы
- [x] Create-диалог и quick preview объектов синхронизированы с URL страницы
- [x] Edit-диалог объекта синхронизирован с URL страницы
- [x] Добавлена приоритизация рисков (high/medium) в полном профиле
- [x] Добавлены CTA-ссылки по рискам
- [x] Добавлена фильтрация сделок по стадии на странице профиля
- [x] Добавлена фильтрация показов по статусу на странице профиля
- [x] Добавлены ссылки на связанные карточки сделок и список показов

## Доработки потока показов
- [x] Добавлена поддержка query-фильтра propertyId в экране показов
- [x] Добавлен input-фильтр propertyId в панели фильтров показов

## Стабильность и диагностика
- [x] Исправлена runtime-ошибка порядка React hooks в экране объектов (hook вынесен из условного рендера)
- [x] Исправлены strict-null ошибки типов для pathname/searchParams в затронутых widgets/hooks
- [x] Проверены измененные файлы через диагностику (ошибок на уровне файлов нет)
- [x] Выполнен client typecheck (tsc --noEmit)

## Локализация (i18n)
- [x] Добавлены недостающие ключи uk/en/ru для действий по рискам профиля
- [x] Добавлены недостающие ключи uk/en/ru для действий открытия сделок/показов
- [x] Добавлен недостающий ключ uk/en/ru для фильтра показов по объекту
- [x] Добавлен ключ uk/en/ru для подписи CTA-кнопки в блоке рисков
- [x] Добавлены uk/en/ru ключи для новых полей формы и профиля объекта
- [x] Убраны literal-подписи категорий справочников в настройках, заменены на i18n-ключи
- [x] Добавлены uk/en/ru ключи для publication/media блока и новых категорий справочников
- [x] Добавлены uk/en/ru ключи для каналов публикации и статусов размещения

## Доработки справочников и настроек
- [x] Расширены категории справочников на backend (property/showing/document/currency и др.)
- [x] Исправлена валидация `PUT /dictionaries` для двух режимов: update и reorder
- [x] Добавлена поддержка `includeInactive` в `GET /dictionaries`
- [x] Добавлен `usageCount` для элементов справочника (по ключевым категориям)
- [x] Добавлен bootstrap дефолтных значений справочников на backend для агентства
- [x] Расширен клиентский API справочников: includeInactive + updateDictionaryItem
- [x] В UI настроек добавлены: inline-редактирование, активация/деактивация, отображение usageCount

## Устранение хардкода статусов показов
- [x] Добавлен hook `useShowingStatusOptions` с загрузкой статусов из справочника `showing_status`
- [x] Экран показов переведен на справочник статусов (фильтр + отображение)
- [x] Диалог редактирования показа переведен на справочник статусов
- [x] Фильтр и отображение статусов в профиле объекта переведены на справочник

## Устранение хардкода в карточке объекта
- [x] usePropertyOptions расширен загрузкой валют из справочника `currency`
- [x] usePropertyOptions расширен загрузкой district/object_source/layout_type/repair_type/heating_type/wall_type
- [x] usePropertyOptions расширен загрузкой document_type/real_estate_class/commercial_purpose/parking_type
- [x] usePropertyOptions расширен загрузкой payment_condition/communication_type/media_type/tag
- [x] usePropertyOptions расширен загрузкой publication_channel/publication_status
- [x] Форма создания/редактирования объекта переведена на справочники валюты, района, источника объекта, планировки, ремонта, отопления и типа стен
- [x] В форму объекта добавлены owner/developer контакты и документы с загрузкой в private storage
- [x] В форму объекта добавлены type-specific характеристики: bedrooms, bathrooms, landArea, parkingSpaces, yearBuilt, ceilingHeight, realEstateClass, commercialPurpose, parkingType
- [x] В форму объекта добавлены publication flags, условия оплаты, теги, коммуникации и внешние media links
- [x] В форму объекта добавлен список публикаций по каналам с отдельными статусами, ссылками и заметками
- [x] В форму объекта добавлены даты публикации и последней синхронизации для каждого канала
- [x] Для редактирования старых значений добавлен fallback current value, если текущего значения уже нет в активных справочниках

## Activity flow объекта

- [x] В `createPropertyWithInitialPrice` добавлен лог `action: 'create'` (рядом с существующим `price_change`)
- [x] В `updatePropertyWithPriceHistory` добавлен безусловный лог `action: 'update'` при каждом изменении объекта — теперь правки документов, media links и публикаций отражаются в ленте активности
- [x] Клиентский `normalizeAction` в `PropertyProfilePage.tsx` уже обрабатывал `create` и `update` — отображение без изменений

## Клиентские точечные тесты (lib/normalize)

- [x] Функции `normalizeDateTime`, `normalizeDocuments`, `normalizeMediaLinks`, `normalizePublications` вынесены из `property.api.ts` в `entities/property/lib/normalize.ts` и экспортированы
- [x] Создан `entities/property/lib/normalize.test.ts` (17 тестов, node:test runner) — покрывает: round-trip ISO, datetime-local→ISO, whitespace/empty/invalid → undefined, фильтрация невалидных записей, сохранение полей
- [x] Все 17 тестов проходят; server `property-photos.test.ts` (5 тестов) также проходит

## Финальная проверка
- [x] Серверная сборка: `npm run build` (server) — успешно
- [x] Клиентский typecheck: `npm run typecheck` (client) — успешно (после рефактора lib/normalize)
- [x] Серверный typecheck: `tsc --noEmit` (server) — успешно после изменений репозитория
- [x] Точечный тест `property-photos.test.ts` расширен и проходит для нормализации документов и media links
- [x] Точечный тест `property-photos.test.ts` расширен и проходит для нормализации публикаций по каналам
- [x] Применение схемы к локальной Docker БД через `npm run db:push` выполнено успешно

## Консистентность UI по датам публикаций

- [x] `PropertyProfilePage.tsx` — отображает `publishedAt`/`lastSyncedAt` для каждой публикации
- [x] `properties-screen.tsx` (quick preview) — отображает `publishedAt`/`lastSyncedAt` для каждой публикации
- [x] `property-dialog.tsx` (форма) — datetime-local инпуты для `publishedAt`/`lastSyncedAt`, prefill из `formatDateTimeLocal()`

---

## Остаточные риски

| # | Риск | Уровень | Комментарий |
|---|------|---------|-------------|
| R1 | `deleteMany {}` при update публикаций/документов/media links — полная замена без diff | medium | При каждом сохранении все дочерние записи пересоздаются. Потеря `id` в рамках одной сессии не проблема, но это неоптимально при частых авто-сохранениях. |
| R2 | Pagination для `publications`/`documents`/`mediaLinks` ограничена `take: 10` в `propertyInclude` (список) и `take: 20` в `findPropertyProfile` | medium | Объект с >10 публикациями отдаст урезанный список в preview. Нет UI-пагинации. |
| R3 | `withResolvedPhotoUrls` делает N параллельных запросов к S3 для фотографий и документов | medium | При большом кол-ве фотографий/документов на LIST (200 объектов × 10) — потенциальный bottleneck. |
| R4 | Даты `publishedAt`/`lastSyncedAt` вводятся вручную пользователем; нет server-side авто-заполнения при смене статуса | low | Ожидаемо: синхронизация внешних платформ вне скоупа текущего спринта. |
| R5 | Нет e2e/integration тестов для create/update flow с публикациями | low | Покрыто точечными unit-тестами нормализации. Полный сценарий можно проверить только runtime smoke через UI. |
| R6 | `activityLog.createMany` в транзакции создания объекта — если Prisma не поддерживает `createMany` для данного провайдера в транзакции, упадёт с ошибкой | low | PostgreSQL поддерживает; проверено типами. |
