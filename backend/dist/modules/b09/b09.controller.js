"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateInspection = exports.createInspection = exports.getInspectionById = exports.getInspections = void 0;
const b09_service_1 = require("./b09.service");
const service = new b09_service_1.B09Service();
const getInspections = async (req, res, next) => {
    try {
        const user = req.user;
        const status = req.query.status;
        const limit = parseInt(req.query.limit || '10', 10);
        const offset = parseInt(req.query.offset || '0', 10);
        const result = await service.getInspections(user.role, user.id, status, limit, offset);
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
exports.getInspections = getInspections;
const getInspectionById = async (req, res, next) => {
    try {
        const user = req.user;
        const inspection = await service.getInspectionById(req.params.id, user.role, user.id);
        res.json({ success: true, data: inspection });
    }
    catch (err) {
        next(err);
    }
};
exports.getInspectionById = getInspectionById;
const createInspection = async (req, res, next) => {
    try {
        const user = req.user;
        const inspection = await service.createInspection(req.body, user.role, user.id);
        res.status(201).json({ success: true, data: inspection });
    }
    catch (err) {
        next(err);
    }
};
exports.createInspection = createInspection;
const updateInspection = async (req, res, next) => {
    try {
        const user = req.user;
        const inspection = await service.updateInspection(req.params.id, req.body, user.role, user.id);
        res.json({ success: true, data: inspection });
    }
    catch (err) {
        next(err);
    }
};
exports.updateInspection = updateInspection;
