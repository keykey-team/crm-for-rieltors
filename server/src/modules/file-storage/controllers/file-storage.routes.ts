import { createAsyncRouter } from '../../../common/infrastructure/http/async-handler';
import { createPresignedUpload, resolveFileUrl } from '../services/file-storage.service';
import { validateBody } from '../../../common/validation/middleware';
import { presignedUploadSchema } from './file-storage.schemas';

const router = createAsyncRouter();

router.get('/files', async (req, res) => {
  res.redirect(await resolveFileUrl(req.query.path));
});

router.post('/upload/presigned', validateBody(presignedUploadSchema), async (req, res) => {
  res.json(await createPresignedUpload(req.body));
});

export const fileStorageRoutes = router;
