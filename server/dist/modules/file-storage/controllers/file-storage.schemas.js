"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.presignedUploadSchema = void 0;
const zod_1 = require("zod");
const ALLOWED_MIME = [
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
exports.presignedUploadSchema = zod_1.z
    .object({
    fileName: zod_1.z
        .string()
        .trim()
        .min(1, 'Required')
        .max(255, 'Max 255 chars')
        .regex(/^[\w\-. ]+$/, 'Invalid file name'),
    contentType: zod_1.z.enum(ALLOWED_MIME, 'File type not allowed'),
    size: zod_1.z.number().int().min(1).max(MAX_FILE_SIZE, 'File too large (max 10 MB)'),
    isPublic: zod_1.z.boolean().optional(),
})
    .strict();
