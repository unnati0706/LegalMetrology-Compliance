"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.InvalidStateTransitionError = exports.NotFoundError = exports.PermissionDeniedError = exports.UnauthorizedError = exports.ValidationError = exports.AppError = void 0;
class AppError extends Error {
    statusCode;
    errorCode;
    details;
    constructor(statusCode, errorCode, message, details) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.details = details;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.AppError = AppError;
class ValidationError extends AppError {
    constructor(message = 'Payload failed schema validation', details) {
        super(400, 'VALIDATION_ERROR', message, details);
    }
}
exports.ValidationError = ValidationError;
class UnauthorizedError extends AppError {
    constructor(message = 'Authentication required') {
        super(401, 'UNAUTHORIZED', message);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class PermissionDeniedError extends AppError {
    constructor(message = 'Permission denied for this action') {
        super(403, 'PERMISSION_DENIED', message);
    }
}
exports.PermissionDeniedError = PermissionDeniedError;
class NotFoundError extends AppError {
    constructor(modulePrefix, resourceName = 'Resource') {
        super(404, `${modulePrefix}_NOT_FOUND`, `${resourceName} not found`);
    }
}
exports.NotFoundError = NotFoundError;
class InvalidStateTransitionError extends AppError {
    constructor(message = 'Action not permitted in the current resource state') {
        super(400, 'INVALID_STATE_TRANSITION', message);
    }
}
exports.InvalidStateTransitionError = InvalidStateTransitionError;
const errorHandler = (err, _req, res, _next) => {
    const statusCode = err.statusCode || 500;
    const errorCode = err.errorCode || 'INTERNAL_SERVER_ERROR';
    const message = err.message || 'An unexpected internal server error occurred';
    res.status(statusCode).json({
        success: false,
        error: {
            code: errorCode,
            message,
            ...(err.details ? { details: err.details } : {}),
        },
        timestamp: new Date().toISOString(),
    });
};
exports.errorHandler = errorHandler;
