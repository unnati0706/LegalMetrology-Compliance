"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncSchema = exports.getTableMeta = exports.getDatabaseInfo = void 0;
const b02_service_1 = require("./b02.service");
const service = new b02_service_1.B02Service();
const getDatabaseInfo = async (req, res, next) => {
    try {
        const data = await service.getDatabaseInfo();
        res.json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
};
exports.getDatabaseInfo = getDatabaseInfo;
const getTableMeta = async (req, res, next) => {
    try {
        const data = await service.getTableMeta(req.params.id);
        res.json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
};
exports.getTableMeta = getTableMeta;
const syncSchema = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const data = await service.syncSchema(userId);
        res.json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
};
exports.syncSchema = syncSchema;
