"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.B04Repository = void 0;
const uuid_1 = require("uuid");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const usersStore = new Map();
const sessionsStore = new Map();
// Seed default users for testing & development
const seedUsers = async () => {
    if (usersStore.size > 0)
        return;
    const adminHash = await bcryptjs_1.default.hash('AdminPass123!', 10);
    const adminId = (0, uuid_1.v4)();
    usersStore.set(adminId, {
        id: adminId,
        username: 'admin',
        email: 'admin@legalmetrology.gov.in',
        passwordHash: adminHash,
        role: 'Administrator',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
    });
    const inspectorHash = await bcryptjs_1.default.hash('Inspector123!', 10);
    const inspectorId = (0, uuid_1.v4)();
    usersStore.set(inspectorId, {
        id: inspectorId,
        username: 'inspector1',
        email: 'inspector1@legalmetrology.gov.in',
        passwordHash: inspectorHash,
        role: 'Inspector',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
    });
    const supervisorHash = await bcryptjs_1.default.hash('Supervisor123!', 10);
    const supervisorId = (0, uuid_1.v4)();
    usersStore.set(supervisorId, {
        id: supervisorId,
        username: 'supervisor1',
        email: 'supervisor1@legalmetrology.gov.in',
        passwordHash: supervisorHash,
        role: 'Supervisor',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
    });
    const mfrHash = await bcryptjs_1.default.hash('Manufacturer123!', 10);
    const mfrId = (0, uuid_1.v4)();
    usersStore.set(mfrId, {
        id: mfrId,
        username: 'mfr_nestle',
        email: 'compliance@nestle.com',
        passwordHash: mfrHash,
        role: 'Manufacturer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
    });
};
seedUsers();
class B04Repository {
    async findUserByEmail(email) {
        await seedUsers();
        for (const u of usersStore.values()) {
            if (u.email.toLowerCase() === email.toLowerCase() && !u.deletedAt) {
                return u;
            }
        }
        return null;
    }
    async findUserById(id) {
        await seedUsers();
        const user = usersStore.get(id);
        if (!user || user.deletedAt)
            return null;
        return user;
    }
    async createUser(data) {
        const id = (0, uuid_1.v4)();
        const newUser = {
            id,
            username: data.username,
            email: data.email,
            passwordHash: data.passwordHash,
            role: data.role || 'Inspector',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            deletedAt: null,
        };
        usersStore.set(id, newUser);
        return newUser;
    }
    async createSession(userId, refreshToken, expiresAt) {
        const id = (0, uuid_1.v4)();
        const session = {
            id,
            userId,
            refreshToken,
            expiresAt,
            isRevoked: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        sessionsStore.set(id, session);
        return session;
    }
    async findSessionByRefreshToken(refreshToken) {
        for (const s of sessionsStore.values()) {
            if (s.refreshToken === refreshToken && !s.isRevoked) {
                return s;
            }
        }
        return null;
    }
    async revokeSession(sessionId) {
        const s = sessionsStore.get(sessionId);
        if (s) {
            s.isRevoked = true;
            s.updatedAt = new Date().toISOString();
        }
    }
    async findAllUsers(limit = 10, offset = 0) {
        await seedUsers();
        const active = Array.from(usersStore.values()).filter((u) => !u.deletedAt);
        return {
            items: active.slice(offset, offset + limit),
            total: active.length,
        };
    }
    async updateUser(id, updates) {
        const user = await this.findUserById(id);
        if (!user)
            return null;
        const updated = {
            ...user,
            ...(updates.username ? { username: updates.username } : {}),
            ...(updates.email ? { email: updates.email } : {}),
            ...(updates.role ? { role: updates.role } : {}),
            updatedAt: new Date().toISOString(),
        };
        usersStore.set(id, updated);
        return updated;
    }
}
exports.B04Repository = B04Repository;
