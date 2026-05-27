"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.referenceDataFacade = exports.referenceDataRoutes = void 0;
var reference_data_routes_1 = require("./controllers/reference-data.routes");
Object.defineProperty(exports, "referenceDataRoutes", { enumerable: true, get: function () { return reference_data_routes_1.referenceDataRoutes; } });
var reference_data_facade_1 = require("./adapters/reference-data.facade");
Object.defineProperty(exports, "referenceDataFacade", { enumerable: true, get: function () { return reference_data_facade_1.referenceDataFacade; } });
