"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileStorageFacade = void 0;
const file_storage_service_1 = require("../services/file-storage.service");
exports.fileStorageFacade = {
    createPresignedUpload: file_storage_service_1.createPresignedUpload,
    resolveFileUrl: file_storage_service_1.resolveFileUrl,
};
