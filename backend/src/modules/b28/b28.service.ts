import { B28Repository } from './b28.repository.js';
import { AuditService } from '../../shared/audit/index.js';
import { ApiError } from '../../shared/errors/index.js';
import { Evidence } from '../../shared/types/index.js';
import { StorageAdapter, MockStorageAdapter } from '../../shared/adapters/index.js';

export class B28Service {
  constructor(
    private repo: B28Repository = new B28Repository(),
    private storage: StorageAdapter = new MockStorageAdapter()
  ) {}

  public async addEvidenceToLocker(
    input: {
      inspectionId: string;
      imageUrl: string;
      packageSide: 'FRONT' | 'BACK' | 'TOP' | 'BOTTOM' | 'LEFT' | 'RIGHT' | 'PDP' | 'OTHER';
      qualityScore?: number;
      mimeType: string;
      fileSizeBytes: number;
    },
    userId: string
  ): Promise<Evidence & { signedUrl: string }> {
    const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validMimes.includes(input.mimeType.toLowerCase())) {
      throw ApiError.badRequest('INVALID_IMAGE', `Unsupported image format: ${input.mimeType}. Supported: JPEG, PNG, WEBP`);
    }

    const storageKey = `inspections/${input.inspectionId}/${Date.now()}-${input.packageSide.toLowerCase()}.jpg`;
    const signedUrl = await this.storage.getSignedUrl(storageKey);

    const evidence = this.repo.saveEvidence({
      inspectionId: input.inspectionId,
      imageUrl: input.imageUrl,
      storageKey,
      packageSide: input.packageSide,
      qualityScore: input.qualityScore ?? 92.0,
      mimeType: input.mimeType,
      fileSizeBytes: input.fileSizeBytes,
    });

    await AuditService.log({
      userId,
      action: 'B28_EVIDENCE_STORED',
      objectType: 'Evidence',
      objectId: evidence.id,
      newValue: {
        packageSide: evidence.packageSide,
        fileSizeBytes: evidence.fileSizeBytes,
        storageKey,
      },
    });

    return {
      ...evidence,
      signedUrl,
    };
  }

  public async getEvidenceItemById(id: string) {
    const evidence = this.repo.findEvidenceById(id);
    if (!evidence) {
      throw ApiError.notFound('28_NOT_FOUND', `Evidence item ${id} not found in locker`);
    }

    const signedUrl = await this.storage.getSignedUrl(evidence.storageKey);
    const linked = this.repo.getLinkedArtifacts(id);

    return {
      ...evidence,
      signedUrl,
      linkedDeclarations: linked.declarations,
      linkedCheckResults: linked.checkResults,
      linkedViolations: linked.violations,
    };
  }

  public async listEvidence(query: {
    inspectionId?: string;
    packageSide?: string;
    minQuality?: number;
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: 'ASC' | 'DESC';
  }) {
    return this.repo.findEvidenceList(query);
  }

  public async updateEvidence(
    id: string,
    updates: {
      packageSide?: 'FRONT' | 'BACK' | 'TOP' | 'BOTTOM' | 'LEFT' | 'RIGHT' | 'PDP' | 'OTHER';
      qualityScore?: number;
      notes?: string;
    },
    userId: string
  ): Promise<Evidence> {
    const existing = this.repo.findEvidenceById(id);
    if (!existing) {
      throw ApiError.notFound('28_NOT_FOUND', `Evidence item ${id} not found`);
    }

    const updated = this.repo.updateEvidence(id, updates);

    await AuditService.log({
      userId,
      action: 'B28_EVIDENCE_METADATA_UPDATED',
      objectType: 'Evidence',
      objectId: id,
      previousValue: { packageSide: existing.packageSide, qualityScore: existing.qualityScore },
      newValue: updates,
      reason: updates.notes,
    });

    return updated!;
  }
}
