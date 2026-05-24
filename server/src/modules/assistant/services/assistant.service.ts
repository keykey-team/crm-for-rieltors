import { badRequest } from '../../../common/shared-kernel/errors';
import { countMonthlyUserMessages, createHelperMessage, findHelperHistory } from '../repositories/helper-message.repository';

const MONTHLY_LIMIT = 200;
const HELPER_REPLY = 'Отримав запит. Базовий режим хелпера активний після міграції.';
const ASSISTANT_REPLY =
  'Асистент у безпечному режимі після міграції. Інтелектуальний запит підключимо наступним кроком.';

function normalizeMessage(message: unknown) {
  const normalized = String(message || '').trim();
  if (!normalized) throw badRequest('Message required');
  return normalized;
}

function monthStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export async function getHelperSummary(userId: string) {
  const [used, history] = await Promise.all([
    countMonthlyUserMessages(userId, monthStart()),
    findHelperHistory(userId),
  ]);
  return {
    used,
    limit: MONTHLY_LIMIT,
    plan: 'free',
    remaining: Math.max(0, MONTHLY_LIMIT - used),
    history: history.reverse(),
  };
}

export async function receiveHelperMessage(userId: string, message: unknown) {
  await createHelperMessage(userId, 'user', normalizeMessage(message));
  await createHelperMessage(userId, 'assistant', HELPER_REPLY);
  return { content: HELPER_REPLY, done: true, used: 1, limit: MONTHLY_LIMIT };
}

export async function receiveAssistantMessage(userId: string, message: unknown) {
  await createHelperMessage(userId, 'user', `[assistant] ${normalizeMessage(message)}`);
  await createHelperMessage(userId, 'assistant', `[assistant] ${ASSISTANT_REPLY}`);
  return { content: ASSISTANT_REPLY, done: true, used: 1, limit: MONTHLY_LIMIT };
}
