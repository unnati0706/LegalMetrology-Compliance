export type UserRole = 'ADMIN' | 'SUPERVISOR' | 'INSPECTOR' | 'MANUFACTURER';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organization?: string;
}

export type InspectionStatus = 
  | 'DRAFT' 
  | 'PENDING_ANALYSIS' 
  | 'IN_REVIEW' 
  | 'MANUAL_REVIEW_REQUIRED' 
  | 'COMPLETED' 
  | 'FLAGGED';

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
  status: 'DETECTED' | 'VERIFIED' | 'CORRECTED' | 'MISSING' | 'REJECTED';
  evidenceId?: string;
  packageSide?: string;
  boundingBox?: BoundingBox;
}

export type CheckResultStatus = 'PASS' | 'FLAG' | 'MANUAL_REVIEW';

export interface CheckResult {
  id: string;
  inspectionId: string;
  ruleCode: string;
  ruleTitle: string;
  legalReference: string;
  status: CheckResultStatus;
  confidence: number;
  explanation: string;
  evidenceId?: string;
  packageSide?: string;
  boundingBox?: BoundingBox;
  isOverridden?: boolean;
  overriddenBy?: string;
  overrideReason?: string;
}

export interface Violation {
  id: string;
  inspectionId: string;
  ruleCode: string;
  legalReference: string;
  violationType: string;
  severity: 'CRITICAL' | 'MAJOR' | 'MINOR';
  explanation: string;
  packageSide?: string;
  status: 'OPEN' | 'IN_REVIEW' | 'RESOLVED';
}

export interface EvidenceItem {
  id: string;
  inspectionId: string;
  packageSide: 'FRONT' | 'BACK' | 'TOP' | 'BOTTOM' | 'LEFT' | 'RIGHT' | 'PDP';
  imageUrl: string;
  qualityScore: number;
}

export interface InspectorNote {
  id: string;
  inspectionId: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  text: string;
  ruleTags: string[];
  evidenceId?: string;
  timestamp: string;
}

export interface Inspection {
  id: string;
  inspectorId: string;
  inspectorName: string;
  productName: string;
  category: string;
  brand?: string;
  manufacturerName: string;
  manufacturerId?: string;
  location?: string;
  status: InspectionStatus;
  overallDisposition?: 'COMPLIANT' | 'NON_COMPLIANT' | 'REQUIRES_REINSPECTION';
  ruleVersion: string;
  declarationsCount: number;
  violationsCount: number;
  manualReviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReportRecord {
  id: string;
  inspectionId: string;
  productName: string;
  version: string;
  format: 'PDF' | 'JSON' | 'CSV';
  fileUrl: string;
  fileSize: string;
  sha256Hash: string;
  generatedBy: string;
  generatedAt: string;
  status: 'READY' | 'GENERATING' | 'FAILED';
  summaryDisposition: string;
  includeEvidenceThumbnails?: boolean;
  legalNoticeHeader?: boolean;
  officerRemarks?: string;
}

export interface EvidenceLockerFile {
  id: string;
  inspectionId: string;
  fileName: string;
  packageSide: 'FRONT' | 'BACK' | 'TOP' | 'BOTTOM' | 'LEFT' | 'RIGHT' | 'PDP';
  imageUrl: string;
  qualityScore: number;
  resolution: string;
  fileSize: string;
  sha256Hash: string;
  capturedAt: string;
  tags: string[];
}

export interface KPISummary {
  totalInspections: number;
  compliantCount: number;
  flaggedCount: number;
  manualReviewCount: number;
  complianceRate: number;
  avgResolutionTimeHours: number;
  period: string;
}

export interface TrendDataPoint {
  date: string;
  total: number;
  compliant: number;
  flagged: number;
  manualReview: number;
}

export interface ViolationTrendData {
  period: string;
  mrpViolations: number;
  netQtyViolations: number;
  dateViolations: number;
  mfgViolations: number;
  consumerCareViolations: number;
}

export interface RuleDistributionData {
  ruleCode: string;
  ruleTitle: string;
  count: number;
  percentage: number;
  severity: 'CRITICAL' | 'MAJOR' | 'MINOR';
}

export interface ManufacturerPattern {
  id: string;
  name: string;
  category: string;
  totalInspections: number;
  violationCount: number;
  riskScore: number;
  repeatCount: number;
  topViolatedRules: string[];
  lastViolationDate: string;
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  escalationStatus?: 'MONITORING' | 'NOTICE_ISSUED' | 'SHOW_CAUSE_PENDING' | 'RE_INSPECTION_SCHEDULED';
}

export interface CategoryPattern {
  category: string;
  totalInspections: number;
  violationsCount: number;
  violationRate: number;
  topViolation: string;
}

// F31: Geographic Risk Visualization
export interface GeoRiskLocation {
  id: string;
  name: string;
  state: string;
  district: string;
  lat: number;
  lng: number;
  totalInspections: number;
  violationsCount: number;
  complianceRate: number;
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  riskScore: number;
  recentFlaggedBrand?: string;
}

// F32: Cases, Follow-Ups & Assignment Workflow
export type FollowUpStatus = 
  | 'NOTICE_PENDING' 
  | 'HEARING_SCHEDULED' 
  | 'RE_INSPECTION_ASSIGNED' 
  | 'RESOLVED_COMPLIANT' 
  | 'ESCALATED_PROSECUTION';

export interface EnforcementCase {
  id: string;
  caseNumber: string;
  inspectionId: string;
  title: string;
  manufacturerName: string;
  category: string;
  status: FollowUpStatus;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  assignedInspectorId: string;
  assignedInspectorName: string;
  deadline: string;
  statutorySection: string;
  noticesIssuedCount: number;
  notesCount: number;
  latestNote?: string;
  createdAt: string;
  updatedAt: string;
}

// F33: Risk Dashboard & Inspect-Next Queue
export interface RiskFactor {
  factor: string;
  impactScore: number;
  direction: 'INCREASE' | 'DECREASE';
  description: string;
}

export interface InspectNextItem {
  id: string;
  productName: string;
  manufacturerName: string;
  category: string;
  location: string;
  riskScore: number; // 0 - 100
  riskBand: 'HIGH' | 'MEDIUM' | 'LOW';
  confidence: number;
  dataSufficiency: 'SUFFICIENT' | 'MODERATE' | 'SPARSE';
  historicalAuditsCount: number;
  riskFactors: RiskFactor[];
  suggestedAction: string;
  priorityRank: number;
}

// F34 & F35: Manufacturer Portal & Product Library
export interface ManufacturerKPIs {
  totalProducts: number;
  compliantProducts: number;
  flaggedProducts: number;
  overallComplianceRate: number;
  pendingRemediations: number;
  activeArtworks: number;
  lastSelfScanDate: string;
}

export interface ArtworkVersion {
  id: string;
  productId: string;
  version: string;
  status: 'APPROVED_FOR_PRINT' | 'NEEDS_REMEDIATION' | 'DRAFT' | 'REJECTED';
  imageUrl: string;
  packageSide: 'FRONT' | 'BACK' | 'PDP' | 'TOP' | 'ALL_SIDES';
  dimensions: string;
  dpi: number;
  changeSummary: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface ManufacturerProduct {
  id: string;
  sku: string;
  name: string;
  brand: string;
  category: string;
  netQuantity: string;
  mrp: string;
  packagingType: string;
  currentArtworkVersion: string;
  complianceStatus: 'COMPLIANT' | 'FLAGGED' | 'PENDING_SCAN';
  artworks: ArtworkVersion[];
  lastScanScore?: number;
  createdAt: string;
  updatedAt: string;
}

// F36: Pre-Compliance Scan & Remediation Checklist
export interface RemediationItem {
  id: string;
  ruleCode?: string;
  title?: string;
  field?: string;
  severity: 'CRITICAL' | 'MAJOR' | 'MINOR';
  status: 'FAIL' | 'PASS' | 'WARNING';
  currentText?: string;
  currentValue?: string;
  requiredText?: string;
  guidance?: string;
  suggestedFix?: string;
  legalRef: string;
  isResolved?: boolean;
}


// F37: Before/After Comparison & Rescan
export interface ArtworkDiffChange {
  field: string;
  before: string;
  after: string;
  status: 'RESOLVED' | 'UNRESOLVED' | 'NEW';
  legalRule: string;
}

export interface ArtworkDiffResult {
  productId: string;
  oldVersion: string;
  newVersion: string;
  oldScore: number;
  newScore: number;
  resolvedIssuesCount: number;
  remainingIssuesCount: number;
  changes: ArtworkDiffChange[];
  rescanDate: string;
}

// F38: Offline Inspection Queue & Sync Status
export interface OfflineQueueItem {
  id: string;
  inspectionId: string;
  productName: string;
  manufacturerName: string;
  packageSidesCaptured: string[];
  evidenceCount: number;
  localSize: string;
  capturedAt: string;
  syncStatus: 'PENDING_SYNC' | 'SYNCING' | 'SYNCED' | 'CONFLICT';
  hasConflict?: boolean;
  conflictDetails?: {
    serverVersionDate: string;
    serverInspector: string;
    fieldDifferences: string[];
  };
}

// F39: Explainable Evidence Mode & Inspection Timeline
export interface WalkthroughStep {
  stepNumber: number;
  title: string;
  subtitle: string;
  evidenceUrl: string;
  boundingBox?: BoundingBox;
  extractedText: string;
  ruleCode: string;
  verdict: 'PASS' | 'VIOLATION' | 'MANUAL_REVIEW';
  explanation: string;
  legalClause: string;
}

export interface TimelineEvent {
  id: string;
  inspectionId: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  eventType: 'CAPTURE' | 'OCR_EXTRACT' | 'RULE_EVALUATE' | 'OVERRIDE' | 'NOTICE_ISSUED' | 'SEALED';
  title: string;
  description: string;
  sha256Hash: string;
}

// F40: Smart Report & Scan Quality Coach
export interface SmartReportNarrative {
  inspectionId: string;
  productName: string;
  executiveSummary: string;
  compoundingPenaltyEstimate: string;
  keyFindings: string[];
  recommendedDirectives: string[];
  legalRiskAssessment: string;
  generatedAt: string;
}

export interface ScanQualityMetrics {
  overallQuality: number; // 0 - 100
  glareScore: number; // 0 - 100
  lightingScore: number; // 0 - 100
  skewAngle: number; // in degrees
  focusScore: number; // 0 - 100
  isCourtroomReady: boolean;
  coachingTips: string[];
}

// F13: Rule Applicability & Category-Aware Rule Display
export interface ApplicableRule {
  id: string;
  ruleCode: string;
  title: string;
  category: string;
  legalReference: string;
  description: string;
  isMandatory: boolean;
  version: string;
  effectiveDate: string;
  penalClause?: string;
  applicableCommodities?: string[];
}

