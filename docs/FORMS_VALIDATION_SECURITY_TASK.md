# Forms Validation & Security Task (Frontend + Backend)

## Goal
Create a single validation/sanitization layer for all create/update forms in CRM.

Important note about SQL injection:
- Backend uses Prisma (ORM), so classic SQL-injection risk is lower than with raw SQL.
- Main real risks here are: invalid input, mass assignment, broken business rules, stored XSS, and oversized payload abuse.
- Therefore protection must be implemented on server-side DTO validation first, then mirrored on client for UX.

---

## Current state (observed)
- Many routes pass req.body directly to services: examples in [server/src/modules/lead-management/controllers/lead.routes.ts](server/src/modules/lead-management/controllers/lead.routes.ts#L1), [server/src/modules/sales-pipeline/controllers/deal.routes.ts](server/src/modules/sales-pipeline/controllers/deal.routes.ts#L1), [server/src/modules/property-catalog/controllers/property.routes.ts](server/src/modules/property-catalog/controllers/property.routes.ts#L1), [server/src/modules/task-management/controllers/task.routes.ts](server/src/modules/task-management/controllers/task.routes.ts#L1).
- No centralized runtime input validation library found in server/src (no zod/joi/express-validator usage detected).
- Client forms mostly rely on required attributes and minimal checks.

---

## Inventory of forms and required processing

## 1) Auth forms

### 1.1 Signup
- UI: [client/src/features/create-account/ui/create-account-form.tsx](client/src/features/create-account/ui/create-account-form.tsx#L1)
- API call: [client/src/features/create-account/api/signup.api.ts](client/src/features/create-account/api/signup.api.ts#L1) -> POST /api/iam/signup
- Fields:
  - accountType
  - name
  - email
  - password
- Required processing:
  - accountType: allow-list [agent, agency]
  - name: trim, collapse spaces, min 2, max 100
  - email: trim+lowercase, RFC-like format, max 254
  - password: min 8 (recommended 10+), max 72 for bcrypt compatibility, complexity policy
  - reject unknown keys

### 1.2 Login
- UI: [client/src/features/sign-in/ui/sign-in-form.tsx](client/src/features/sign-in/ui/sign-in-form.tsx#L1)
- Fields:
  - email
  - password
- Required processing:
  - same email normalization
  - password length guard (1..128)
  - rate limit and brute-force protection (IP + email)

---

## 2) Lead forms

### 2.1 Create/Edit lead dialog
- UI: [client/src/features/create-lead/ui/lead-form-dialog.tsx](client/src/features/create-lead/ui/lead-form-dialog.tsx#L1)
- Model state: [client/src/features/create-lead/model/use-lead-form.ts](client/src/features/create-lead/model/use-lead-form.ts#L1)
- API: [client/src/entities/lead/api/lead.api.ts](client/src/entities/lead/api/lead.api.ts#L1) -> POST/PUT /api/leads
- Fields:
  - firstName, lastName, email, phone
  - source, status, needType, priority
  - budget
  - notes
  - districts, propertyType
  - assignedToId
- Required processing:
  - required: firstName, phone
  - names: max 100 each
  - phone: normalized format (E.164-like), max 20
  - enums: strict allow-list for source/status/needType/priority
  - budget: numeric >= 0, max sane upper bound
  - notes: trim, max 2000, sanitize output rendering
  - assignedToId: cuid/uuid format + existence check + access rights

### 2.2 Lead details communication form
- UI: [client/src/screens/lead-details/ui/lead-details-screen.tsx](client/src/screens/lead-details/ui/lead-details-screen.tsx#L1)
- API: [client/src/entities/communication/api/communication.api.ts](client/src/entities/communication/api/communication.api.ts#L1) -> POST /api/communications
- Fields:
  - type
  - direction
  - content
  - leadId
- Required processing:
  - type/direction allow-list
  - content min 1, max 4000
  - strip control chars except newlines
  - leadId exists + user has access to lead

---

## 3) Deal forms

### 3.1 Create/Edit deal dialog
- UI: [client/src/features/create-deal/ui/deal-form-dialog.tsx](client/src/features/create-deal/ui/deal-form-dialog.tsx#L1)
- Model state: [client/src/features/create-deal/model/use-deal-form.ts](client/src/features/create-deal/model/use-deal-form.ts#L1)
- API: [client/src/entities/deal/api/deal.api.ts](client/src/entities/deal/api/deal.api.ts#L1) -> POST/PUT /api/deals
- Fields:
  - title
  - stage
  - amount, commission, currency
  - notes
  - leadId, propertyId, assignedToId
- Required processing:
  - title required, min 2, max 150
  - stage/currency allow-list from settings/constants
  - amount >= 0, decimal precision limit (2)
  - commission 0..100 (or documented business range)
  - notes max 2000
  - all IDs format + existence + permission checks

### 3.2 Deal details inline forms (critical)
- UI: [client/src/screens/deal-details/ui/deal-details-screen.tsx](client/src/screens/deal-details/ui/deal-details-screen.tsx#L220)
- APIs: [client/src/entities/deal/api/deal-detail.api.ts](client/src/entities/deal/api/deal-detail.api.ts#L1), [client/src/entities/lead/api/lead.api.ts](client/src/entities/lead/api/lead.api.ts#L1), [client/src/entities/property/api/property.api.ts](client/src/entities/property/api/property.api.ts#L1)
- Sub-forms and fields:
  - Add comment: text
  - Add checklist item: title
  - Quick create lead: firstName, lastName, phone, email
  - Quick create property: title, address
  - Finance edit: amount, commission, currency
  - Custom field value: value (text/number/date/select/checkbox)
- Required processing:
  - comment/checklist text length limits (comment max 2000, checklist max 200)
  - mention handling: no trust in @username tokens, server resolves IDs only
  - quick-create forms use same DTO validators as main lead/property forms
  - finance numeric constraints same as deal dialog
  - custom fields: validate by field type (number/date/select/checkbox) and options allow-list for select

---

## 4) Property forms

### 4.1 Create/Edit property dialog
- UI: [client/src/widgets/properties/ui/property-dialog.tsx](client/src/widgets/properties/ui/property-dialog.tsx#L1)
- API: [client/src/entities/property/api/property.api.ts](client/src/entities/property/api/property.api.ts#L1) -> POST/PUT /api/properties
- Fields:
  - title, type, status
  - address, district, city
  - rooms, area, floor, totalFloors
  - price, currency
  - description
- Required processing:
  - required: title, address, price
  - enums for type/status/currency
  - rooms/floor/totalFloors integer >= 0
  - area/price decimal >= 0
  - cross-field: floor <= totalFloors when both provided
  - description max 3000

### 4.2 Property units (chess-grid related)
- API: [client/src/entities/property-unit/api/property-unit.api.ts](client/src/entities/property-unit/api/property-unit.api.ts#L1)
- Fields:
  - propertyId, unitNumber, floor, section, rooms, area, price, status
- Required processing:
  - required: propertyId, unitNumber, floor
  - uniqueness: propertyId + unitNumber
  - numeric bounds
  - status allow-list

---

## 5) Task forms

### 5.1 Create/Edit task dialog
- UI: [client/src/features/create-task/ui/task-dialog.tsx](client/src/features/create-task/ui/task-dialog.tsx#L1)
- API: [client/src/entities/task/api/task.api.ts](client/src/entities/task/api/task.api.ts#L1) -> POST/PUT /api/tasks
- Fields:
  - title, description
  - type, priority
  - dueDate
- Required processing:
  - title required, 2..150
  - description max 2000
  - type/priority allow-list
  - dueDate ISO validation and timezone normalization

---

## 6) Automation / templates / KB

### 6.1 Automation dialog
- UI: [client/src/screens/automations/ui/automations-screen.tsx](client/src/screens/automations/ui/automations-screen.tsx#L104)
- API: [client/src/entities/automation/api/automation.api.ts](client/src/entities/automation/api/automation.api.ts#L1)
- Fields:
  - name, description
  - trigger, triggerValue
  - action, actionValue
- Required processing:
  - enums/allow-lists for trigger and action
  - name required max 120
  - values max 255

### 6.2 Template dialog
- UI: [client/src/screens/templates/ui/templates-screen.tsx](client/src/screens/templates/ui/templates-screen.tsx#L105)
- API: [client/src/entities/template/api/template.api.ts](client/src/entities/template/api/template.api.ts#L1)
- Fields:
  - name, type, category, content
- Required processing:
  - name required max 120
  - type/category allow-list
  - content required max 10000
  - output encoding when rendering template content

### 6.3 Knowledge base dialog
- UI: [client/src/screens/knowledge-base/ui/knowledge-base-screen.tsx](client/src/screens/knowledge-base/ui/knowledge-base-screen.tsx#L126)
- API: [client/src/entities/knowledge-base/api/knowledge-base.api.ts](client/src/entities/knowledge-base/api/knowledge-base.api.ts#L1)
- Fields:
  - title, category, content
- Required processing:
  - title required max 160
  - category allow-list
  - content required max 30000
  - if markdown/html is ever supported, sanitize against XSS before render

---

## 7) Chat forms

### 7.1 Create group dialog
- UI: [client/src/screens/chat/ui/chat-screen.tsx](client/src/screens/chat/ui/chat-screen.tsx#L240)
- API: [client/src/entities/chat/api/chat.api.ts](client/src/entities/chat/api/chat.api.ts#L1)
- Fields:
  - name
  - memberIds[]
- Required processing:
  - name required for group type, max 120
  - memberIds array size limits (e.g., 1..100)
  - each id format + existence + permission checks

### 7.2 Group settings panel
- UI: [client/src/screens/chat/ui/chat-screen.tsx](client/src/screens/chat/ui/chat-screen.tsx#L313)
- Fields:
  - roomId
  - name
  - addMemberIds[] / removeMemberIds[]
- Required processing:
  - same ID and membership access checks
  - cannot remove last admin/owner without policy

---

## 8) Settings forms (high-impact)

### 8.1 Profile/credentials/telegram
- UI: [client/src/screens/settings/ui/settings-screen.tsx](client/src/screens/settings/ui/settings-screen.tsx#L420)
- API: [client/src/entities/settings/api/settings.api.ts](client/src/entities/settings/api/settings.api.ts#L19)
- Fields:
  - name, phone, newPassword, avatar, telegramUrl
- Required processing:
  - name/phone normalization and limits
  - newPassword policy + current-password verification for sensitive updates
  - avatar path validation (allow only trusted storage paths)
  - telegramUrl URL validation (protocol allow-list)

### 8.2 User management dialog
- UI: [client/src/screens/settings/ui/settings-screen.tsx](client/src/screens/settings/ui/settings-screen.tsx#L1250)
- API: /api/users, /api/users/:id
- Fields:
  - name, email, password, role, phone
- Required processing:
  - role allow-list and admin-only
  - email unique + normalized
  - password policy
  - prevent privilege escalation by non-admin

### 8.3 Permissions dialog
- UI: [client/src/screens/settings/ui/settings-screen.tsx](client/src/screens/settings/ui/settings-screen.tsx#L1134)
- Fields:
  - permissions (JSON array of sections)
- Required processing:
  - parse JSON safely
  - allow-list section keys only
  - max count and dedup

### 8.4 Funnel stages
- UI: [client/src/screens/settings/ui/settings-screen.tsx](client/src/screens/settings/ui/settings-screen.tsx#L520)
- Fields:
  - label, value, color, order
- Required processing:
  - value slug format
  - unique value
  - color strict hex format
  - protect immutable system stages

### 8.5 Deal custom fields
- UI: [client/src/screens/settings/ui/settings-screen.tsx](client/src/screens/settings/ui/settings-screen.tsx#L650)
- Fields:
  - name, label, fieldType, options
- Required processing:
  - fieldType allow-list
  - options parsing/limits
  - name uniqueness and slug format

### 8.6 Dictionaries
- UI: [client/src/screens/settings/ui/settings-screen.tsx](client/src/screens/settings/ui/settings-screen.tsx#L735)
- Fields:
  - category, label, value, order
- Required processing:
  - category allow-list
  - unique (category, value)
  - value slug format

### 8.7 Lead distribution rule dialog
- UI: [client/src/screens/settings/ui/settings-screen.tsx](client/src/screens/settings/ui/settings-screen.tsx#L1308)
- Fields:
  - name, source, district, propertyType, needType, assignToId, priority
- Required processing:
  - required: name, assignToId
  - allow-lists for propertyType/needType/source if dictionaries exist
  - priority integer range

### 8.8 Aftercare plan dialog
- UI: [client/src/screens/settings/ui/settings-screen.tsx](client/src/screens/settings/ui/settings-screen.tsx#L1361)
- Fields:
  - name, description
  - steps[]: dayOffset, type, title, content, order
- Required processing:
  - required: plan name, each step title
  - dayOffset >= 0 integer
  - type allow-list
  - max number of steps

### 8.9 Branding and file uploads
- UI: [client/src/screens/settings/ui/settings-screen.tsx](client/src/screens/settings/ui/settings-screen.tsx#L930)
- API: /api/settings/brand, /api/upload/presigned
- Fields:
  - brandName, brandLogo, themeMode, sidebarGlass, sidebarOpacity, gradientBg
  - upload fileName, contentType, isPublic
- Required processing:
  - themeMode allow-list [light, dark, system]
  - sidebarOpacity numeric range 0.3..1
  - file uploads: mime allow-list, extension allow-list, max size, signed URL expiration, path policy

---

## Cross-cutting required processing (all forms)

1. Server-side runtime schema validation for every POST/PUT/PATCH endpoint.
2. Strip unknown keys from payload (or fail with 400).
3. Trim all strings; convert empty strings to null where domain expects nullable.
4. Central limits:
- short text: 120
- title text: 160
- note/comment: 2000
- long content: 10000-30000 depending on domain
5. Enum validation by explicit allow-list only.
6. Numeric parsing with strict finite checks; reject NaN/Infinity/scientific overflow.
7. Date parsing: accept ISO only, normalize to UTC on backend.
8. ID format validation (cuid/uuid according to actual model) before DB call.
9. Authorization on relation fields (assignedToId, leadId, propertyId, memberIds etc.).
10. XSS-safe rendering for user text in UI (keep React escaping, never dangerouslySetInnerHTML without sanitizer).
11. Rate limiting for auth, chat send, helper/assistant, import/bulk endpoints.
12. Consistent error model (field-level errors + global message).

---

## Suggested implementation approach

1. Add shared validation layer in server:
- request DTO schemas per module (auth, lead, deal, property, task, settings, chat, kb, template, automation)
- middleware validateBody(schema)
2. Update controllers to validate req.body before service calls.
3. In services, enforce business rules and permission checks (not only type checks).
4. Mirror core rules in frontend for better UX.
5. Add tests:
- positive + negative payload tests per endpoint
- authorization checks
- boundary tests for lengths/ranges

---

## Acceptance criteria for this task

1. All create/update endpoints used by listed forms reject invalid payloads with 400 and field errors.
2. Unknown payload keys are rejected or removed by policy.
3. Enums, numbers, dates, and IDs are validated consistently.
4. No direct pass-through of raw req.body into service/repository writes.
5. Permission checks cover cross-entity references (assignments, chat membership, etc.).
6. Existing UI flows continue to work with valid data.
7. New tests cover at least one invalid case per field group and one authorization failure per domain.
