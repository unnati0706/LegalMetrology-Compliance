import { B15Repository, VisionDetectionEntity } from './b15.repository';
import { MockVisionAdapter, IVisionAdapter, BoundingBox } from './vision.adapter';
import { NotFoundError, ValidationError, AppError } from '../../shared/errors';
import { recordAuditLog } from '../../shared/audit';

export class VisionProcessingFailedError extends AppError {
  constructor(message: string = 'Upstream computer vision processing failed') {
    super(400, 'VISION_PROCESSING_FAILED', message);
  }
}

export class B15Service {
  private repo = new B15Repository();
  private visionAdapter: IVisionAdapter = new MockVisionAdapter();

  async getDetections(evidenceId?: string, regionType?: string, limit = 10, offset = 0) {
    return this.repo.findAll({ evidenceId, regionType, limit, offset });
  }

  async getDetectionById(id: string): Promise<VisionDetectionEntity> {
    const detection = await this.repo.findById(id);
    if (!detection) {
      throw new NotFoundError('15', 'Vision Detection Region');
    }
    return detection;
  }

  async processVision(payload: { evidenceId: string; imageSource?: string; simulateFailure?: boolean }, userId?: string): Promise<VisionDetectionEntity[]> {
    if (!payload.evidenceId) {
      throw new ValidationError('evidenceId is required');
    }

    try {
      const regions = await this.visionAdapter.detectRegions(payload.imageSource || payload.evidenceId, payload.simulateFailure);
      const createdItems: VisionDetectionEntity[] = [];

      for (const r of regions) {
        const item = await this.repo.create({
          evidenceId: payload.evidenceId,
          regionType: r.regionType,
          boundingBox: r.boundingBox,
          confidence: r.confidence,
        });
        createdItems.push(item);
      }

      recordAuditLog({
        userId,
        action: 'RUN_VISION_DETECTION',
        entityType: 'VisionDetection',
        entityId: payload.evidenceId,
        newValue: { detectedRegionsCount: createdItems.length },
      });

      return createdItems;
    } catch (err: any) {
      throw new VisionProcessingFailedError(`Vision processing failed: ${err.message}`);
    }
  }

  async updateBoundingBox(id: string, boundingBox: BoundingBox, userId?: string): Promise<VisionDetectionEntity> {
    if (!boundingBox || boundingBox.x === undefined || boundingBox.y === undefined) {
      throw new ValidationError('Valid boundingBox object with x, y, width, height is required');
    }

    const previous = await this.getDetectionById(id);
    const updated = await this.repo.updateBoundingBox(id, boundingBox);
    if (!updated) {
      throw new NotFoundError('15', 'Vision Detection Region');
    }

    recordAuditLog({
      userId,
      action: 'ADJUST_VISION_BOUNDING_BOX',
      entityType: 'VisionDetection',
      entityId: id,
      previousValue: previous,
      newValue: updated,
    });

    return updated;
  }
}
