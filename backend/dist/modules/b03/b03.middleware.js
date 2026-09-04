"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = exports.rateLimiterMiddleware = exports.corsMiddleware = exports.helmetMiddleware = void 0;
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const zod_1 = require("zod");
const config_1 = require("../../config");
const errors_1 = require("../../shared/errors");
exports.helmetMiddleware = (0, helmet_1.default)();
exports.corsMiddleware = (0, cors_1.default)({
    origin: config_1.config.corsOrigin,
    credentials: true,
});
exports.rateLimiterMiddleware = (0, express_rate_limit_1.default)({
    windowMs: config_1.config.rateLimitWindowMs,
    max: config_1.config.rateLimitMax,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests from this IP, please try again later',
        },
    },
});
const validateRequest = (schema) => {
    return (req, _res, next) => {
        try {
            if (schema.body) {
                req.body = schema.body.parse(req.body);
            }
            if (schema.query) {
                req.query = schema.query.parse(req.query);
            }
            if (schema.params) {
                req.params = schema.params.parse(req.params);
            }
            next();
        }
        catch (err) {
            if (err instanceof zod_1.ZodError) {
                const issues = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
                return next(new errors_1.ValidationError(`Validation failed: ${issues}`, err.errors));
            }
            next(err);
        }
    };
};
exports.validateRequest = validateRequest;
