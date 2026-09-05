"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalStorageAdapter = void 0;
const crypto_1 = __importDefault(require("crypto"));
class LocalStorageAdapter {
    files = new Map();
    async uploadFile(fileKey, buffer, mimeType) {
        this.files.set(fileKey, { buffer, mimeType });
        const checksum = crypto_1.default.createHash('sha256').update(buffer).digest('hex');
        return {
            fileKey,
            sizeBytes: buffer.length,
            checksum,
        };
    }
    async getSignedUrl(fileKey, expiresInSeconds = 3600) {
        const expires = Math.floor(Date.now() / 1000) + expiresInSeconds;
        const token = crypto_1.default.createHash('md5').update(`${fileKey}:${expires}:secret`).digest('hex');
        return `https://s3.ap-south-1.amazonaws.com/legal-metrology-evidence/${fileKey}?expires=${expires}&token=${token}`;
    }
    async deleteFile(fileKey) {
        return this.files.delete(fileKey);
    }
}
exports.LocalStorageAdapter = LocalStorageAdapter;
