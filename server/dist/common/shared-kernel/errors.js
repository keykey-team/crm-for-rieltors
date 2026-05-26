"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
exports.badRequest = badRequest;
exports.unauthorized = unauthorized;
exports.forbidden = forbidden;
exports.conflict = conflict;
class AppError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}
exports.AppError = AppError;
function badRequest(message) {
    return new AppError(400, message);
}
function unauthorized(message = 'Unauthorized') {
    return new AppError(401, message);
}
function forbidden(message = 'Forbidden') {
    return new AppError(403, message);
}
function conflict(message) {
    return new AppError(409, message);
}
