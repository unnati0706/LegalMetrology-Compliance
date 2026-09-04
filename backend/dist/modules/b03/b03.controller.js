"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSecuritySettings = exports.getSecuritySettings = void 0;
const b03_service_1 = require("./b03.service");
const service = new b03_service_1.B03Service();
const getSecuritySettings = async (req, res, next) => {
    try {
        const data = await service.getSecuritySettings();
        res.json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
};
exports.getSecuritySettings = getSecuritySettings;
const updateSecuritySettings = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const data = await service.updateSecuritySettings(req.body, userId);
        res.json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
};
exports.updateSecuritySettings = updateSecuritySettings;
