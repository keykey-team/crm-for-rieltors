import { createAsyncRouter } from '../../../common/infrastructure/http/async-handler';
import {
  addLeadCommunication,
  deleteChatRoom,
  getChat,
  listLeadCommunications,
  sendDirectMessage,
  updateChatRoom,
} from '../services/communication.service';

const router = createAsyncRouter();

router.get('/communications', async (req, res) => {
  res.json(await listLeadCommunications(req.query.leadId));
});

router.post('/communications', async (req, res) => {
  res.status(201).json(await addLeadCommunication(req.user?.id, req.body ?? {}));
});

router.get('/chat', async (req, res) => {
  const other = typeof req.query.userId === 'string' ? req.query.userId : '';
  res.json(await getChat(req.user?.id, other));
});

router.post('/chat', async (req, res) => {
  res.status(201).json(await sendDirectMessage(req.user?.id, req.body ?? {}));
});

router.put('/chat/rooms', async (req, res) => {
  res.json(await updateChatRoom(req.user!.id, req.body ?? {}));
});

router.delete('/chat/rooms', async (req, res) => {
  res.json(await deleteChatRoom(req.user!.id, req.query.roomId));
});

export const communicationRoutes = router;

