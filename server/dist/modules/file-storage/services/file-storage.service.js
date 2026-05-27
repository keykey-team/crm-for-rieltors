"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPresignedUpload = createPresignedUpload;
exports.resolveFileUrl = resolveFileUrl;
const s3_1 = require("../../../common/infrastructure/storage/s3");
const errors_1 = require("../../../common/shared-kernel/errors");
function requiredString(value, field) {
    const result = String(value ?? '').trim();
    if (!result)
        throw (0, errors_1.badRequest)(`${field} required`);
    return result;
}
async function createPresignedUpload(input) {
    return (0, s3_1.generatePresignedUploadUrl)(requiredString(input.fileName, 'fileName'), requiredString(input.contentType, 'contentType'), Boolean(input.isPublic ?? true));
}
async function resolveFileUrl(pathInput) {
    const path = requiredString(pathInput, 'path');
    return (0, s3_1.getFileUrl)(path, path.includes('/public/'));
}
