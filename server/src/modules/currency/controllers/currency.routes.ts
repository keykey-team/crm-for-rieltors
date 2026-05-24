import { createAsyncRouter } from '../../../common/infrastructure/http/async-handler';
import { getUsdExchangeRate } from '../services/exchange-rate.service';

const router = createAsyncRouter();

router.get('/exchange-rate', async (_req, res) => {
  res.json(await getUsdExchangeRate());
});

export const currencyRoutes = router;
