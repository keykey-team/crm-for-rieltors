"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.knowledgeBaseRoutes = void 0;
const async_handler_1 = require("../../../common/infrastructure/http/async-handler");
const knowledge_base_service_1 = require("../services/knowledge-base.service");
const middleware_1 = require("../../../common/validation/middleware");
const knowledge_base_schemas_1 = require("./knowledge-base.schemas");
const router = (0, async_handler_1.createAsyncRouter)();
router.get('/knowledge-base', async (req, res) => {
    res.json(await (0, knowledge_base_service_1.listArticles)({
        search: typeof req.query.search === 'string' ? req.query.search : '',
        category: typeof req.query.category === 'string' ? req.query.category : '',
    }));
});
router.post('/knowledge-base', (0, middleware_1.validateBody)(knowledge_base_schemas_1.createArticleSchema), async (req, res) => {
    res.status(201).json(await (0, knowledge_base_service_1.addArticle)(req.user?.id, req.body));
});
router.put('/knowledge-base/:id', (0, middleware_1.validateBody)(knowledge_base_schemas_1.updateArticleSchema), async (req, res) => {
    res.json(await (0, knowledge_base_service_1.changeArticle)(req.params.id, req.body));
});
router.delete('/knowledge-base/:id', async (req, res) => {
    res.json(await (0, knowledge_base_service_1.removeArticle)(req.params.id));
});
exports.knowledgeBaseRoutes = router;
