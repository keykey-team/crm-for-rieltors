"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateEventSchema = exports.createEventSchema = void 0;
const zod_1 = require("zod");
const common_1 = require("../../../common/validation/common");
const EVENT_TYPES = ['meeting', 'showing', 'call', 'other'];
const eventBase = {
    title: (0, common_1.shortText)(150),
    type: zod_1.z.enum(EVENT_TYPES).optional(),
    startDate: zod_1.z.string().trim().datetime({ offset: true, message: 'Invalid ISO date' }),
    endDate: common_1.isoDate,
    description: (0, common_1.noteText)(),
};
exports.createEventSchema = zod_1.z.object(eventBase).strict();
exports.updateEventSchema = zod_1.z.object(eventBase).partial().strict();
