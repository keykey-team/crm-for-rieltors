"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.currencyFacade = void 0;
const exchange_rate_service_1 = require("../services/exchange-rate.service");
exports.currencyFacade = {
    getUsdExchangeRate: exchange_rate_service_1.getUsdExchangeRate,
};
