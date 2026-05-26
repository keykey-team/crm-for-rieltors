"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.currencyRoutes = void 0;
const async_handler_1 = require("../../../common/infrastructure/http/async-handler");
const exchange_rate_service_1 = require("../services/exchange-rate.service");
const router = (0, async_handler_1.createAsyncRouter)();
router.get('/exchange-rate', async (_req, res) => {
    res.json(await (0, exchange_rate_service_1.getUsdExchangeRate)());
});
exports.currencyRoutes = router;
