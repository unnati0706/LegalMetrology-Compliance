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
