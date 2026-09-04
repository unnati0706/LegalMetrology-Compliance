export type UserRole = 'ADMIN' | 'SUPERVISOR' | 'INSPECTOR' | 'MANUFACTURER';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organization?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export type InspectionStatus = 
  | 'DRAFT' 
  | 'PENDING_ANALYSIS' 
  | 'IN_REVIEW' 
  | 'MANUAL_REVIEW_REQUIRED' 
  | 'COMPLETED' 
  | 'FLAGGED';

export interface Inspection {
  id: string;
  inspectorId: string;
  productName: string;
  category: string;
  brand?: string;
  manufacturerId?: string;
  location?: string;
  status: InspectionStatus;
  ruleVersion: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export type DeclarationStatus = 'DETECTED' | 'VERIFIED' | 'CORRECTED' | 'MISSING' | 'REJECTED';

export interface BoundingBox {
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
  confidence?: number;
}

export interface Declaration {
  id: string;
  inspectionId: string;
  field: string;
  value: string;
  rawText?: string;
  confidence: number;
  status: DeclarationStatus;
  evidenceId?: string;
  boundingBox?: BoundingBox;
  correctedBy?: string;
  correctionReason?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export type RuleCategory = 
  | 'COMPLETENESS' 
  | 'MRP_QUANTITY' 
  | 'MANUFACTURER_ENTITY' 
  | 'DATE_DECLARATION' 
  | 'PLACEMENT_FONT' 
  | 'E_COMMERCE';

export type RuleSeverity = 'CRITICAL' | 'MAJOR' | 'MINOR';

export interface Rule {
  id: string;
  ruleCode: string;
  version: string;
  category: RuleCategory;
  title: string;
  legalReference: string;
  description: string;
  severity: RuleSeverity;
  isActive: boolean;
  validationConfig?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export type CheckResultStatus = 'PASS' | 'FLAG' | 'MANUAL_REVIEW';

export interface CheckResult {
  id: string;
  inspectionId: string;
  ruleId: string;
  ruleCode?: string;
  ruleVersion: string;
  status: CheckResultStatus;
  confidence: number;
  explanation: string;
  evidenceId?: string;
  declarationId?: string;
  boundingBox?: BoundingBox;
  evaluationDetails?: Record<string, any>;
  isOverridden?: boolean;
  overriddenBy?: string;
  overrideReason?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export type ViolationSeverity = 'CRITICAL' | 'MAJOR' | 'MINOR';

export type ViolationStatus = 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'OVERRIDDEN' | 'DISMISSED';

export interface Violation {
  id: string;
  inspectionId: string;
  checkResultId: string;
  ruleId: string;
  ruleCode: string;
  ruleVersion: string;
  legalReference: string;
  violationType: string;
  severity: ViolationSeverity;
  explanation: string;
  evidenceId?: string;
  packageSide?: string;
  boundingBox?: BoundingBox;
  status: ViolationStatus;
  resolutionNotes?: string;
  resolvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface Evidence {
  id: string;
  inspectionId: string;
  imageUrl: string;
  storageKey: string;
  packageSide: 'FRONT' | 'BACK' | 'TOP' | 'BOTTOM' | 'LEFT' | 'RIGHT' | 'PDP' | 'OTHER';
  qualityScore?: number;
  mimeType: string;
  fileSizeBytes: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export type ReportFormat = 'PDF' | 'JSON' | 'CSV';

export type ReportStatus = 'GENERATED' | 'AMENDED' | 'ARCHIVED';

export interface ReportContentSummary {
  inspectionId: string;
  productName: string;
  category: string;
  brand?: string;
  inspectorName: string;
  inspectionDate: string;
  ruleVersion: string;
  totalDeclarationsChecked: number;
  passedChecksCount: number;
  flaggedChecksCount: number;
  manualReviewsCount: number;
  violationsCount: number;
  criticalViolationsCount: number;
  overallDisposition: 'COMPLIANT' | 'NON_COMPLIANT' | 'REQUIRES_REINSPECTION';
  violations: Array<{
    ruleCode: string;
    legalReference: string;
    severity: ViolationSeverity;
    explanation: string;
    packageSide?: string;
  }>;
  evidenceSnapshots: Array<{
    evidenceId: string;
    packageSide: string;
    imageUrl: string;
  }>;
}

export interface Report {
  id: string;
  inspectionId: string;
  reportVersion: string; // e.g. "v1.0", "v1.1", "v2.0"
  format: ReportFormat;
  status: ReportStatus;
  downloadUrl: string;
  storageKey: string;
  fileSizeBytes: number;
  verificationChecksum: string;
  contentSummary: ReportContentSummary;
  generatedBy: string;
  previousReportId?: string; // pointer to previous version if amended
  amendmentReason?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  objectType: string;
  objectId: string;
  previousValue?: Record<string, any> | null;
  newValue?: Record<string, any> | null;
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    ruleVersion?: string;
    timestamp?: string;
    [key: string]: any;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// B31 Analytics Types
export interface AnalyticsKPIs {
  totalInspections: number;
  compliantCount: number;
  nonCompliantCount: number;
  overallComplianceRate: number; // percentage e.g. 85.5
  totalViolations: number;
  criticalViolations: number;
  majorViolations: number;
  minorViolations: number;
  averageProcessingTimeMs: number;
  topViolatedRules: Array<{
    ruleCode: string;
    ruleTitle: string;
    count: number;
    severity: ViolationSeverity;
  }>;
  categoryBreakdown: Array<{
    category: string;
    total: number;
    violations: number;
    complianceRate: number;
  }>;
}

export interface AnalyticsSnapshot {
  id: string;
  periodType: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'CUSTOM';
  periodKey: string; // e.g. "2026-09", "2026-W36"
  metricsSummary: AnalyticsKPIs;
  generatedBy: string;
  status: 'ACTIVE' | 'ARCHIVED';
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

// B32 Violation Pattern Types
export type PatternType = 
  | 'CHRONIC_NON_COMPLIANT' 
  | 'CATEGORY_WIDE_DEFECT' 
  | 'SEASONAL_SURGE' 
  | 'ISOLATED_INCIDENT';

export type PatternStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';

export interface ViolationPattern {
  id: string;
  patternCode: string;
  patternType: PatternType;
  entityId: string; // manufacturerId or category name
  entityType: 'MANUFACTURER' | 'CATEGORY' | 'PRODUCT';
  entityName: string;
  ruleCodes: string[];
  occurrenceCount: number;
  severity: ViolationSeverity;
  confidence: number;
  explanation: string;
  status: PatternStatus;
  firstSeenAt: Date;
  lastSeenAt: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

// B33 Geographic Analysis Types
export type GeoRiskTier = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface GeographicZoneMetric {
  id: string;
  state: string; // e.g., "Maharashtra", "Delhi", "Karnataka"
  district?: string; // e.g., "Pune", "Central Delhi", "Bengaluru Urban"
  pinCode?: string; // 6-digit Indian PIN e.g. "411001"
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  totalInspections: number;
  totalViolations: number;
  complianceRate: number;
  riskTier: GeoRiskTier;
  isHotspot: boolean;
  activeInspectorsCount: number;
  lastInspectedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

// B34 Risk Profile Types
export type RiskTier = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface FactorContribution {
  factor: string;
  weight: number;
  score: number;
  contribution: number;
  description: string;
}

export interface RiskProfile {
  id: string;
  entityId: string; // e.g. manufacturerId, productName, category
  entityType: 'MANUFACTURER' | 'PRODUCT' | 'CATEGORY';
  entityName: string;
  riskScore: number; // 0.00 to 100.00
  riskTier: RiskTier;
  factorBreakdown: FactorContribution[];
  explanation: string;
  confidence: number;
  historicalInspectionCount: number;
  historicalViolationCount: number;
  lastComputedAt: Date;
  isOverridden?: boolean;
  overriddenBy?: string;
  overrideReason?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

// B35 Inspect-Next Queue Types
export type InspectNextStatus = 'QUEUED' | 'ASSIGNED' | 'INSPECTED' | 'DEFERRED' | 'CANCELLED';

export interface InspectNextItem {
  id: string;
  entityId: string;
  entityType: 'MANUFACTURER' | 'PRODUCT' | 'FACILITY';
  targetName: string;
  category: string;
  region: string; // State / District
  pinCode?: string;
  priorityScore: number; // 0 to 100 (higher = inspect sooner)
  riskTier: RiskTier;
  riskProfileId?: string;
  recommendedChecklist: string[]; // specific rules to check
  status: InspectNextStatus;
  assignedInspectorId?: string;
  assignedInspectorName?: string;
  assignedAt?: Date;
  deferredReason?: string;
  estimatedEffortHours?: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

// B36 Legal Notice Types
export type LegalNoticeType = 
  | 'SHOW_CAUSE' 
  | 'SEIZURE_NOTICE' 
  | 'COMPOUNDING_OFFER' 
  | 'RECTIFICATION_NOTICE';

export type LegalNoticeStatus = 
  | 'DRAFT' 
  | 'ISSUED' 
  | 'SERVED' 
  | 'RESPONDED' 
  | 'EXPIRED' 
  | 'WITHDRAWN';

export interface LegalNotice {
  id: string;
  noticeNumber: string; // e.g., "LM/NZ/2026/SC-0042"
  noticeType: LegalNoticeType;
  inspectionId: string;
  manufacturerId: string;
  manufacturerName: string;
  issuingAuthority: string;
  statutoryReference: string; // e.g., "Section 39 of Legal Metrology Act, 2009 read with Rule 6"
  allegations: Array<{
    ruleCode: string;
    description: string;
    severity: ViolationSeverity;
  }>;
  responseDeadline: Date; // 15 or 30 days statutory window
  status: LegalNoticeStatus;
  issuedAt?: Date;
  servedAt?: Date;
  servedToEmail?: string;
  digitalSignatureHash?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

// B37 Manufacturer Appeals & Rectification Types
export type AppealStatus = 
  | 'SUBMITTED' 
  | 'UNDER_REVIEW' 
  | 'ACCEPTED' 
  | 'REJECTED' 
  | 'ADDITIONAL_INFO_REQUESTED' 
  | 'MITIGATED';

export type AppealDecision = 
  | 'ACCEPT' 
  | 'REJECT' 
  | 'REQUEST_MORE_INFO' 
  | 'MITIGATE';

export interface RectificationEvidence {
  evidenceType: 'REVISED_ARTWORK' | 'CORRECTION_STICKER_PROOF' | 'BATCH_RECALL_NOTICE' | 'LAB_REPORT';
  documentUrl: string;
  description: string;
  uploadedAt: Date;
}

export interface ManufacturerAppeal {
  id: string;
  appealNumber: string; // e.g. "LM/APL/2026/0019"
  noticeId: string;
  manufacturerId: string;
  appellantName: string;
  groundsForAppeal: string;
  correctiveActionPlan: string;
  rectificationEvidence: RectificationEvidence[];
  status: AppealStatus;
  reviewedBy?: string;
  reviewedAt?: Date;
  decision?: AppealDecision;
  decisionNotes?: string;
  penaltyMitigationPercent?: number; // 0 to 100
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

// B38 Compounding & Penalty Assessment Types
export type OffenseType = 'FIRST_OFFENSE' | 'SECOND_OFFENSE' | 'SUBSEQUENT_OFFENSE';

export type PenaltyStatus = 
  | 'ASSESSED' 
  | 'PAID' 
  | 'WAIVED' 
  | 'ESCALATED_TO_COURT' 
  | 'DISPUTED';

export interface PenaltyBreakdownItem {
  section: string; // e.g. "Section 36(1) - Non-standard package"
  baseAmount: number;
  offenseMultiplier: number; // 1.0 for first, 2.0+ for repeat
  finalAmount: number;
  description: string;
}

export interface PenaltyAssessment {
  id: string;
  assessmentNumber: string; // e.g. "LM/FIN/2026/PA-0881"
  inspectionId: string;
  noticeId?: string;
  manufacturerId: string;
  manufacturerName: string;
  offenseType: OffenseType;
  totalAmount: number;
  compoundingApplicable: boolean;
  compoundingFee: number;
  breakdown: PenaltyBreakdownItem[];
  status: PenaltyStatus;
  paymentReference?: string;
  paidAt?: Date;
  receiptNumber?: string;
  courtCaseReference?: string;
  assessedBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

// B39 Pre-Market Self-Certification Types
export type CertificationStatus = 
  | 'DRAFT' 
  | 'VERIFIED_COMPLIANT' 
  | 'NON_COMPLIANT_FLAGGED' 
  | 'EXPIRED' 
  | 'REVOKED';

export interface SelfCertification {
  id: string;
  certificateNumber: string; // e.g. "LM/SMC/2026/CERT-104"
  manufacturerId: string;
  manufacturerName: string;
  productName: string;
  category: string;
  sku: string;
  artworkImageUrl: string;
  declarationsDeclared: Record<string, string>;
  complianceScore: number; // 0 to 100
  passedChecks: string[];
  flaggedDefects: string[];
  status: CertificationStatus;
  validFrom: Date;
  validUntil: Date;
  digitalSealHash: string;
  certifiedBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

// B40 Multi-Agency Case Dossier & Interoperability Types
export type TargetAgency = 
  | 'FSSAI' 
  | 'CCPA' 
  | 'NCH_GRIEVANCE' 
  | 'DISTRICT_COURT' 
  | 'STATE_CONTROLLER';

export type DossierStatus = 
  | 'GENERATED' 
  | 'TRANSMITTED' 
  | 'ACKNOWLEDGED' 
  | 'ADMITTED_IN_COURT' 
  | 'ARCHIVED';

export interface CaseDossier {
  id: string;
  dossierNumber: string; // e.g. "LM/DOS/2026/FSSAI-0012"
  inspectionId: string;
  targetAgency: TargetAgency;
  caseTitle: string;
  manufacturerId: string;
  manufacturerName: string;
  statutoryOffenses: string[];
  summaryOfEvidence: {
    totalViolations: number;
    criticalViolations: number;
    evidenceCount: number;
    noticeIds: string[];
    penaltyId?: string;
  };
  payloadChecksum: string; // SHA-256 integrity hash of entire bundle
  status: DossierStatus;
  transmissionTimestamp?: Date;
  externalAcknowledgmentRef?: string;
  compiledBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}


