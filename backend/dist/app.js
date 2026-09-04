"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const b03_middleware_1 = require("./modules/b03/b03.middleware");
const idempotency_1 = require("./shared/idempotency");
const errors_1 = require("./shared/errors");
const audit_1 = require("./shared/audit");
const b01_routes_1 = __importDefault(require("./modules/b01/b01.routes"));
const b02_routes_1 = __importDefault(require("./modules/b02/b02.routes"));
const b03_routes_1 = __importDefault(require("./modules/b03/b03.routes"));
const b04_routes_1 = __importDefault(require("./modules/b04/b04.routes"));
const b05_routes_1 = __importDefault(require("./modules/b05/b05.routes"));
const app = (0, express_1.default)();
// Global Middlewares
app.use(b03_middleware_1.helmetMiddleware);
app.use(b03_middleware_1.corsMiddleware);
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use(b03_middleware_1.rateLimiterMiddleware);
app.use(idempotency_1.idempotencyMiddleware);
// Health Check Endpoint
app.get('/health', (_req, res) => {
    res.json({
        status: 'UP',
        service: 'Legal Metrology Compliance Backend (SIH26034)',
        timestamp: new Date().toISOString(),
    });
});
// Module API Routes
app.use('/api/v1/b01', b01_routes_1.default);
app.use('/api/v1/b02', b02_routes_1.default);
app.use('/api/v1/b03', b03_routes_1.default);
app.use('/api/v1/b04', b04_routes_1.default);
app.use('/api/v1/b05', b05_routes_1.default);
// Audit Logs Endpoint (Admin/Supervisor)
app.get('/api/v1/audit-logs', (req, res) => {
    const entityType = req.query.entityType;
    const entityId = req.query.entityId;
    const logs = (0, audit_1.getAuditLogs)(entityType, entityId);
    res.json({ success: true, data: logs });
});
// Global Error Handler
app.use(errors_1.errorHandler);
exports.default = app;
