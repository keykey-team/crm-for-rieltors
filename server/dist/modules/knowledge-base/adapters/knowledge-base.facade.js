"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.knowledgeBaseFacade = void 0;
const knowledge_base_service_1 = require("../services/knowledge-base.service");
exports.knowledgeBaseFacade = {
    listArticles: knowledge_base_service_1.listArticles,
};
