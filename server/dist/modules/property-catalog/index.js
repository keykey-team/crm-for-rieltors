"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.propertyFacade = exports.propertyRoutes = void 0;
var property_routes_1 = require("./controllers/property.routes");
Object.defineProperty(exports, "propertyRoutes", { enumerable: true, get: function () { return property_routes_1.propertyRoutes; } });
var property_facade_1 = require("./adapters/property.facade");
Object.defineProperty(exports, "propertyFacade", { enumerable: true, get: function () { return property_facade_1.propertyFacade; } });
