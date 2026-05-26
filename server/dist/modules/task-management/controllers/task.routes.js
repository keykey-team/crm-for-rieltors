"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskRoutes = void 0;
const async_handler_1 = require("../../../common/infrastructure/http/async-handler");
const task_service_1 = require("../services/task.service");
const router = (0, async_handler_1.createAsyncRouter)();
router.get('/tasks', async (req, res) => {
    res.json(await (0, task_service_1.listTasks)({
        status: typeof req.query.status === 'string' ? req.query.status : '',
        type: typeof req.query.type === 'string' ? req.query.type : '',
        priority: typeof req.query.priority === 'string' ? req.query.priority : '',
        userId: req.user?.id,
        role: req.user?.role,
    }));
});
router.post('/tasks', async (req, res) => {
    res.status(201).json(await (0, task_service_1.addTask)(req.user.id, req.body ?? {}));
});
router.put('/tasks/:id', async (req, res) => {
    res.json(await (0, task_service_1.changeTask)(req.params.id, req.body ?? {}));
});
router.delete('/tasks/:id', async (req, res) => {
    res.json(await (0, task_service_1.removeTask)(req.params.id));
});
exports.taskRoutes = router;
