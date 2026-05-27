"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateChatRoomSchema = exports.sendDirectMessageSchema = void 0;
const zod_1 = require("zod");
const common_1 = require("../../../common/validation/common");
// ── Chat direct message ───────────────────────────────────────────────────────
exports.sendDirectMessageSchema = zod_1.z
    .object({
    toUserId: common_1.cuid,
    text: zod_1.z
        .string()
        .trim()
        .min(1, 'Required')
        .max(4000, 'Max 4000 chars')
        .transform((v) => v.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')),
})
    .strict();
// ── Chat room ─────────────────────────────────────────────────────────────────
exports.updateChatRoomSchema = zod_1.z
    .object({
    roomId: common_1.cuid,
    name: (0, common_1.shortText)(120).optional(),
    addMemberIds: zod_1.z.array(common_1.cuid).max(100).optional(),
    removeMemberIds: zod_1.z.array(common_1.cuid).max(100).optional(),
})
    .strict();
