import { 
  Inspection, 
  CheckResult, 
  Declaration, 
  EvidenceItem, 
  InspectorNote, 
  Violation,
  ReportRecord,
  EvidenceLockerFile,
  KPISummary,
  TrendDataPoint,
  ViolationTrendData,
  RuleDistributionData,
  ManufacturerPattern,
  CategoryPattern
} from '../types/index.js';

// Initial Mock Seed Data for instant interactive fidelity and standalone testing
const mockInspections: Inspection[] = [
  {
    id: 'insp-sample-01',
    inspectorId: 'usr-inspector-01',
    inspectorName: 'Amit Patel',
    productName: 'Priya Foods Premium Chilli Powder 500g',
    category: 'Spices & Condiments',
    brand: 'Priya Foods',
    manufacturerName: 'Priya Foods Ltd',
    manufacturerId: 'mfg-priya-foods',
    location: 'Pune, Maharashtra',
    status: 'MANUAL_REVIEW_REQUIRED',
    ruleVersion: 'PCR-2011-v2.0',
    declarationsCount: 6,
    violationsCount: 1,
    manualReviewCount: 1,
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60000).toISOString(),
  },
  {
    id: 'insp-sample-02',
    inspectorId: 'usr-inspector-01',
    inspectorName: 'Amit Patel',
    productName: 'Royal Natural Mineral Water 1L',
    category: 'Packaged Drinking Water',
    brand: 'Royal Aqua',
    manufacturerName: 'Royal Beverages Bottling Plant',
    manufacturerId: 'mfg-royal-beverages',
    location: 'Central Delhi, Delhi',
    status: 'FLAGGED',
    overallDisposition: 'NON_COMPLIANT',
    ruleVersion: 'PCR-2011-v2.0',
    declarationsCount: 5,
    violationsCount: 2,
    manualReviewCount: 0,
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
  },
  {
    id: 'insp-sample-03',
    inspectorId: 'usr-inspector-01',
    inspectorName: 'Amit Patel',
    productName: 'Nature Fresh Sunflower Oil 1L',
    category: 'Edible Oils & Fats',
    brand: 'Nature Fresh',
    manufacturerName: 'Sunstar Agro Ltd',
    manufacturerId: 'mfg-sunstar',
    location: 'Bengaluru, Karnataka',
    status: 'COMPLETED',
    overallDisposition: 'COMPLIANT',
    ruleVersion: 'PCR-2011-v2.0',
    declarationsCount: 7,
    violationsCount: 0,
    manualReviewCount: 0,
    createdAt: new Date(Date.now() - 48 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 40 * 3600000).toISOString(),
  }
];

const mockDeclarations: Declaration[] = [
  {
    id: 'dec-01',
    inspectionId: 'insp-sample-01',
    field: 'mrp',
    value: '₹140.00 (Incl. of all taxes)',
    rawText: 'MRP Rs 140.00 (INCL OF ALL TAXES)',
    confidence: 0.96,
    status: 'DETECTED',
    packageSide: 'BACK',
    boundingBox: { ymin: 0.65, xmin: 0.15, ymax: 0.72, xmax: 0.55 },
  },
  {
    id: 'dec-02',
    inspectionId: 'insp-sample-01',
    field: 'net_quantity',
    value: '500 g',
    rawText: 'NET WT: 500g',
    confidence: 0.94,
    status: 'DETECTED',
    packageSide: 'PDP',
    boundingBox: { ymin: 0.78, xmin: 0.60, ymax: 0.85, xmax: 0.88 },
  },
  {
    id: 'dec-03',
    inspectionId: 'insp-sample-01',
    field: 'unit_sale_price',
    value: '₹0.28 / g',
    rawText: 'USP: Rs 0.28 per g',
    confidence: 0.62, // low confidence -> triggers manual review
    status: 'DETECTED',
    packageSide: 'BACK',
    boundingBox: { ymin: 0.73, xmin: 0.15, ymax: 0.79, xmax: 0.50 },
  },
  {
    id: 'dec-04',
    inspectionId: 'insp-sample-01',
    field: 'manufacturer_name_address',
    value: 'Priya Foods Ltd, Sector 4, Pune - 411028',
    rawText: 'Manufactured by Priya Foods Ltd, Pune PIN 411028',
    confidence: 0.98,
    status: 'DETECTED',
    packageSide: 'BACK',
    boundingBox: { ymin: 0.35, xmin: 0.10, ymax: 0.48, xmax: 0.90 },
  },
  {
    id: 'dec-05',
    inspectionId: 'insp-sample-01',
    field: 'date_of_mfg',
    value: '08/2026',
    rawText: 'MFD: 08/2026',
    confidence: 0.95,
    status: 'DETECTED',
    packageSide: 'TOP',
    boundingBox: { ymin: 0.20, xmin: 0.30, ymax: 0.32, xmax: 0.70 },
  },
  {
    id: 'dec-06',
    inspectionId: 'insp-sample-01',
    field: 'consumer_care',
    value: 'care@priyafoods.in, 1800-200-1122',
    rawText: 'Consumer Cell: care@priyafoods.in Tel 1800-200-1122',
    confidence: 0.91,
    status: 'DETECTED',
    packageSide: 'BACK',
    boundingBox: { ymin: 0.50, xmin: 0.10, ymax: 0.60, xmax: 0.90 },
  }
];

const mockCheckResults: CheckResult[] = [
  {
    id: 'chk-01',
    inspectionId: 'insp-sample-01',
    ruleCode: 'PCR-2011-R06-MRP',
    ruleTitle: 'MRP Declaration & Tax Inclusion',
    legalReference: 'Rule 6(1)(e) of Legal Metrology (Packaged Commodities) Rules, 2011',
    status: 'PASS',
    confidence: 0.96,
    explanation: 'MRP is prominently declared with INR symbol and mandatory tax inclusion phrase.',
    packageSide: 'BACK',
    boundingBox: { ymin: 0.65, xmin: 0.15, ymax: 0.72, xmax: 0.55 },
  },
  {
    id: 'chk-02',
    inspectionId: 'insp-sample-01',
    ruleCode: 'PCR-2011-R06-USP',
    ruleTitle: 'Unit Sale Price Verification',
    legalReference: 'Rule 6(1)(e) 2nd Proviso — Packages > 100g/ml',
    status: 'MANUAL_REVIEW',
    confidence: 0.62,
    explanation: 'Optical OCR extraction confidence for Unit Sale Price is 62% (below 75% threshold). Requires inspector confirmation.',
    packageSide: 'BACK',
    boundingBox: { ymin: 0.73, xmin: 0.15, ymax: 0.79, xmax: 0.50 },
  },
  {
    id: 'chk-03',
    inspectionId: 'insp-sample-01',
    ruleCode: 'PCR-2011-R06-NET-QTY',
    ruleTitle: 'Net Quantity Standard Units',
    legalReference: 'Rule 6(1)(h) read with Schedule II',
    status: 'PASS',
    confidence: 0.94,
    explanation: 'Net quantity declared in standard SI metric unit (g) with compliant numeral height.',
    packageSide: 'PDP',
    boundingBox: { ymin: 0.78, xmin: 0.60, ymax: 0.85, xmax: 0.88 },
  },
  {
    id: 'chk-04',
    inspectionId: 'insp-sample-01',
    ruleCode: 'PCR-2011-R07-FONT-SIZE',
    ruleTitle: 'Minimum Numeral Font Height on PDP',
    legalReference: 'Rule 7 & Table 1 — Minimum 4mm height for 500g package',
    status: 'FLAG',
    confidence: 0.89,
    explanation: 'Estimated numeral height on PDP is 2.8mm, which is below the statutory requirement of 4.0mm for packages between 200g and 1kg.',
    packageSide: 'PDP',
    boundingBox: { ymin: 0.78, xmin: 0.60, ymax: 0.85, xmax: 0.88 },
  }
];

const mockEvidence: EvidenceItem[] = [
  {
    id: 'ev-01',
    inspectionId: 'insp-sample-01',
    packageSide: 'FRONT',
    imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop&q=80',
    qualityScore: 94,
  },
  {
    id: 'ev-02',
    inspectionId: 'insp-sample-01',
    packageSide: 'BACK',
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80',
    qualityScore: 91,
  },
  {
    id: 'ev-03',
    inspectionId: 'insp-sample-01',
    packageSide: 'PDP',
    imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop&q=80',
    qualityScore: 96,
  },
  {
    id: 'ev-04',
    inspectionId: 'insp-sample-01',
    packageSide: 'TOP',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
    qualityScore: 88,
  }
];

const mockNotes: InspectorNote[] = [
  {
    id: 'note-01',
    inspectionId: 'insp-sample-01',
    authorId: 'usr-inspector-01',
    authorName: 'Amit Patel',
    authorRole: 'INSPECTOR',
    text: 'Physical sample acquired from retail premises in Pune Market. Back panel has minor ink smudging on Unit Sale Price.',
    ruleTags: ['PCR-2011-R06-USP', 'Rule 6(1)(e)'],
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  }
];

// In-memory runtime state for mutations
let inspectionsState = [...mockInspections];
let checkResultsState = [...mockCheckResults];
let notesState = [...mockNotes];

export const apiClient = {
  // Inspections (F25)
  getInspections: async (query?: { search?: string; status?: string; category?: string }) => {
    let list = [...inspectionsState];
    if (query?.search) {
      const q = query.search.toLowerCase();
      list = list.filter(i => 
        i.productName.toLowerCase().includes(q) || 
        i.brand?.toLowerCase().includes(q) ||
        i.manufacturerName.toLowerCase().includes(q)
      );
    }
    if (query?.status && query.status !== 'ALL') {
      list = list.filter(i => i.status === query.status);
    }
    if (query?.category && query.category !== 'ALL') {
      list = list.filter(i => i.category === query.category);
    }
    return { items: list, total: list.length };
  },

  getInspectionById: async (id: string) => {
    const item = inspectionsState.find(i => i.id === id);
    if (!item) throw new Error(`Inspection ${id} not found`);
    return item;
  },

  // Heatmap & Declarations (F21)
  getInspectionHeatmapData: async (inspectionId: string) => {
    const inspection = await apiClient.getInspectionById(inspectionId);
    const checks = checkResultsState.filter(c => c.inspectionId === inspectionId);
    const declarations = mockDeclarations.filter(d => d.inspectionId === inspectionId);
    const evidence = mockEvidence.filter(e => e.inspectionId === inspectionId);
    return { inspection, checks, declarations, evidence };
  },

  // Manual Review Queue (F22)
  getManualReviewItems: async (inspectionId?: string) => {
    let items = checkResultsState.filter(c => c.status === 'MANUAL_REVIEW');
    if (inspectionId) {
      items = items.filter(c => c.inspectionId === inspectionId);
    }
    return items;
  },

  submitManualReviewDecision: async (checkResultId: string, decision: 'CONFIRM_PASS' | 'CONFIRM_FLAG', reason: string) => {
    const item = checkResultsState.find(c => c.id === checkResultId);
    if (!item) throw new Error(`CheckResult ${checkResultId} not found`);

    item.status = decision === 'CONFIRM_PASS' ? 'PASS' : 'FLAG';
    item.isOverridden = true;
    item.overriddenBy = 'Inspector Amit Patel';
    item.overrideReason = reason;

    // Update parent inspection manual review count
    const insp = inspectionsState.find(i => i.id === item.inspectionId);
    if (insp) {
      const remaining = checkResultsState.filter(c => c.inspectionId === insp.id && c.status === 'MANUAL_REVIEW').length;
      insp.manualReviewCount = remaining;
      if (remaining === 0 && insp.status === 'MANUAL_REVIEW_REQUIRED') {
        insp.status = 'IN_REVIEW';
      }
    }

    return item;
  },

  // Inspector Notes (F23)
  getNotes: async (inspectionId: string) => {
    return notesState.filter(n => n.inspectionId === inspectionId);
  },

  addNote: async (inspectionId: string, text: string, ruleTags: string[] = []) => {
    const note: InspectorNote = {
      id: `note-${Date.now()}`,
      inspectionId,
      authorId: 'usr-inspector-01',
      authorName: 'Amit Patel',
      authorRole: 'INSPECTOR',
      text,
      ruleTags,
      timestamp: new Date().toISOString(),
    };
    notesState.unshift(note);
    return note;
  },

  // Inspection Finalization (F24)
  finalizeInspection: async (inspectionId: string, disposition: 'COMPLIANT' | 'NON_COMPLIANT' | 'REQUIRES_REINSPECTION', notes?: string) => {
    const insp = inspectionsState.find(i => i.id === inspectionId);
    if (!insp) throw new Error(`Inspection ${inspectionId} not found`);

    insp.status = disposition === 'COMPLIANT' ? 'COMPLETED' : 'FLAGGED';
    insp.overallDisposition = disposition;
    insp.updatedAt = new Date().toISOString();

    if (notes) {
      await apiClient.addNote(inspectionId, `Final Disposition: ${disposition}. Sign-off remarks: ${notes}`);
    }

    return insp;
  },

  // Report Generation & Export (F26)
  getReports: async (inspectionId?: string): Promise<ReportRecord[]> => {
    if (inspectionId) {
      return reportsState.filter(r => r.inspectionId === inspectionId);
    }
    return [...reportsState];
  },

  getReportById: async (reportId: string): Promise<ReportRecord> => {
    const report = reportsState.find(r => r.id === reportId);
    if (!report) throw new Error(`Report ${reportId} not found`);
    return report;
  },

  generateReport: async (params: {
    inspectionId: string;
    format: 'PDF' | 'JSON' | 'CSV';
    includeEvidenceThumbnails?: boolean;
    legalNoticeHeader?: boolean;
    officerRemarks?: string;
  }): Promise<ReportRecord> => {
    const insp = inspectionsState.find(i => i.id === params.inspectionId);
    if (!insp) throw new Error(`Inspection ${params.inspectionId} not found`);

    const versionNum = (reportsState.filter(r => r.inspectionId === params.inspectionId).length + 1).toFixed(1);
    const newReport: ReportRecord = {
      id: `rep-${Date.now().toString(36)}`,
      inspectionId: params.inspectionId,
      productName: insp.productName,
      version: `v${versionNum}`,
      format: params.format,
      fileUrl: `/reports/export-${insp.id}-${versionNum}.${params.format.toLowerCase()}`,
      fileSize: params.format === 'PDF' ? '1.42 MB' : params.format === 'JSON' ? '28 KB' : '14 KB',
      sha256Hash: `a7f4b89e90218e887019fba82c9${Math.floor(Math.random() * 89999 + 10000)}dce08b45173e210`,
      generatedBy: 'Inspector Amit Patel',
      generatedAt: new Date().toISOString(),
      status: 'READY',
      summaryDisposition: insp.overallDisposition || (insp.violationsCount > 0 ? 'NON_COMPLIANT' : 'COMPLIANT'),
      includeEvidenceThumbnails: params.includeEvidenceThumbnails ?? true,
      legalNoticeHeader: params.legalNoticeHeader ?? true,
      officerRemarks: params.officerRemarks || 'Statutory assessment completed in accordance with Legal Metrology Act, 2009 & PCR 2011.',
    };

    reportsState.unshift(newReport);
    return newReport;
  },

  // Evidence Locker & Report History (F27)
  getEvidenceLockerFiles: async (inspectionId?: string): Promise<EvidenceLockerFile[]> => {
    if (inspectionId) {
      return evidenceLockerState.filter(f => f.inspectionId === inspectionId);
    }
    return [...evidenceLockerState];
  },

  uploadEvidenceLockerFile: async (file: Partial<EvidenceLockerFile>): Promise<EvidenceLockerFile> => {
    const newFile: EvidenceLockerFile = {
      id: `ev-file-${Date.now()}`,
      inspectionId: file.inspectionId || 'insp-sample-01',
      fileName: file.fileName || 'evidence_capture.jpg',
      packageSide: file.packageSide || 'FRONT',
      imageUrl: file.imageUrl || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=60',
      qualityScore: file.qualityScore || 0.94,
      resolution: '3840x2160',
      fileSize: '3.4 MB',
      sha256Hash: `8c3b7a${Date.now().toString(16)}098fe`,
      capturedAt: new Date().toISOString(),
      tags: file.tags || ['PDP', 'Raw Capture', 'Validated'],
    };
    evidenceLockerState.unshift(newFile);
    return newFile;
  },

  // Supervisor / Enforcement Dashboard (F28)
  getKPISummary: async (): Promise<KPISummary> => {
    const total = inspectionsState.length + 42;
    const compliant = inspectionsState.filter(i => i.overallDisposition === 'COMPLIANT').length + 31;
    const flagged = inspectionsState.filter(i => i.status === 'FLAGGED' || i.violationsCount > 0).length + 8;
    const manualReview = inspectionsState.filter(i => i.manualReviewCount > 0).length + 3;

    return {
      totalInspections: total,
      compliantCount: compliant,
      flaggedCount: flagged,
      manualReviewCount: manualReview,
      complianceRate: Math.round((compliant / total) * 100),
      avgResolutionTimeHours: 1.8,
      period: 'Last 30 Days (National Enforcement Zone)',
    };
  },

  getTrendSparklineData: async (): Promise<TrendDataPoint[]> => {
    return [
      { date: 'Mon', total: 12, compliant: 10, flagged: 1, manualReview: 1 },
      { date: 'Tue', total: 15, compliant: 11, flagged: 3, manualReview: 1 },
      { date: 'Wed', total: 18, compliant: 14, flagged: 2, manualReview: 2 },
      { date: 'Thu', total: 14, compliant: 12, flagged: 1, manualReview: 1 },
      { date: 'Fri', total: 22, compliant: 17, flagged: 4, manualReview: 1 },
      { date: 'Sat', total: 9, compliant: 8, flagged: 1, manualReview: 0 },
      { date: 'Sun', total: 6, compliant: 5, flagged: 1, manualReview: 0 },
    ];
  },

  // Violation Analytics (F29)
  getViolationTrends: async (): Promise<ViolationTrendData[]> => {
    return [
      { period: 'Week 1', mrpViolations: 4, netQtyViolations: 2, dateViolations: 1, mfgViolations: 3, consumerCareViolations: 1 },
      { period: 'Week 2', mrpViolations: 6, netQtyViolations: 3, dateViolations: 2, mfgViolations: 2, consumerCareViolations: 1 },
      { period: 'Week 3', mrpViolations: 3, netQtyViolations: 1, dateViolations: 0, mfgViolations: 4, consumerCareViolations: 2 },
      { period: 'Week 4', mrpViolations: 8, netQtyViolations: 4, dateViolations: 3, mfgViolations: 5, consumerCareViolations: 2 },
    ];
  },

  getRuleDistributions: async (): Promise<RuleDistributionData[]> => {
    return [
      { ruleCode: 'PCR-2011-R06-USP', ruleTitle: 'Unit Sale Price Missing / Font Discrepancy', count: 24, percentage: 35, severity: 'MAJOR' },
      { ruleCode: 'PCR-2011-R06-MRP', ruleTitle: 'MRP Missing Inclusive of All Taxes', count: 18, percentage: 26, severity: 'CRITICAL' },
      { ruleCode: 'PCR-2011-R06-MFG', ruleTitle: 'Manufacturer Name & Complete Address Incomplete', count: 12, percentage: 17, severity: 'MAJOR' },
      { ruleCode: 'PCR-2011-R09-NET', ruleTitle: 'Net Quantity Font Area Under Minimum Specification', count: 9, percentage: 13, severity: 'MINOR' },
      { ruleCode: 'PCR-2011-R06-CARE', ruleTitle: 'Consumer Care Contact Details / Email Missing', count: 6, percentage: 9, severity: 'MINOR' },
    ];
  },

  // Manufacturer / Category Pattern Analytics (F30)
  getManufacturerPatterns: async (query?: string, riskFilter?: string): Promise<ManufacturerPattern[]> => {
    let list = [...mockManufacturerPatterns];
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(m => m.name.toLowerCase().includes(q) || m.category.toLowerCase().includes(q));
    }
    if (riskFilter && riskFilter !== 'ALL') {
      list = list.filter(m => m.riskLevel === riskFilter);
    }
    return list;
  },

  getCategoryPatterns: async (): Promise<CategoryPattern[]> => {
    return [
      { category: 'Spices & Condiments', totalInspections: 28, violationsCount: 9, violationRate: 32.1, topViolation: 'Unit Sale Price Incorrect' },
      { category: 'Packaged Drinking Water', totalInspections: 34, violationsCount: 14, violationRate: 41.2, topViolation: 'Missing Batch / Date Code' },
      { category: 'Edible Oils & Fats', totalInspections: 22, violationsCount: 4, violationRate: 18.2, topViolation: 'Net Weight Tolerance' },
      { category: 'Confectionery & Biscuits', totalInspections: 19, violationsCount: 3, violationRate: 15.8, topViolation: 'Consumer Care Address' },
      { category: 'Personal Care & Cosmetics', totalInspections: 15, violationsCount: 2, violationRate: 13.3, topViolation: 'Importer Address Missing' },
    ];
  },

  updateManufacturerEscalation: async (manufacturerId: string, status: ManufacturerPattern['escalationStatus']) => {
    const item = mockManufacturerPatterns.find(m => m.id === manufacturerId);
    if (!item) throw new Error(`Manufacturer ${manufacturerId} not found`);
    item.escalationStatus = status;
    return item;
  }
};

// Seed mock states for F26 - F30
const reportsState: ReportRecord[] = [
  {
    id: 'rep-001',
    inspectionId: 'insp-sample-01',
    productName: 'Priya Foods Premium Chilli Powder 500g',
    version: 'v1.0',
    format: 'PDF',
    fileUrl: '/reports/export-insp-sample-01-v1.0.pdf',
    fileSize: '1.42 MB',
    sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    generatedBy: 'Inspector Amit Patel',
    generatedAt: new Date(Date.now() - 3600000).toISOString(),
    status: 'READY',
    summaryDisposition: 'REQUIRES_REINSPECTION',
    includeEvidenceThumbnails: true,
    legalNoticeHeader: true,
    officerRemarks: 'Unit sale price declaration requires verification against second proviso to Rule 6(1)(e).',
  },
  {
    id: 'rep-002',
    inspectionId: 'insp-sample-02',
    productName: 'Royal Natural Mineral Water 1L',
    version: 'v1.0',
    format: 'PDF',
    fileUrl: '/reports/export-insp-sample-02-v1.0.pdf',
    fileSize: '1.18 MB',
    sha256Hash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    generatedBy: 'Inspector Amit Patel',
    generatedAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    status: 'READY',
    summaryDisposition: 'NON_COMPLIANT',
    includeEvidenceThumbnails: true,
    legalNoticeHeader: true,
    officerRemarks: 'Notice issued under Section 36 of Legal Metrology Act 2009 for non-declaration of MRP and MFG date.',
  },
  {
    id: 'rep-003',
    inspectionId: 'insp-sample-03',
    productName: 'Nature Fresh Sunflower Oil 1L',
    version: 'v1.0',
    format: 'PDF',
    fileUrl: '/reports/export-insp-sample-03-v1.0.pdf',
    fileSize: '1.25 MB',
    sha256Hash: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    generatedBy: 'Inspector Amit Patel',
    generatedAt: new Date(Date.now() - 40 * 3600000).toISOString(),
    status: 'READY',
    summaryDisposition: 'COMPLIANT',
    includeEvidenceThumbnails: true,
    legalNoticeHeader: false,
    officerRemarks: 'All 7 mandatory declarations verified in accordance with PCR 2011.',
  }
];

const evidenceLockerState: EvidenceLockerFile[] = [
  {
    id: 'ev-01',
    inspectionId: 'insp-sample-01',
    fileName: 'priya_chilli_pdp_front.jpg',
    packageSide: 'PDP',
    imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop&q=60',
    qualityScore: 0.96,
    resolution: '4032x3024',
    fileSize: '4.2 MB',
    sha256Hash: '7d2a58b9f0c2e3914a8b8a92f8910a30b5e2849203a9856a911762cf12e09412',
    capturedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    tags: ['PDP', 'High Resolution', 'OCR Processed', 'Net Qty Area'],
  },
  {
    id: 'ev-02',
    inspectionId: 'insp-sample-01',
    fileName: 'priya_chilli_back_declarations.jpg',
    packageSide: 'BACK',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=60',
    qualityScore: 0.91,
    resolution: '4032x3024',
    fileSize: '3.8 MB',
    sha256Hash: '3f5b9c81e92d847156102a9b47e2a9b9102ef1904a8b7c6d5e4f3a2b1c0d9e8f',
    capturedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    tags: ['BACK', 'MRP Verified', 'Consumer Care', 'USP Checked'],
  },
  {
    id: 'ev-03',
    inspectionId: 'insp-sample-01',
    fileName: 'priya_chilli_top_mfg_batch.jpg',
    packageSide: 'TOP',
    imageUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&auto=format&fit=crop&q=60',
    qualityScore: 0.88,
    resolution: '3024x3024',
    fileSize: '2.9 MB',
    sha256Hash: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
    capturedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    tags: ['TOP', 'Date of Mfg', 'Batch No'],
  },
  {
    id: 'ev-04',
    inspectionId: 'insp-sample-02',
    fileName: 'royal_water_bottle_label.jpg',
    packageSide: 'FRONT',
    imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=800&auto=format&fit=crop&q=60',
    qualityScore: 0.94,
    resolution: '3840x2160',
    fileSize: '3.1 MB',
    sha256Hash: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    capturedAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    tags: ['FRONT', 'Violation Evidence', 'Missing Declarations'],
  }
];

const mockManufacturerPatterns: ManufacturerPattern[] = [
  {
    id: 'mfg-royal-beverages',
    name: 'Royal Beverages Bottling Plant',
    category: 'Packaged Drinking Water',
    totalInspections: 14,
    violationCount: 9,
    riskScore: 88,
    repeatCount: 4,
    topViolatedRules: ['PCR-2011-R06-MRP', 'PCR-2011-R06-DATE', 'PCR-2011-R06-USP'],
    lastViolationDate: new Date(Date.now() - 24 * 3600000).toISOString(),
    riskLevel: 'HIGH',
    escalationStatus: 'SHOW_CAUSE_PENDING',
  },
  {
    id: 'mfg-priya-foods',
    name: 'Priya Foods Ltd',
    category: 'Spices & Condiments',
    totalInspections: 18,
    violationCount: 4,
    riskScore: 54,
    repeatCount: 2,
    topViolatedRules: ['PCR-2011-R06-USP', 'PCR-2011-R09-NET'],
    lastViolationDate: new Date(Date.now() - 2 * 3600000).toISOString(),
    riskLevel: 'MEDIUM',
    escalationStatus: 'MONITORING',
  },
  {
    id: 'mfg-delta-snax',
    name: 'Delta Snacks & Confectionery Pvt Ltd',
    category: 'Packaged Snacks & Chips',
    totalInspections: 11,
    violationCount: 7,
    riskScore: 79,
    repeatCount: 3,
    topViolatedRules: ['PCR-2011-R06-MFG', 'PCR-2011-R06-MRP'],
    lastViolationDate: new Date(Date.now() - 5 * 24 * 3600000).toISOString(),
    riskLevel: 'HIGH',
    escalationStatus: 'NOTICE_ISSUED',
  },
  {
    id: 'mfg-sunstar',
    name: 'Sunstar Agro Ltd',
    category: 'Edible Oils & Fats',
    totalInspections: 16,
    violationCount: 1,
    riskScore: 18,
    repeatCount: 0,
    topViolatedRules: ['PCR-2011-R06-CARE'],
    lastViolationDate: new Date(Date.now() - 40 * 24 * 3600000).toISOString(),
    riskLevel: 'LOW',
    escalationStatus: 'MONITORING',
  },
  {
    id: 'mfg-apex-dairy',
    name: 'Apex Dairy & Agro Products',
    category: 'Dairy Products',
    totalInspections: 8,
    violationCount: 3,
    riskScore: 48,
    repeatCount: 1,
    topViolatedRules: ['PCR-2011-R06-DATE'],
    lastViolationDate: new Date(Date.now() - 8 * 24 * 3600000).toISOString(),
    riskLevel: 'MEDIUM',
    escalationStatus: 'MONITORING',
  }
];
