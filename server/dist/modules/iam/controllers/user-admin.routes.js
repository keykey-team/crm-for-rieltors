"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userManagementRoutes = void 0;
const async_handler_1 = require("../../../common/infrastructure/http/async-handler");
const user_admin_service_1 = require("../services/user-admin.service");
const router = (0, async_handler_1.createAsyncRouter)();
router.get('/users', async (_req, res) => {
    res.json(await (0, user_admin_service_1.listUsers)());
});
router.post('/users', async (req, res) => {
    res.status(201).json(await (0, user_admin_service_1.addUser)(req.body ?? {}, req.user?.role));
});
router.put('/users/:id', async (req, res) => {
    res.json(await (0, user_admin_service_1.changeUser)(req.params.id, req.body ?? {}, req.user?.role));
});
router.delete('/users/:id', async (req, res) => {
    res.json(await (0, user_admin_service_1.removeUser)(req.params.id, req.user?.role));
});
exports.userManagementRoutes = router;
