"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.communicationRoutes = void 0;
const async_handler_1 = require("../../../common/infrastructure/http/async-handler");
const communication_service_1 = require("../services/communication.service");
const middleware_1 = require("../../../common/validation/middleware");
const lead_schemas_1 = require("../../lead-management/controllers/lead.schemas");
const communication_schemas_1 = require("./communication.schemas");
const router = (0, async_handler_1.createAsyncRouter)();
router.get('/communications', async (req, res) => {
    res.json(await (0, communication_service_1.listLeadCommunications)(req.query.leadId));
});
router.post('/communications', (0, middleware_1.validateBody)(lead_schemas_1.createCommunicationSchema), async (req, res) => {
    res.status(201).json(await (0, communication_service_1.addLeadCommunication)(req.user?.id, req.body));
});
router.get('/chat', async (req, res) => {
    const other = typeof req.query.userId === 'string' ? req.query.userId : '';
    res.json(await (0, communication_service_1.getChat)(req.user?.id, other));
});
router.post('/chat', (0, middleware_1.validateBody)(communication_schemas_1.sendDirectMessageSchema), async (req, res) => {
    res.status(201).json(await (0, communication_service_1.sendDirectMessage)(req.user?.id, req.body));
});
router.put('/chat/rooms', (0, middleware_1.validateBody)(communication_schemas_1.updateChatRoomSchema), async (req, res) => {
    res.json(await (0, communication_service_1.updateChatRoom)(req.user.id, req.body));
});
router.delete('/chat/rooms', async (req, res) => {
    res.json(await (0, communication_service_1.deleteChatRoom)(req.user.id, req.query.roomId));
});
exports.communicationRoutes = router;
