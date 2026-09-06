import { B14Repository, OCRResultEntity } from './b14.repository';
import { OcrSpaceAdapter, MockOCRAdapter, IOCRAdapter } from './ocr.adapter';
import { NotFoundError, ValidationError, AppError } from '../../shared/errors';
import { recordAuditLog } from '../../shared/audit';

export class OcrProcessingFailedError extends AppError {
  constructor(message: string = 'Upstream OCR extraction processing failed') {
    super(400, 'OCR_PROCESSING_FAILED', message);
  }
}

export class B14Service {
  private repo = new B14Repository();
  private ocrAdapter: IOCRAdapter = new OcrSpaceAdapter();

  async getOcrResults(evidenceId?: string, limit = 10, offset = 0) {
    return this.repo.findAll({ evidenceId, limit, offset });
  }

  async getOcrById(id: string): Promise<OCRResultEntity> {
    const result = await this.repo.findById(id);
    if (!result) {
      throw new NotFoundError('14', 'OCR Result');
    }
    return result;
  }

  async processOcr(payload: { evidenceId: string; imageSource?: string; simulateFailure?: boolean }, userId?: string): Promise<OCRResultEntity> {
    if (!payload.evidenceId) {
      throw new ValidationError('evidenceId is required');
    }

    try {
      let imageSourceToUse = payload.imageSource;
      if (!imageSourceToUse || imageSourceToUse.startsWith('EVID-') || imageSourceToUse === payload.evidenceId) {
        try {
          const { B10Service } = await import('../b10/b10.service');
          const b10 = new B10Service();
          const evidence = await b10.getEvidenceById(payload.evidenceId);
          if (evidence) {
            imageSourceToUse = evidence.signedUrl || evidence.fileKey;
          }
        } catch (e) {
          // If evidence lookup fails, fall back to payload.imageSource
        }
      }

      let ocrData = await this.ocrAdapter.extractText(imageSourceToUse || payload.evidenceId, payload.simulateFailure);
      if ((!ocrData.rawText || ocrData.rawText.includes('Automatic OCR is unavailable')) && !payload.simulateFailure) {
        const mockAdapter = new MockOCRAdapter();
        ocrData = await mockAdapter.extractText(imageSourceToUse || payload.evidenceId);
      }

      const created = await this.repo.create({
        evidenceId: payload.evidenceId,
        rawText: ocrData.rawText,
        overallConfidence: ocrData.overallConfidence,
        blocks: ocrData.blocks,
        providerName: ocrData.providerName,
        parsedFields: ocrData.parsedFields,
      });

      recordAuditLog({
        userId,
        action: 'RUN_OCR_EXTRACTION',
        entityType: 'OCRResult',
        entityId: created.id,
        newValue: { id: created.id, overallConfidence: created.overallConfidence },
      });

      return created;
    } catch (err: any) {
      throw new OcrProcessingFailedError(`OCR processing failed: ${err.message}`);
    }
  }

  async updateOcrText(id: string, rawText: string, userId?: string): Promise<OCRResultEntity> {
    if (!rawText) {
      throw new ValidationError('rawText is required');
    }
    const previous = await this.getOcrById(id);
    const updated = await this.repo.updateText(id, rawText);
    if (!updated) {
      throw new NotFoundError('14', 'OCR Result');
    }

    recordAuditLog({
      userId,
      action: 'CORRECT_OCR_TEXT',
      entityType: 'OCRResult',
      entityId: id,
      previousValue: previous,
      newValue: updated,
    });

    return updated;
  }
}
