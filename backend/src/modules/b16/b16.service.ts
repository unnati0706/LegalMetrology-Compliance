import { B16Repository, DeclarationEntity, RawExtractedFields } from './b16.repository';
import { NotFoundError, ValidationError } from '../../shared/errors';
import { recordAuditLog } from '../../shared/audit';

export class B16Service {
  private repo = new B16Repository();

  async getDeclarations(inspectionId?: string, limit = 10, offset = 0) {
    return this.repo.findAll({ inspectionId, limit, offset });
  }

  async getDeclarationById(id: string): Promise<DeclarationEntity> {
    const decl = await this.repo.findById(id);
    if (!decl) {
      throw new NotFoundError('16', 'Declaration');
    }
    return decl;
  }

  async extractFieldsFromOcr(payload: { inspectionId: string; evidenceId?: string; ocrText?: string }, userId?: string): Promise<DeclarationEntity> {
    if (!payload.inspectionId) {
      throw new ValidationError('inspectionId is required');
    }

    const text = payload.ocrText || 'MRP Rs. 14.00 (Incl. of all taxes)\nNET QUANTITY: 70g\nMFG DATE: 01/2026';
    const lines = text.split('\n');

    const rawFields: RawExtractedFields = {};
    for (const line of lines) {
      if (/mrp|rs|₹/i.test(line)) rawFields.mrpRaw = line.trim();
      else if (/net|qty|quantity/i.test(line)) rawFields.netQuantityRaw = line.trim();
      else if (/mfg|date|pkd|packed/i.test(line)) rawFields.mfgDateRaw = line.trim();
      else if (/mfd|manufactured|mktd|marketed/i.test(line)) rawFields.manufacturerNameRaw = line.trim();
      else if (/care|customercare|email|wecare/i.test(line)) rawFields.consumerCareRaw = line.trim();
    }

    const confidences: Record<string, number> = {
      mrp: rawFields.mrpRaw ? 0.94 : 0.0,
      netQuantity: rawFields.netQuantityRaw ? 0.96 : 0.0,
      mfgDate: rawFields.mfgDateRaw ? 0.89 : 0.0,
    };

    const created = await this.repo.create({
      inspectionId: payload.inspectionId,
      evidenceId: payload.evidenceId,
      rawExtractedFields: rawFields,
      fieldConfidences: confidences,
      overallConfidence: 0.93,
    });

    recordAuditLog({
      userId,
      action: 'EXTRACT_DECLARATION_FIELDS',
      entityType: 'Declaration',
      entityId: created.id,
      newValue: created,
    });

    return created;
  }

  async updateRawFields(id: string, rawFields: Partial<RawExtractedFields>, userId?: string): Promise<DeclarationEntity> {
    const previous = await this.getDeclarationById(id);
    const updated = await this.repo.updateRawFields(id, rawFields);
    if (!updated) {
      throw new NotFoundError('16', 'Declaration');
    }

    recordAuditLog({
      userId,
      action: 'UPDATE_RAW_DECLARATION_FIELDS',
      entityType: 'Declaration',
      entityId: id,
      previousValue: previous,
      newValue: updated,
    });

    return updated;
  }
}
