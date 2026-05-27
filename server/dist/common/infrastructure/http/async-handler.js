"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = asyncHandler;
exports.createAsyncRouter = createAsyncRouter;
const express_1 = require("express");
function asyncHandler(handler) {
    return (req, res, next) => {
        Promise.resolve(handler(req, res, next)).catch(next);
    };
}
function createAsyncRouter() {
    const router = (0, express_1.Router)();
    ['get', 'post', 'put', 'delete', 'patch'].forEach((method) => {
        const original = router[method].bind(router);
        router[method] = (path, ...handlers) => original(path, ...handlers.map((handler) => (handler.length === 4 ? handler : asyncHandler(handler))));
    });
    return router;
}
