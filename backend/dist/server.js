"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const config_1 = require("./config");
const db_1 = require("./db");
const startServer = async () => {
    await (0, db_1.initializeDatabase)();
    app_1.default.listen(config_1.config.port, () => {
        console.log(`[SERVER] Legal Metrology Backend listening on port ${config_1.config.port} (${config_1.config.nodeEnv})`);
    });
};
startServer();
