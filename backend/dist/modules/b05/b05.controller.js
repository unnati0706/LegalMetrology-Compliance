"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRole = exports.createRole = exports.getRoleById = exports.getRoles = void 0;
const b05_service_1 = require("./b05.service");
const service = new b05_service_1.B05Service();
const getRoles = async (req, res, next) => {
    try {
        const roles = await service.getRoles();
        res.json({ success: true, data: roles });
    }
    catch (err) {
        next(err);
    }
};
exports.getRoles = getRoles;
const getRoleById = async (req, res, next) => {
    try {
        const role = await service.getRoleById(req.params.id);
        res.json({ success: true, data: role });
    }
    catch (err) {
        next(err);
    }
};
exports.getRoleById = getRoleById;
const createRole = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const role = await service.createRole(req.body, userId);
        res.status(201).json({ success: true, data: role });
    }
    catch (err) {
        next(err);
    }
};
exports.createRole = createRole;
const updateRole = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const role = await service.updateRole(req.params.id, req.body, userId);
        res.json({ success: true, data: role });
    }
    catch (err) {
        next(err);
    }
};
exports.updateRole = updateRole;
