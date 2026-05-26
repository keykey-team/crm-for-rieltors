"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileStorageFacade = exports.fileStorageRoutes = void 0;
var file_storage_routes_1 = require("./controllers/file-storage.routes");
Object.defineProperty(exports, "fileStorageRoutes", { enumerable: true, get: function () { return file_storage_routes_1.fileStorageRoutes; } });
var file_storage_facade_1 = require("./adapters/file-storage.facade");
Object.defineProperty(exports, "fileStorageFacade", { enumerable: true, get: function () { return file_storage_facade_1.fileStorageFacade; } });
