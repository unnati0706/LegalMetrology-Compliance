"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = exports.B04Service = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const config_1 = require("../../config");
const b04_repository_1 = require("./b04.repository");
const errors_1 = require("../../shared/errors");
const audit_1 = require("../../shared/audit");
class B04Service {
    repo = new b04_repository_1.B04Repository();
    async login(email, pass) {
        const user = await this.repo.findUserByEmail(email);
        if (!user) {
            throw new errors_1.UnauthorizedError('Invalid credentials');
        }
        const match = await bcryptjs_1.default.compare(pass, user.passwordHash);
        if (!match) {
            throw new errors_1.UnauthorizedError('Invalid credentials');
        }
        const payload = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
        };
        const accessToken = jsonwebtoken_1.default.sign(payload, config_1.config.jwtSecret, { expiresIn: config_1.config.jwtExpiresIn });
        const refreshToken = jsonwebtoken_1.default.sign({ id: user.id }, config_1.config.refreshTokenSecret, { expiresIn: config_1.config.refreshTokenExpiresIn });
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        await this.repo.createSession(user.id, refreshToken, expiresAt);
        (0, audit_1.recordAuditLog)({
            userId: user.id,
            action: 'USER_LOGIN',
            entityType: 'User',
            entityId: user.id,
        });
        const { passwordHash, ...userWithoutPassword } = user;
        return {
            accessToken,
            refreshToken,
            user: userWithoutPassword,
        };
    }
    async refreshToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, config_1.config.refreshTokenSecret);
            const session = await this.repo.findSessionByRefreshToken(token);
            if (!session) {
                throw new errors_1.UnauthorizedError('Invalid or revoked refresh token');
            }
            const user = await this.repo.findUserById(decoded.id);
            if (!user) {
                throw new errors_1.UnauthorizedError('User not found');
            }
            const payload = {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
            };
            const newAccessToken = jsonwebtoken_1.default.sign(payload, config_1.config.jwtSecret, { expiresIn: config_1.config.jwtExpiresIn });
            return { accessToken: newAccessToken };
        }
        catch (err) {
            throw new errors_1.UnauthorizedError('Invalid or expired refresh token');
        }
    }
    async registerUser(data, actingUserId) {
        if (!data.email || !data.password || !data.username) {
            throw new errors_1.ValidationError('Username, email, and password are required');
        }
        const existing = await this.repo.findUserByEmail(data.email);
        if (existing) {
            throw new errors_1.ValidationError('User with this email already exists');
        }
        const passwordHash = await bcryptjs_1.default.hash(data.password, 10);
        const user = await this.repo.createUser({
            username: data.username,
            email: data.email,
            passwordHash,
            role: data.role,
        });
        (0, audit_1.recordAuditLog)({
            userId: actingUserId || user.id,
            action: 'USER_REGISTER',
            entityType: 'User',
            entityId: user.id,
            newValue: { id: user.id, username: user.username, role: user.role },
        });
        const { passwordHash: _, ...safeUser } = user;
        return safeUser;
    }
    async listUsers(limit = 10, offset = 0) {
        const result = await this.repo.findAllUsers(limit, offset);
        const safeItems = result.items.map(({ passwordHash, ...safe }) => safe);
        return { items: safeItems, total: result.total };
    }
    async getUserById(id) {
        const user = await this.repo.findUserById(id);
        if (!user) {
            throw new errors_1.NotFoundError('04', 'User');
        }
        const { passwordHash, ...safeUser } = user;
        return safeUser;
    }
    async updateUser(id, updates, actingUserId) {
        const previous = await this.getUserById(id);
        const updated = await this.repo.updateUser(id, updates);
        if (!updated) {
            throw new errors_1.NotFoundError('04', 'User');
        }
        (0, audit_1.recordAuditLog)({
            userId: actingUserId,
            action: 'UPDATE_USER',
            entityType: 'User',
            entityId: id,
            previousValue: previous,
            newValue: updated,
        });
        const { passwordHash, ...safeUser } = updated;
        return safeUser;
    }
}
exports.B04Service = B04Service;
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return next(new errors_1.UnauthorizedError('Bearer token is required'));
    }
    try {
        const user = jsonwebtoken_1.default.verify(token, config_1.config.jwtSecret);
        req.user = user;
        next();
    }
    catch (err) {
        return next(new errors_1.UnauthorizedError('Invalid or expired access token'));
    }
};
exports.authenticateToken = authenticateToken;
