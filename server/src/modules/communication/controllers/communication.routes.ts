import { createAsyncRouter } from '../../../common/infrastructure/http/async-handler';
import {
  createChatRoom,
  addLeadCommunication,
  deleteChatRoom,
  getChat,
  listChatUsers,
  listLeadCommunications,
  sendChatMessage,
  updateChatRoom,
} from '../services/communication.service';
import { validateBody } from '../../../common/validation/middleware';
import { createCommunicationSchema } from '../../lead-management/controllers/lead.schemas';
import { createChatRoomSchema, sendDirectMessageSchema, updateChatRoomSchema } from './communication.schemas';

const router = createAsyncRouter();

router.get('/communications', async (req, res) => {
  res.json(await listLeadCommunications(req.query.leadId));
});

router.post('/communications', validateBody(createCommunicationSchema), async (req, res) => {
  res.status(201).json(await addLeadCommunication(req.user?.id, req.body));
});

router.get('/chat', async (req, res) => {
  res.json(await getChat(req.user?.id, req.query as Record<string, unknown>));
});

router.get('/chat/users', async (req, res) => {
  res.json(await listChatUsers(req.user?.id, req.agency?.agencyId));
});

router.post('/chat', validateBody(sendDirectMessageSchema), async (req, res) => {
  res.status(201).json(await sendChatMessage(req.user?.id, req.body));
});

router.post('/chat/rooms', validateBody(createChatRoomSchema), async (req, res) => {
  res.status(201).json(await createChatRoom(req.user?.id, req.user?.role, req.agency?.agencyId, req.body));
});

router.put('/chat/rooms', validateBody(updateChatRoomSchema), async (req, res) => {
  res.json(await updateChatRoom(req.user!.id, req.body));
});

router.delete('/chat/rooms', async (req, res) => {
  res.json(await deleteChatRoom(req.user!.id, req.query.roomId));
});

export const communicationRoutes = router;

