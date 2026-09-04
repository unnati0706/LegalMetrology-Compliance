import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { B40Repository } from './b40.repository.js';
import { 
  CompileDossierInput, 
  TransmitDossierInput, 
  QueryDossiersInput 
} from './b40.schemas.js';
import { CaseDossier } from '../../shared/types/index.js';
import { AuthUser } from '../../shared/auth/index.js';
import { ApiError } from '../../shared/errors/index.js';
import { auditLogService } from '../../shared/audit/index.js';

export class B40Service {
  constructor(private repo: B40Repository = new B40Repository()) {}

  public async listDossiers(query: QueryDossiersInput) {
    return this.repo.getDossiers(query);
  }

  public async getDossierById(id: string): Promise<CaseDossier> {
    const dossier = await this.repo.findDossierById(id);
    if (!dossier) {
      throw ApiError.notFound('40_NOT_FOUND', `Case dossier with ID '${id}' not found`);
    }
    return dossier;
  }

  public async compileDossier(
    input: CompileDossierInput,
    user: AuthUser,
    ipAddress?: string
  ): Promise<CaseDossier> {
    const violations = await this.repo.getInspectionViolations(input.inspectionId);
    const evidence = await this.repo.getInspectionEvidence(input.inspectionId);

    const criticalViolations = violations.filter(v => v.severity === 'CRITICAL').length;

    const summaryOfEvidence = {
      totalViolations: violations.length,
      criticalViolations,
      evidenceCount: evidence.length,
      noticeIds: input.noticeIds || [],
      penaltyId: input.penaltyId,
    };

    const year = new Date().getFullYear();
    const randSuffix = Math.floor(1000 + Math.random() * 9000);
    const dossierNumber = `LM/DOS/${year}/${input.targetAgency}-${randSuffix}`;

    const checksumPayload = JSON.stringify({
      dossierNumber,
      inspectionId: input.inspectionId,
      targetAgency: input.targetAgency,
      manufacturerId: input.manufacturerId,
      statutoryOffenses: input.statutoryOffenses,
      summaryOfEvidence,
      compiledAt: new Date().toISOString(),
    });

    const payloadChecksum = crypto.createHash('sha256').update(checksumPayload).digest('hex');

    const dossier: CaseDossier = {
      id: uuidv4(),
      dossierNumber,
      inspectionId: input.inspectionId,
      targetAgency: input.targetAgency,
      caseTitle: input.caseTitle,
      manufacturerId: input.manufacturerId,
      manufacturerName: input.manufacturerName,
      statutoryOffenses: input.statutoryOffenses,
      summaryOfEvidence,
      payloadChecksum,
      status: 'GENERATED',
      compiledBy: user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const saved = await this.repo.saveDossier(dossier);

    await auditLogService.log({
      userId: user.id,
      action: 'COMPILE_CASE_DOSSIER',
      objectType: 'CASE_DOSSIER',
      objectId: saved.id,
      newValue: saved,
      ipAddress,
    });

    return saved;
  }

  public async transmitDossier(
    id: string,
    input: TransmitDossierInput,
    user: AuthUser,
    ipAddress?: string
  ): Promise<CaseDossier> {
    const dossier = await this.getDossierById(id);
    const prev = { ...dossier };

    dossier.status = 'TRANSMITTED';
    dossier.transmissionTimestamp = new Date();
    dossier.externalAcknowledgmentRef = input.externalAcknowledgmentRef || `ACK-${dossier.targetAgency}-${Date.now()}`;
    dossier.updatedAt = new Date();

    const updated = await this.repo.updateDossier(dossier);

    await auditLogService.log({
      userId: user.id,
      action: 'TRANSMIT_CASE_DOSSIER',
      objectType: 'CASE_DOSSIER',
      objectId: id,
      previousValue: prev,
      newValue: updated,
      reason: input.notes,
      ipAddress,
    });

    return updated;
  }
}
