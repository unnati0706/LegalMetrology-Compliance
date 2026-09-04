"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDbStatus = exports.initializeDatabase = exports.pool = void 0;
const pg_1 = require("pg");
const config_1 = require("../config");
exports.pool = new pg_1.Pool({
    connectionString: config_1.config.databaseUrl,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});
let isConnected = false;
const initializeDatabase = async () => {
    try {
        const client = await exports.pool.connect();
        isConnected = true;
        client.release();
        console.log('[DB] PostgreSQL pool initialized successfully.');
        return true;
    }
    catch (error) {
        console.warn('[DB] PostgreSQL connection not established (using in-memory data layer fallback for testing/dev):', error.message);
        isConnected = false;
        return false;
    }
};
exports.initializeDatabase = initializeDatabase;
const getDbStatus = () => {
    return {
        connected: isConnected,
        databaseUrl: config_1.config.databaseUrl.replace(/:[^:@]+@/, ':***@'),
    };
};
exports.getDbStatus = getDbStatus;
