import { B11Repository, ImageMetadataEntity, PackageSide } from './b11.repository';
import { NotFoundError, ValidationError } from '../../shared/errors';
import { recordAuditLog } from '../../shared/audit';

const VALID_SIDES: PackageSide[] = ['front', 'back', 'side_left', 'side_right', 'top', 'bottom'];

export class B11Service {
  private repo = new B11Repository();

  async getMetadataList(inspectionId?: string, evidenceId?: string, limit = 10, offset = 0) {
    return this.repo.findAll({ inspectionId, evidenceId, limit, offset });
  }

  async getMetadataById(id: string): Promise<ImageMetadataEntity> {
    const metadata = await this.repo.findById(id);
    if (!metadata) {
      throw new NotFoundError('11', 'Image Metadata');
    }
    return metadata;
  }

  async createMetadata(payload: { evidenceId: string; inspectionId: string; packageSide?: PackageSide; widthPixels: number; heightPixels: number; checksum: string }, userId?: string): Promise<ImageMetadataEntity> {
    if (!payload.evidenceId || !payload.inspectionId || !payload.widthPixels || !payload.heightPixels || !payload.checksum) {
      throw new ValidationError('evidenceId, inspectionId, widthPixels, heightPixels, and checksum are required');
    }

    if (payload.packageSide && !VALID_SIDES.includes(payload.packageSide)) {
      throw new ValidationError(`Invalid packageSide '${payload.packageSide}'. Allowed values: ${VALID_SIDES.join(', ')}`);
    }

    const created = await this.repo.create(payload);
    recordAuditLog({
      userId,
      action: 'CREATE_IMAGE_METADATA',
      entityType: 'ImageMetadata',
      entityId: created.id,
      newValue: created,
    });
    return created;
  }

  async updateMetadata(id: string, updates: { packageSide?: PackageSide; widthPixels?: number; heightPixels?: number }, userId?: string): Promise<ImageMetadataEntity> {
    const previous = await this.getMetadataById(id);

    if (updates.packageSide && !VALID_SIDES.includes(updates.packageSide)) {
      throw new ValidationError(`Invalid packageSide '${updates.packageSide}'. Allowed values: ${VALID_SIDES.join(', ')}`);
    }

    const updated = await this.repo.update(id, updates);
    if (!updated) {
      throw new NotFoundError('11', 'Image Metadata');
    }

    recordAuditLog({
      userId,
      action: 'UPDATE_IMAGE_METADATA',
      entityType: 'ImageMetadata',
      entityId: id,
      previousValue: previous,
      newValue: updated,
    });

    return updated;
  }
}
