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
