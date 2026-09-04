"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUser = exports.createUser = exports.getUserById = exports.getUsers = exports.refreshToken = exports.login = void 0;
const b04_service_1 = require("./b04.service");
const service = new b04_service_1.B04Service();
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const result = await service.login(email, password);
        res.json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
};
exports.login = login;
const refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        const result = await service.refreshToken(refreshToken);
        res.json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
};
exports.refreshToken = refreshToken;
const getUsers = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit || '10', 10);
        const offset = parseInt(req.query.offset || '0', 10);
        const result = await service.listUsers(limit, offset);
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
        const user = await service.registerUser(req.body, actingUserId);
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
