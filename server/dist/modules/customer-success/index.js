"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerSuccessFacade = exports.customerSuccessRoutes = void 0;
var customer_success_routes_1 = require("./controllers/customer-success.routes");
Object.defineProperty(exports, "customerSuccessRoutes", { enumerable: true, get: function () { return customer_success_routes_1.customerSuccessRoutes; } });
var customer_success_facade_1 = require("./adapters/customer-success.facade");
Object.defineProperty(exports, "customerSuccessFacade", { enumerable: true, get: function () { return customer_success_facade_1.customerSuccessFacade; } });
