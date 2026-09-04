import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { B39Repository } from './b39.repository.js';
import { 
  CreateSelfCertificationInput, 
  UpdateCertificationStatusInput, 
  QueryCertificationsInput 
} from './b39.schemas.js';
import { SelfCertification, CertificationStatus } from '../../shared/types/index.js';
import { AuthUser } from '../../shared/auth/index.js';
import { ApiError } from '../../shared/errors/index.js';
import { auditLogService } from '../../shared/audit/index.js';

export class B39Service {
  constructor(private repo: B39Repository = new B39Repository()) {}

  public async listCertifications(query: QueryCertificationsInput) {
    return this.repo.getCertifications(query);
  }

  public async getCertificationById(id: string): Promise<SelfCertification> {
    const cert = await this.repo.findCertificationById(id);
    if (!cert) {
      throw ApiError.notFound('39_NOT_FOUND', `Self-certification certificate with ID '${id}' not found`);
    }
    return cert;
  }

  public async createSelfCertification(
    input: CreateSelfCertificationInput,
    user: AuthUser,
    ipAddress?: string
  ): Promise<SelfCertification> {
    const passedChecks: string[] = [];
    const flaggedDefects: string[] = [];
    const decs = input.declarationsDeclared;

    const requiredKeys = [
      { key: 'mrp', ruleCode: 'PCR-2011-R06-MRP-USP', name: 'MRP & Unit Sale Price' },
      { key: 'netQuantity', ruleCode: 'PCR-2011-R06-NET-QTY', name: 'Net Quantity Declaration' },
      { key: 'manufacturer', ruleCode: 'PCR-2011-R06-MFG-NAME', name: 'Manufacturer / Packer Details' },
      { key: 'consumerCare', ruleCode: 'PCR-2011-R06-CONSUMER-CARE', name: 'Consumer Care Contact' },
      { key: 'dateOfMfg', ruleCode: 'PCR-2011-R06-DATE-FORMAT', name: 'Month & Year of Manufacture' },
    ];

    for (const req of requiredKeys) {
      if (decs[req.key] && decs[req.key].trim().length > 0) {
        passedChecks.push(req.ruleCode);
      } else {
        flaggedDefects.push(`Missing mandatory declaration: ${req.name} (${req.ruleCode})`);
      }
    }

    const totalRequired = requiredKeys.length;
    const passedCount = passedChecks.length;
    const complianceScore = parseFloat(((passedCount / totalRequired) * 100).toFixed(2));
    const status: CertificationStatus = complianceScore >= 100.0 ? 'VERIFIED_COMPLIANT' : 'NON_COMPLIANT_FLAGGED';

    const certId = uuidv4();
    const year = new Date().getFullYear();
    const randSuffix = Math.floor(1000 + Math.random() * 9000);
    const certificateNumber = `LM/SMC/${year}/CERT-${randSuffix}`;

    const validFrom = new Date();
    const validUntil = new Date(Date.now() + (input.validityDays || 365) * 24 * 60 * 60 * 1000);

    const sealPayload = JSON.stringify({
      certificateNumber,
      sku: input.sku,
      manufacturerId: input.manufacturerId,
      score: complianceScore,
      validUntil: validUntil.toISOString(),
    });
    const digitalSealHash = crypto.createHash('sha256').update(sealPayload).digest('hex');

    const cert: SelfCertification = {
      id: certId,
      certificateNumber,
      manufacturerId: input.manufacturerId,
      manufacturerName: input.manufacturerName,
      productName: input.productName,
      category: input.category,
      sku: input.sku,
      artworkImageUrl: input.artworkImageUrl,
      declarationsDeclared: input.declarationsDeclared,
      complianceScore,
      passedChecks,
      flaggedDefects,
      status,
      validFrom,
      validUntil,
      digitalSealHash,
      certifiedBy: user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const saved = await this.repo.saveCertification(cert);

    await auditLogService.log({
      userId: user.id,
      action: 'ISSUE_SELF_CERTIFICATION',
      objectType: 'SELF_CERTIFICATION',
      objectId: saved.id,
      newValue: saved,
      ipAddress,
    });

    return saved;
  }

  public async updateCertificationStatus(
    id: string,
    input: UpdateCertificationStatusInput,
    user: AuthUser,
    ipAddress?: string
  ): Promise<SelfCertification> {
    const cert = await this.getCertificationById(id);
    const prev = { ...cert };

    cert.status = input.status;
    cert.updatedAt = new Date();

    const updated = await this.repo.updateCertification(cert);

    await auditLogService.log({
      userId: user.id,
      action: 'UPDATE_CERTIFICATION_STATUS',
      objectType: 'SELF_CERTIFICATION',
      objectId: id,
      previousValue: prev,
      newValue: updated,
      reason: input.reason,
      ipAddress,
    });

    return updated;
  }
}
