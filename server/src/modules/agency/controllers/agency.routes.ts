import { createAsyncRouter } from '../../../common/infrastructure/http/async-handler';
import {
  createAgency,
  getAgencyMembers,
  inviteAgencyMember,
  listMyAgencies,
  patchAgency,
  patchAgencyMember,
  removeAgencyMember,
  switchAgency,
} from '../services/agency.service';

const router = createAsyncRouter();

router.get('/agencies/me', async (req, res) => {
  res.json(await listMyAgencies(req.user!.id));
});

router.post('/agencies', async (req, res) => {
  res.status(201).json(await createAgency(req.body ?? {}, req.user!.id));
});

router.patch('/agencies/:id', async (req, res) => {
  res.json(await patchAgency(req.params.id, req.body ?? {}, req.user!.id));
});

router.post('/agencies/:id/switch', async (req, res) => {
  res.json(await switchAgency(req.params.id, req.user!.id));
});

router.get('/agencies/:id/members', async (req, res) => {
  res.json(await getAgencyMembers(req.params.id, req.user!.id));
});

router.post('/agencies/:id/members', async (req, res) => {
  res.status(201).json(await inviteAgencyMember(req.params.id, req.body ?? {}, req.user!.id));
});

router.patch('/agencies/:id/members/:userId', async (req, res) => {
  res.json(await patchAgencyMember(req.params.id, req.params.userId, req.body ?? {}, req.user!.id));
});

router.delete('/agencies/:id/members/:userId', async (req, res) => {
  res.json(await removeAgencyMember(req.params.id, req.params.userId, req.user!.id));
});

export const agencyRoutes = router;
