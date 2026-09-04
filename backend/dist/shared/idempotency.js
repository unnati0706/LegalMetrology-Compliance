"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.idempotencyMiddleware = void 0;
const idempotencyStore = new Map();
const idempotencyMiddleware = (req, res, next) => {
    const key = req.headers['idempotency-key'];
    if (!key || req.method === 'GET') {
        return next();
    }
    if (idempotencyStore.has(key)) {
        const cached = idempotencyStore.get(key);
        return res.status(cached.statusCode).json(cached.body);
    }
    const originalJson = res.json.bind(res);
    res.json = (body) => {
        idempotencyStore.set(key, {
            statusCode: res.statusCode,
            body,
        });
        return originalJson(body);
    };
    next();
};
exports.idempotencyMiddleware = idempotencyMiddleware;
