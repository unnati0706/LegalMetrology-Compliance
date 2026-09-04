"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUser = exports.createUser = exports.getUserById = exports.getUsers = void 0;
const b07_service_1 = require("./b07.service");
const service = new b07_service_1.B07Service();
const getUsers = async (req, res, next) => {
    try {
        const role = req.query.role;
        const status = req.query.status;
        const limit = parseInt(req.query.limit || '10', 10);
        const offset = parseInt(req.query.offset || '0', 10);
        const result = await service.getUsers(role, status, limit, offset);
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
exports.getUsers = getUsers;
const getUserById = async (req, res, next) => {
    try {
        const user = await service.getUserById(req.params.id);
        res.json({ success: true, data: user });
    }
    catch (err) {
        next(err);
    }
};
exports.getUserById = getUserById;
const createUser = async (req, res, next) => {
    try {
        const actingUserId = req.user?.id;
        const user = await service.createUser(req.body, actingUserId);
        res.status(201).json({ success: true, data: user });
    }
    catch (err) {
        next(err);
    }
};
exports.createUser = createUser;
const updateUser = async (req, res, next) => {
    try {
        const actingUserId = req.user?.id;
        const user = await service.updateUser(req.params.id, req.body, actingUserId);
        res.json({ success: true, data: user });
    }
    catch (err) {
        next(err);
    }
};
exports.updateUser = updateUser;
