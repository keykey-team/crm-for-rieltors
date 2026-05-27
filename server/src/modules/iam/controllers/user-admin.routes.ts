import { createAsyncRouter } from '../../../common/infrastructure/http/async-handler';
import { addUser, changeUser, listUsers, removeUser } from '../services/user-admin.service';
import { validateBody } from '../../../common/validation/middleware';
import { createUserSchema, updateUserSchema } from './user-admin.schemas';

const router = createAsyncRouter();

router.get('/users', async (_req, res) => {
  res.json(await listUsers());
});

router.post('/users', validateBody(createUserSchema), async (req, res) => {
  res.status(201).json(await addUser(req.body, req.user?.role));
});

router.put('/users/:id', validateBody(updateUserSchema), async (req, res) => {
  res.json(await changeUser(req.params.id, req.body, req.user?.role));
});

router.delete('/users/:id', async (req, res) => {
  res.json(await removeUser(req.params.id, req.user?.role));
});

export const userManagementRoutes = router;
