"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = validateBody;
const errors_1 = require("../shared-kernel/errors");
function validateBody(schema) {
    return (req, _res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            const fields = {};
            for (const issue of result.error.issues) {
                const key = issue.path.join('.') || '_';
                if (!fields[key])
                    fields[key] = issue.message;
            }
            const err = new errors_1.AppError(400, 'Validation failed');
            err.fields = fields;
            return next(err);
        }
        req.body = result.data;
        next();
    };
}
