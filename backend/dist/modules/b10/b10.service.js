"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.B10Service = exports.InvalidImageError = void 0;
const b10_repository_1 = require("./b10.repository");
const storage_adapter_1 = require("./storage.adapter");
const errors_1 = require("../../shared/errors");
const audit_1 = require("../../shared/audit");
class InvalidImageError extends errors_1.AppError {
    constructor(message = 'Uploaded file is not a supported/valid image type') {
        super(400, 'INVALID_IMAGE', message);
    }
}
exports.InvalidImageError = InvalidImageError;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/tiff', 'application/pdf'];
const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25MB
class B10Service {
    repo = new b10_repository_1.B10Repository();
    storageAdapter = new storage_adapter_1.LocalStorageAdapter();
    async getEvidenceList(inspectionId, limit = 10, offset = 0) {
        return this.repo.findAll({ inspectionId, limit, offset });
    }
    async getEvidenceById(id) {
        const evidence = await this.repo.findById(id);
        if (!evidence) {
            throw new errors_1.NotFoundError('10', 'Evidence');
        }
        // Refresh signed URL on retrieval
        const freshSignedUrl = await this.storageAdapter.getSignedUrl(evidence.fileKey);
        return { ...evidence, signedUrl: freshSignedUrl };
    }
    async uploadEvidence(payload, userId) {
        if (!payload.inspectionId || !payload.fileName || !payload.mimeType || !payload.fileBase64) {
            throw new errors_1.ValidationError('inspectionId, fileName, mimeType, and fileBase64 are required');
        }
        if (!ALLOWED_MIME_TYPES.includes(payload.mimeType.toLowerCase())) {
            throw new InvalidImageError(`Unsupported MIME type '${payload.mimeType}'. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`);
        }
        const buffer = Buffer.from(payload.fileBase64, 'base64');
        if (buffer.length > MAX_FILE_SIZE_BYTES) {
            throw new InvalidImageError(`File size (${buffer.length} bytes) exceeds maximum limit of 25MB`);
        }
        const fileKey = `inspections/${payload.inspectionId}/${Date.now()}_${payload.fileName}`;
        const uploadResult = await this.storageAdapter.uploadFile(fileKey, buffer, payload.mimeType);
        const signedUrl = await this.storageAdapter.getSignedUrl(fileKey);
        const created = await this.repo.create({
            inspectionId: payload.inspectionId,
            fileKey,
            originalName: payload.fileName,
            mimeType: payload.mimeType,
            sizeBytes: uploadResult.sizeBytes,
            packageSide: payload.packageSide || 'front',
            checksum: uploadResult.checksum,
            signedUrl,
            uploadedBy: userId,
        });
        (0, audit_1.recordAuditLog)({
            userId,
            action: 'UPLOAD_EVIDENCE',
            entityType: 'Evidence',
            entityId: created.id,
            newValue: { id: created.id, fileKey: created.fileKey, packageSide: created.packageSide },
        });
        return created;
    }
    async updateEvidence(id, updates, userId) {
        const previous = await this.getEvidenceById(id);
        const updated = await this.repo.update(id, updates);
        if (!updated) {
            throw new errors_1.NotFoundError('10', 'Evidence');
        }
        (0, audit_1.recordAuditLog)({
            userId,
            action: 'UPDATE_EVIDENCE',
            entityType: 'Evidence',
            entityId: id,
            previousValue: previous,
            newValue: updated,
        });
        return updated;
    }
}
exports.B10Service = B10Service;
