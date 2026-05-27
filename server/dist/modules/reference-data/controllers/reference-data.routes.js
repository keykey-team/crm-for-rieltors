"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.referenceDataRoutes = void 0;
const async_handler_1 = require("../../../common/infrastructure/http/async-handler");
const dictionary_service_1 = require("../services/dictionary.service");
const middleware_1 = require("../../../common/validation/middleware");
const reference_data_schemas_1 = require("./reference-data.schemas");
const router = (0, async_handler_1.createAsyncRouter)();
router.get('/dictionaries', async (req, res) => {
    const category = typeof req.query.category === 'string' ? req.query.category : undefined;
    res.json(await (0, dictionary_service_1.listDictionaries)(category));
});
router.post('/dictionaries', (0, middleware_1.validateBody)(reference_data_schemas_1.createDictionarySchema), async (req, res) => {
    res.status(201).json(await (0, dictionary_service_1.addDictionary)(req.body));
});
router.put('/dictionaries', (0, middleware_1.validateBody)(reference_data_schemas_1.updateDictionarySchema), async (req, res) => {
    res.json(await (0, dictionary_service_1.changeDictionary)(req.body));
});
router.delete('/dictionaries', async (req, res) => {
    res.json(await (0, dictionary_service_1.removeDictionary)(req.query.id));
});
exports.referenceDataRoutes = router;
