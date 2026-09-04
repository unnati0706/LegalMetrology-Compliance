import { B13Repository, ImageQualityResultEntity } from './b13.repository';
import { NotFoundError, ValidationError } from '../../shared/errors';
import { recordAuditLog } from '../../shared/audit';

export class B13Service {
  private repo = new B13Repository();

  async getQualityResults(evidenceId?: string, limit = 10, offset = 0) {
    return this.repo.findAll({ evidenceId, limit, offset });
  }

  async getQualityById(id: string): Promise<ImageQualityResultEntity> {
    const result = await this.repo.findById(id);
    if (!result) {
      throw new NotFoundError('13', 'Image Quality Analysis Result');
    }
    return result;
  }

  async analyzeQuality(payload: { evidenceId: string; blurScore?: number; glareScore?: number; cropScore?: number }, userId?: string): Promise<ImageQualityResultEntity> {
    if (!payload.evidenceId) {
      throw new ValidationError('evidenceId is required');
    }

    const blurScore = payload.blurScore !== undefined ? payload.blurScore : Math.floor(Math.random() * 20);
    const glareScore = payload.glareScore !== undefined ? payload.glareScore : Math.floor(Math.random() * 15);
    const cropScore = payload.cropScore !== undefined ? payload.cropScore : Math.floor(Math.random() * 10);

    const penalty = (blurScore + glareScore + cropScore) / 300;
    const overallQuality = parseFloat(Math.max(0.0, 1.0 - penalty).toFixed(2));

    const flags: string[] = [];
    if (blurScore > 40) flags.push('BLUR_DETECTED');
    if (glareScore > 35) flags.push('GLARE_DETECTED');
    if (cropScore > 30) flags.push('CROPPED_LABEL');

    const isAcceptable = overallQuality >= 0.40;

    const created = await this.repo.create({
      evidenceId: payload.evidenceId,
      blurScore,
      glareScore,
      cropScore,
      overallQuality,
      isAcceptable,
      flags,
    });

    recordAuditLog({
      userId,
      action: 'ANALYZE_IMAGE_QUALITY',
      entityType: 'ImageQualityResult',
      entityId: created.id,
      newValue: created,
    });

    return created;
  }

  async updateQualityFlags(id: string, flags: string[], userId?: string): Promise<ImageQualityResultEntity> {
    const previous = await this.getQualityById(id);
    const updated = await this.repo.updateFlags(id, flags);
    if (!updated) {
      throw new NotFoundError('13', 'Image Quality Analysis Result');
    }

    recordAuditLog({
      userId,
      action: 'UPDATE_IMAGE_QUALITY_FLAGS',
      entityType: 'ImageQualityResult',
      entityId: id,
      previousValue: previous,
      newValue: updated,
    });

    return updated;
  }
}
