"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.knowledgeBaseFacade = exports.knowledgeBaseRoutes = void 0;
var knowledge_base_routes_1 = require("./controllers/knowledge-base.routes");
Object.defineProperty(exports, "knowledgeBaseRoutes", { enumerable: true, get: function () { return knowledge_base_routes_1.knowledgeBaseRoutes; } });
var knowledge_base_facade_1 = require("./adapters/knowledge-base.facade");
Object.defineProperty(exports, "knowledgeBaseFacade", { enumerable: true, get: function () { return knowledge_base_facade_1.knowledgeBaseFacade; } });
