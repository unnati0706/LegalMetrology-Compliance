"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = void 0;
const errors_1 = require("../../shared/errors");
const requireRole = (allowedRoles) => {
    return (req, _res, next) => {
        const user = req.user;
        if (!user) {
            return next(new errors_1.UnauthorizedError('Authentication required before authorization check'));
        }
        if (!allowedRoles.includes(user.role)) {
            return next(new errors_1.PermissionDeniedError(`Role '${user.role}' is not authorized to access this resource. Allowed roles: ${allowedRoles.join(', ')}`));
        }
        next();
    };
};
exports.requireRole = requireRole;
