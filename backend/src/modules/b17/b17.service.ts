import { B17Repository } from './b17.repository';
import { DeclarationEntity } from '../b16/b16.repository';
import { NotFoundError, ValidationError } from '../../shared/errors';
import { recordAuditLog } from '../../shared/audit';

export class B17Service {
  private repo = new B17Repository();

  async getDeclarations(inspectionId?: string, limit = 10, offset = 0) {
    return this.repo.findAll({ inspectionId, limit, offset });
  }

  async getDeclarationById(id: string): Promise<DeclarationEntity> {
    const decl = await this.repo.findById(id);
    if (!decl) {
      throw new NotFoundError('17', 'Declaration');
    }
    return decl;
  }

  async normalizeDeclaration(id: string, userId?: string): Promise<DeclarationEntity> {
    const decl = await this.getDeclarationById(id);
    const raw = decl.rawExtractedFields || {};

    const normalized: any = {};

    // Normalize MRP
    if (raw.mrpRaw) {
      const match = raw.mrpRaw.match(/(?:rs\.?|₹|inr)\s*([\d,]+(?:\.\d+)?)/i);
      if (match) {
        normalized.mrp = {
          value: parseFloat(match[1].replace(',', '')),
          currency: 'INR',
          includesTaxes: /incl/i.test(raw.mrpRaw),
        };
      }
    }

    // Normalize Net Quantity
    if (raw.netQuantityRaw) {
      const match = raw.netQuantityRaw.match(/([\d\.]+)\s*(g|kg|ml|l|l&w|unit|pcs)/i);
      if (match) {
        const val = parseFloat(match[1]);
        const unit = match[2].toLowerCase();
        let baseQuantity = val;
        let baseUnit = unit;

        if (unit === 'g') {
          baseQuantity = val / 1000;
          baseUnit = 'kg';
        } else if (unit === 'ml') {
          baseQuantity = val / 1000;
          baseUnit = 'l';
        }

        normalized.netQuantity = {
          quantity: val,
          unit,
          baseQuantity,
          baseUnit,
        };
      }
    }

    // Normalize Mfg Date
    if (raw.mfgDateRaw) {
      const match = raw.mfgDateRaw.match(/(\d{2})[\/\-](\d{4})/);
      if (match) {
        normalized.mfgDate = {
          month: parseInt(match[1], 10),
          year: parseInt(match[2], 10),
          formatted: `${match[2]}-${match[1]}-01`,
        };
      }
    }

    const updated = await this.repo.updateNormalizedFields(id, normalized);
    if (!updated) {
      throw new NotFoundError('17', 'Declaration');
    }

    recordAuditLog({
      userId,
      action: 'NORMALIZE_DECLARATION_FIELDS',
      entityType: 'Declaration',
      entityId: id,
      newValue: updated.normalizedFields,
    });

    return updated;
  }

  async updateNormalizedFields(id: string, customNormalizedFields: any, userId?: string): Promise<DeclarationEntity> {
    const previous = await this.getDeclarationById(id);
    const updated = await this.repo.updateNormalizedFields(id, customNormalizedFields);
    if (!updated) {
      throw new NotFoundError('17', 'Declaration');
    }

    recordAuditLog({
      userId,
      action: 'UPDATE_NORMALIZED_FIELDS',
      entityType: 'Declaration',
      entityId: id,
      previousValue: previous.normalizedFields,
      newValue: updated.normalizedFields,
    });

    return updated;
  }
}
