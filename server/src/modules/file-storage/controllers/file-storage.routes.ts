import { createAsyncRouter } from '../../../common/infrastructure/http/async-handler';
import { createPresignedUpload, resolveFileUrl } from '../services/file-storage.service';

const router = createAsyncRouter();

router.get('/files', async (req, res) => {
  res.redirect(await resolveFileUrl(req.query.path));
});

router.post('/upload/presigned', async (req, res) => {
  res.json(await createPresignedUpload(req.body ?? {}));
});

export const fileStorageRoutes = router;
