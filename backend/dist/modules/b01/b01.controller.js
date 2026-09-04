"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateConfig = exports.createConfig = exports.getConfigById = exports.getConfigs = void 0;
const b01_service_1 = require("./b01.service");
const service = new b01_service_1.B01Service();
const getConfigs = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit || '10', 10);
        const offset = parseInt(req.query.offset || '0', 10);
        const result = await service.getConfigs(limit, offset);
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
exports.getConfigs = getConfigs;
const getConfigById = async (req, res, next) => {
    try {
        const config = await service.getConfigById(req.params.id);
        res.json({ success: true, data: config });
    }
    catch (err) {
        next(err);
    }
};
exports.getConfigById = getConfigById;
const createConfig = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const config = await service.createConfig(req.body, userId);
        res.status(201).json({ success: true, data: config });
    }
    catch (err) {
        next(err);
    }
};
exports.createConfig = createConfig;
const updateConfig = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const config = await service.updateConfig(req.params.id, req.body, userId);
        res.json({ success: true, data: config });
    }
    catch (err) {
        next(err);
    }
};
exports.updateConfig = updateConfig;
