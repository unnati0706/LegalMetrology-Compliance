"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAuditLog = exports.createAuditLog = exports.getAuditLogById = exports.getAuditLogs = void 0;
const b06_service_1 = require("./b06.service");
const service = new b06_service_1.B06Service();
const getAuditLogs = async (req, res, next) => {
    try {
        const entityType = req.query.entityType;
        const entityId = req.query.entityId;
        const limit = parseInt(req.query.limit || '10', 10);
        const offset = parseInt(req.query.offset || '0', 10);
        const result = await service.getAuditLogs(entityType, entityId, limit, offset);
        res.json({
            success: true,
            data: result.items,
            pagination: { limit, offset, total: result.total },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getAuditLogs = getAuditLogs;
const getAuditLogById = async (req, res, next) => {
    try {
        const record = await service.getAuditLogById(req.params.id);
        res.json({ success: true, data: record });
    }
    catch (err) {
        next(err);
    }
};
exports.getAuditLogById = getAuditLogById;
const createAuditLog = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const record = await service.createAuditLog(req.body, userId);
        res.status(201).json({ success: true, data: record });
    }
    catch (err) {
        next(err);
    }
};
exports.createAuditLog = createAuditLog;
const updateAuditLog = async (req, res, next) => {
    try {
        const record = await service.updateAuditLogReason(req.params.id, req.body.reason);
        res.json({ success: true, data: record });
    }
    catch (err) {
        next(err);
    }
};
exports.updateAuditLog = updateAuditLog;
