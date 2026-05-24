import { createAsyncRouter } from '../../../common/infrastructure/http/async-handler';
import { addTask, changeTask, listTasks, removeTask } from '../services/task.service';

const router = createAsyncRouter();

router.get('/tasks', async (req, res) => {
  res.json(
    await listTasks({
      status: typeof req.query.status === 'string' ? req.query.status : '',
      type: typeof req.query.type === 'string' ? req.query.type : '',
      priority: typeof req.query.priority === 'string' ? req.query.priority : '',
      userId: req.user?.id,
      role: req.user?.role,
    }),
  );
});

router.post('/tasks', async (req, res) => {
  res.status(201).json(await addTask(req.user!.id, req.body ?? {}));
});

router.put('/tasks/:id', async (req, res) => {
  res.json(await changeTask(req.params.id, req.body ?? {}));
});

router.delete('/tasks/:id', async (req, res) => {
  res.json(await removeTask(req.params.id));
});

export const taskRoutes = router;
