import { Inspection, CheckResult, Declaration, EvidenceItem, InspectorNote, Violation } from '../types/index.js';

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
  }
};
