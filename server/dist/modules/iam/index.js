"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.iamFacade = exports.userManagementRoutes = exports.iamRoutes = void 0;
var auth_routes_1 = require("./controllers/auth.routes");
Object.defineProperty(exports, "iamRoutes", { enumerable: true, get: function () { return auth_routes_1.iamRoutes; } });
var user_admin_routes_1 = require("./controllers/user-admin.routes");
Object.defineProperty(exports, "userManagementRoutes", { enumerable: true, get: function () { return user_admin_routes_1.userManagementRoutes; } });
var iam_facade_1 = require("./adapters/iam.facade");
Object.defineProperty(exports, "iamFacade", { enumerable: true, get: function () { return iam_facade_1.iamFacade; } });
