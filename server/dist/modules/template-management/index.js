"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.templateFacade = exports.templateRoutes = void 0;
var template_routes_1 = require("./controllers/template.routes");
Object.defineProperty(exports, "templateRoutes", { enumerable: true, get: function () { return template_routes_1.templateRoutes; } });
var template_facade_1 = require("./adapters/template.facade");
Object.defineProperty(exports, "templateFacade", { enumerable: true, get: function () { return template_facade_1.templateFacade; } });
