"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.accountFacade = exports.accountRoutes = void 0;
var account_routes_1 = require("./controllers/account.routes");
Object.defineProperty(exports, "accountRoutes", { enumerable: true, get: function () { return account_routes_1.accountRoutes; } });
var account_facade_1 = require("./adapters/account.facade");
Object.defineProperty(exports, "accountFacade", { enumerable: true, get: function () { return account_facade_1.accountFacade; } });
