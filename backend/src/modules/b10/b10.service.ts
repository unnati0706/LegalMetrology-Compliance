import { B10Repository, EvidenceEntity } from './b10.repository';
import { LocalStorageAdapter, IStorageAdapter } from './storage.adapter';
import { NotFoundError, ValidationError, AppError } from '../../shared/errors';
import { recordAuditLog } from '../../shared/audit';

export class InvalidImageError extends AppError {
  constructor(message: string = 'Uploaded file is not a supported/valid image type') {
    super(400, 'INVALID_IMAGE', message);
  }
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/tiff', 'application/pdf'];
const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25MB

export class B10Service {
  private repo = new B10Repository();
  private storageAdapter: IStorageAdapter = new LocalStorageAdapter();

  async getEvidenceList(inspectionId?: string, limit = 10, offset = 0) {
    return this.repo.findAll({ inspectionId, limit, offset });
  }

  async getEvidenceById(id: string): Promise<EvidenceEntity> {
    const evidence = await this.repo.findById(id);
    if (!evidence) {
      throw new NotFoundError('10', 'Evidence');
    }
    // Refresh signed URL on retrieval
    const freshSignedUrl = await this.storageAdapter.getSignedUrl(evidence.fileKey);
    return { ...evidence, signedUrl: freshSignedUrl };
  }

  async uploadEvidence(payload: { inspectionId: string; fileName: string; mimeType: string; fileBase64: string; packageSide?: string }, userId: string): Promise<EvidenceEntity> {
    if (!payload.inspectionId || !payload.fileName || !payload.mimeType || !payload.fileBase64) {
      throw new ValidationError('inspectionId, fileName, mimeType, and fileBase64 are required');
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

    recordAuditLog({
      userId,
      action: 'UPLOAD_EVIDENCE',
      entityType: 'Evidence',
      entityId: created.id,
      newValue: { id: created.id, fileKey: created.fileKey, packageSide: created.packageSide },
    });

    return created;
  }

  async updateEvidence(id: string, updates: { packageSide?: string }, userId: string): Promise<EvidenceEntity> {
    const previous = await this.getEvidenceById(id);
    const updated = await this.repo.update(id, updates);
    if (!updated) {
      throw new NotFoundError('10', 'Evidence');
    }

    recordAuditLog({
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
