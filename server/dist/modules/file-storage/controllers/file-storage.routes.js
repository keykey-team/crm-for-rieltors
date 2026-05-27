"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileStorageRoutes = void 0;
const async_handler_1 = require("../../../common/infrastructure/http/async-handler");
const file_storage_service_1 = require("../services/file-storage.service");
const router = (0, async_handler_1.createAsyncRouter)();
router.get('/files', async (req, res) => {
    res.redirect(await (0, file_storage_service_1.resolveFileUrl)(req.query.path));
});
router.post('/upload/presigned', async (req, res) => {
    res.json(await (0, file_storage_service_1.createPresignedUpload)(req.body ?? {}));
});
exports.fileStorageRoutes = router;
