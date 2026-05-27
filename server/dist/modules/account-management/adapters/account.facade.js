"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.accountFacade = void 0;
const account_service_1 = require("../services/account.service");
exports.accountFacade = {
    getProfile: account_service_1.getProfile,
    getBrandSettings: account_service_1.getBrandSettings,
};
