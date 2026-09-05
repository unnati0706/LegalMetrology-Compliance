"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const b04_controller_1 = require("./b04.controller");
const b04_service_1 = require("./b04.service");
const b05_guard_1 = require("../b05/b05.guard");
const router = (0, express_1.Router)();
// Public auth routes
router.post('/login', b04_controller_1.login);
router.post('/refresh', b04_controller_1.refreshToken);
// Protected routes
router.use(b04_service_1.authenticateToken);
router.get('/', (0, b05_guard_1.requireRole)(['Administrator', 'Inspector', 'Supervisor']), b04_controller_1.getUsers);
router.post('/', (0, b05_guard_1.requireRole)(['Administrator']), b04_controller_1.createUser);
router.get('/:id', (0, b05_guard_1.requireRole)(['Administrator', 'Inspector', 'Supervisor', 'Manufacturer']), b04_controller_1.getUserById);
router.patch('/:id', (0, b05_guard_1.requireRole)(['Administrator']), b04_controller_1.updateUser);
exports.default = router;
