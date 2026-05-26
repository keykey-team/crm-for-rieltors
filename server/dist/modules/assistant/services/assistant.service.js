"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHelperSummary = getHelperSummary;
exports.receiveHelperMessage = receiveHelperMessage;
exports.receiveAssistantMessage = receiveAssistantMessage;
const errors_1 = require("../../../common/shared-kernel/errors");
const helper_message_repository_1 = require("../repositories/helper-message.repository");
const MONTHLY_LIMIT = 200;
const HELPER_REPLY = 'Отримав запит. Базовий режим хелпера активний після міграції.';
const ASSISTANT_REPLY = 'Асистент у безпечному режимі після міграції. Інтелектуальний запит підключимо наступним кроком.';
function normalizeMessage(message) {
    const normalized = String(message || '').trim();
    if (!normalized)
        throw (0, errors_1.badRequest)('Message required');
    return normalized;
}
function monthStart() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
}
async function getHelperSummary(userId) {
    const [used, history] = await Promise.all([
        (0, helper_message_repository_1.countMonthlyUserMessages)(userId, monthStart()),
        (0, helper_message_repository_1.findHelperHistory)(userId),
    ]);
    return {
        used,
        limit: MONTHLY_LIMIT,
        plan: 'free',
        remaining: Math.max(0, MONTHLY_LIMIT - used),
        history: history.reverse(),
    };
}
async function receiveHelperMessage(userId, message) {
    await (0, helper_message_repository_1.createHelperMessage)(userId, 'user', normalizeMessage(message));
    await (0, helper_message_repository_1.createHelperMessage)(userId, 'assistant', HELPER_REPLY);
    return { content: HELPER_REPLY, done: true, used: 1, limit: MONTHLY_LIMIT };
}
async function receiveAssistantMessage(userId, message) {
    await (0, helper_message_repository_1.createHelperMessage)(userId, 'user', `[assistant] ${normalizeMessage(message)}`);
    await (0, helper_message_repository_1.createHelperMessage)(userId, 'assistant', `[assistant] ${ASSISTANT_REPLY}`);
    return { content: ASSISTANT_REPLY, done: true, used: 1, limit: MONTHLY_LIMIT };
}
