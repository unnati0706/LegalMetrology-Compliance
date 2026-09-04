"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.B03Repository = void 0;
const config_1 = require("../../config");
let securitySettings = {
    id: 'sec_global',
    corsOrigin: config_1.config.corsOrigin,
    rateLimitMax: config_1.config.rateLimitMax,
    rateLimitWindowMs: config_1.config.rateLimitWindowMs,
    helmetEnabled: true,
    updatedAt: new Date().toISOString(),
};
class B03Repository {
    async getSettings() {
        return securitySettings;
    }
    async updateSettings(updates) {
        securitySettings = {
            ...securitySettings,
            ...updates,
            updatedAt: new Date().toISOString(),
        };
        return securitySettings;
    }
}
exports.B03Repository = B03Repository;
