import { v4 as uuidv4 } from 'uuid';
import { 
  Declaration, 
  Rule, 
  CheckResult, 
  Violation, 
  Evidence, 
  AuditLog, 
  Inspection, 
  User,
  Report,
  AnalyticsSnapshot,
  ViolationPattern,
  GeographicZoneMetric,
  RiskProfile,
  InspectNextItem
} from '../types/index.js';

export interface InMemoryDb {
  users: Map<string, User>;
  inspections: Map<string, Inspection>;
  declarations: Map<string, Declaration>;
  rules: Map<string, Rule>;
  checkResults: Map<string, CheckResult>;
  violations: Map<string, Violation>;
  evidence: Map<string, Evidence>;
  reports: Map<string, Report>;
  analyticsSnapshots: Map<string, AnalyticsSnapshot>;
  violationPatterns: Map<string, ViolationPattern>;
  geoZones: Map<string, GeographicZoneMetric>;
  riskProfiles: Map<string, RiskProfile>;
  inspectNextQueue: Map<string, InspectNextItem>;
  auditLogs: AuditLog[];
  idempotencyKeys: Map<string, { response: any; timestamp: number }>;
}

class DatabaseManager {
  private inMemory: InMemoryDb = {
    users: new Map(),
    inspections: new Map(),
    declarations: new Map(),
    rules: new Map(),
    checkResults: new Map(),
    violations: new Map(),
    evidence: new Map(),
    reports: new Map(),
    analyticsSnapshots: new Map(),
    violationPatterns: new Map(),
    geoZones: new Map(),
    riskProfiles: new Map(),
    inspectNextQueue: new Map(),
    auditLogs: [],
    idempotencyKeys: new Map(),
  };

  constructor() {
    this.seedRules();
    this.seedUsers();
    this.seedSampleData();
  }

  public get store(): InMemoryDb {
    return this.inMemory;
  }

  public reset(): void {
    this.inMemory.users.clear();
    this.inMemory.inspections.clear();
    this.inMemory.declarations.clear();
    this.inMemory.rules.clear();
    this.inMemory.checkResults.clear();
    this.inMemory.violations.clear();
    this.inMemory.evidence.clear();
    this.inMemory.reports.clear();
    this.inMemory.analyticsSnapshots.clear();
    this.inMemory.violationPatterns.clear();
    this.inMemory.geoZones.clear();
    this.inMemory.riskProfiles.clear();
    this.inMemory.inspectNextQueue.clear();
    this.inMemory.auditLogs = [];
    this.inMemory.idempotencyKeys.clear();
    this.seedRules();
    this.seedUsers();
    this.seedSampleData();
  }

  private seedUsers(): void {
    const defaultUsers: User[] = [
      {
        id: 'usr-admin-01',
        name: 'Rajesh Sharma',
        email: 'admin@legalmetrology.gov.in',
        role: 'ADMIN',
        organization: 'Department of Consumer Affairs, New Delhi',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'usr-supervisor-01',
        name: 'Sunita Verma',
        email: 'supervisor@legalmetrology.gov.in',
        role: 'SUPERVISOR',
        organization: 'Legal Metrology Maharashtra Controller Office',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'usr-inspector-01',
        name: 'Amit Patel',
        email: 'inspector.mumbai@legalmetrology.gov.in',
        role: 'INSPECTOR',
        organization: 'Enforcement Wing, Zone 2, Mumbai',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'usr-manufacturer-01',
        name: 'Priya Foods Compliance Officer',
        email: 'compliance@priyafoods.in',
        role: 'MANUFACTURER',
        organization: 'Priya Foods Ltd, Hyderabad',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    for (const u of defaultUsers) {
      this.inMemory.users.set(u.id, u);
    }
  }

  private seedRules(): void {
    const defaultRules: Rule[] = [
      // B21 Completeness Rules
      {
        id: 'rule-pcr-06-1-a',
        ruleCode: 'PCR-2011-R06-1-A',
        version: 'PCR-2011-v2.0',
        category: 'COMPLETENESS',
        title: 'Manufacturer/Packer/Importer Name and Address Declaration',
        legalReference: 'Legal Metrology (Packaged Commodities) Rules, 2011 - Rule 6(1)(a)',
        description: 'Every package shall bear the name and complete address of the manufacturer or packer or importer.',
        severity: 'CRITICAL',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'rule-pcr-06-1-b',
        ruleCode: 'PCR-2011-R06-1-B',
        version: 'PCR-2011-v2.0',
        category: 'COMPLETENESS',
        title: 'Generic or Common Name of Commodity Declaration',
        legalReference: 'Legal Metrology (Packaged Commodities) Rules, 2011 - Rule 6(1)(b)',
        description: 'The common or generic names of the commodity contained in the package shall be mentioned.',
        severity: 'MAJOR',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'rule-pcr-06-1-c',
        ruleCode: 'PCR-2011-R06-1-C',
        version: 'PCR-2011-v2.0',
        category: 'COMPLETENESS',
        title: 'Net Quantity Declaration in Standard Metric Units',
        legalReference: 'Legal Metrology (Packaged Commodities) Rules, 2011 - Rule 6(1)(c)',
        description: 'The net quantity, in terms of the standard unit of weight or measure of the commodity or in number, shall be declared.',
        severity: 'CRITICAL',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'rule-pcr-06-1-d',
        ruleCode: 'PCR-2011-R06-1-D',
        version: 'PCR-2011-v2.0',
        category: 'COMPLETENESS',
        title: 'Month and Year of Manufacture/Packing/Import Declaration',
        legalReference: 'Legal Metrology (Packaged Commodities) Rules, 2011 - Rule 6(1)(d)',
        description: 'The month and year in which the commodity is manufactured or pre-packed or imported shall be clearly indicated.',
        severity: 'MAJOR',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'rule-pcr-06-1-e',
        ruleCode: 'PCR-2011-R06-1-E',
        version: 'PCR-2011-v2.0',
        category: 'COMPLETENESS',
        title: 'Maximum Retail Price (MRP) Declaration Inclusive of All Taxes',
        legalReference: 'Legal Metrology (Packaged Commodities) Rules, 2011 - Rule 6(1)(e)',
        description: 'The maximum retail price at which the commodity in packaged form may be sold to the consumer, inclusive of all taxes.',
        severity: 'CRITICAL',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'rule-pcr-06-1-g',
        ruleCode: 'PCR-2011-R06-1-G',
        version: 'PCR-2011-v2.0',
        category: 'COMPLETENESS',
        title: 'Consumer Care Details Declaration',
        legalReference: 'Legal Metrology (Packaged Commodities) Rules, 2011 - Rule 6(1)(g)',
        description: 'Name, address, telephone number and e-mail address of the person or office who can be contacted in case of consumer complaint.',
        severity: 'MAJOR',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'rule-pcr-06-1-origin',
        ruleCode: 'PCR-2011-R06-ORIGIN',
        version: 'PCR-2011-v2.0',
        category: 'COMPLETENESS',
        title: 'Country of Origin Declaration for Imported Packages',
        legalReference: 'Legal Metrology (Packaged Commodities) Rules, 2011 - Rule 6(10)',
        description: 'Every package containing imported goods shall mention the name of the country of origin.',
        severity: 'MAJOR',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // B22 MRP & Quantity Detailed Rules
      {
        id: 'rule-mrp-format',
        ruleCode: 'PCR-2011-R06-MRP-FORMAT',
        version: 'PCR-2011-v2.0',
        category: 'MRP_QUANTITY',
        title: 'MRP Syntax and All-Inclusive Tax Statement',
        legalReference: 'Legal Metrology (Packaged Commodities) Rules, 2011 - Rule 6(1)(e)',
        description: 'MRP must be stated as "MRP ₹ ... incl. of all taxes" or "Maximum Retail Price ₹ ... (inclusive of all taxes)".',
        severity: 'CRITICAL',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'rule-mrp-currency',
        ruleCode: 'PCR-2011-R06-MRP-CURRENCY',
        version: 'PCR-2011-v2.0',
        category: 'MRP_QUANTITY',
        title: 'MRP Indian Currency Designation',
        legalReference: 'Legal Metrology Act, 2009 & PCR 2011 Rule 6(1)(e)',
        description: 'Price must be indicated in Indian currency (₹ / Rs. / INR) and must not bear dual pricing.',
        severity: 'CRITICAL',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'rule-unit-sale-price',
        ruleCode: 'PCR-2011-R06-1-E-USP',
        version: 'PCR-2011-v2.0',
        category: 'MRP_QUANTITY',
        title: 'Unit Sale Price (USP) Requirement',
        legalReference: 'Legal Metrology (Packaged Commodities) Amendment Rules, 2021 - Rule 6(11)',
        description: 'Unit sale price must be declared in ₹ per g/ml (for packages <= 1kg/1L) or ₹ per kg/L (for packages > 1kg/1L) or ₹ per number.',
        severity: 'MAJOR',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'rule-net-qty-metric',
        ruleCode: 'PCR-2011-R06-QTY-METRIC',
        version: 'PCR-2011-v2.0',
        category: 'MRP_QUANTITY',
        title: 'Net Quantity Approved Metric Symbols',
        legalReference: 'Legal Metrology (Packaged Commodities) Rules, 2011 - Schedule III',
        description: 'Standard metric symbols (g, kg, ml, l, m, N, U) must be used. Non-standard symbols (gms, kgs, ltr) are strictly prohibited.',
        severity: 'MAJOR',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // B23 Entity & Consumer Care Detailed Rules
      {
        id: 'rule-entity-address',
        ruleCode: 'PCR-2011-R06-ENTITY-ADDR',
        version: 'PCR-2011-v2.0',
        category: 'MANUFACTURER_ENTITY',
        title: 'Complete Postal Address with 6-digit Indian PIN Code',
        legalReference: 'Legal Metrology (Packaged Commodities) Rules, 2011 - Rule 6(1)(a)',
        description: 'Address of the manufacturer/packer/importer must contain premises details, city/state, and valid 6-digit Indian PIN code.',
        severity: 'CRITICAL',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'rule-consumer-care-phone',
        ruleCode: 'PCR-2011-R06-CC-PHONE',
        version: 'PCR-2011-v2.0',
        category: 'MANUFACTURER_ENTITY',
        title: 'Consumer Care Contact Number Format',
        legalReference: 'Legal Metrology (Packaged Commodities) Rules, 2011 - Rule 6(1)(g)',
        description: 'Consumer care must include an operational Indian phone number (10-digit mobile, STD landline, or 1800 toll-free).',
        severity: 'MAJOR',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'rule-consumer-care-email',
        ruleCode: 'PCR-2011-R06-CC-EMAIL',
        version: 'PCR-2011-v2.0',
        category: 'MANUFACTURER_ENTITY',
        title: 'Consumer Care Email Address Format',
        legalReference: 'Legal Metrology (Packaged Commodities) Rules, 2011 - Rule 6(1)(g)',
        description: 'Consumer care declaration must include a valid reachable email address for consumer complaints.',
        severity: 'MAJOR',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // B24 Date & Placement / Font-Size Rules
      {
        id: 'rule-date-format',
        ruleCode: 'PCR-2011-R06-DATE-FORMAT',
        version: 'PCR-2011-v2.0',
        category: 'DATE_DECLARATION',
        title: 'Month and Year Formatting (MM/YYYY or Month YYYY)',
        legalReference: 'Legal Metrology (Packaged Commodities) Rules, 2011 - Rule 6(1)(d)',
        description: 'Month and year must be clear letters or numerals. Date cannot be post-dated (in the future of inspection date).',
        severity: 'CRITICAL',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'rule-font-size-numeral',
        ruleCode: 'PCR-2011-R07-FONT-HEIGHT',
        version: 'PCR-2011-v2.0',
        category: 'PLACEMENT_FONT',
        title: 'Minimum Height of Letters and Numerals',
        legalReference: 'Legal Metrology (Packaged Commodities) Rules, 2011 - Rule 7 & Schedule II',
        description: 'Minimum numeral height must satisfy package size brackets: <=200g/ml: 1-2mm; 200g-1kg: 2-4mm; >1kg: 4-6mm.',
        severity: 'MAJOR',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'rule-pdp-readability',
        ruleCode: 'PCR-2011-R09-PDP-READABILITY',
        version: 'PCR-2011-v2.0',
        category: 'PLACEMENT_FONT',
        title: 'Principal Display Panel (PDP) Prominence and Clarity',
        legalReference: 'Legal Metrology (Packaged Commodities) Rules, 2011 - Rule 9',
        description: 'Declarations on the Principal Display Panel must be conspicuous, legible, unobstructed and with sufficient contrast ratio.',
        severity: 'MAJOR',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    for (const r of defaultRules) {
      this.inMemory.rules.set(r.id, r);
    }
  }

  private seedSampleData(): void {
    // Seed Sample Geo Zones (B33)
    const sampleGeoZones: GeographicZoneMetric[] = [
      {
        id: 'geo-zone-mumbai',
        state: 'Maharashtra',
        district: 'Mumbai City',
        pinCode: '400001',
        coordinates: { latitude: 18.9388, longitude: 72.8354 },
        totalInspections: 45,
        totalViolations: 12,
        complianceRate: 73.33,
        riskTier: 'HIGH',
        isHotspot: true,
        activeInspectorsCount: 8,
        lastInspectedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'geo-zone-pune',
        state: 'Maharashtra',
        district: 'Pune',
        pinCode: '411001',
        coordinates: { latitude: 18.5204, longitude: 73.8567 },
        totalInspections: 30,
        totalViolations: 4,
        complianceRate: 86.67,
        riskTier: 'LOW',
        isHotspot: false,
        activeInspectorsCount: 5,
        lastInspectedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'geo-zone-delhi',
        state: 'Delhi',
        district: 'Central Delhi',
        pinCode: '110001',
        coordinates: { latitude: 28.6139, longitude: 77.2090 },
        totalInspections: 60,
        totalViolations: 18,
        complianceRate: 70.00,
        riskTier: 'CRITICAL',
        isHotspot: true,
        activeInspectorsCount: 12,
        lastInspectedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'geo-zone-bengaluru',
        state: 'Karnataka',
        district: 'Bengaluru Urban',
        pinCode: '560001',
        coordinates: { latitude: 12.9716, longitude: 77.5946 },
        totalInspections: 40,
        totalViolations: 6,
        complianceRate: 85.00,
        riskTier: 'MEDIUM',
        isHotspot: false,
        activeInspectorsCount: 6,
        lastInspectedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    for (const g of sampleGeoZones) {
      this.inMemory.geoZones.set(g.id, g);
    }

    // Seed Sample Risk Profiles (B34)
    const sampleRiskProfiles: RiskProfile[] = [
      {
        id: 'risk-mfg-001',
        entityId: 'mfg-priya-foods',
        entityType: 'MANUFACTURER',
        entityName: 'Priya Foods Ltd',
        riskScore: 68.5,
        riskTier: 'HIGH',
        factorBreakdown: [
          { factor: 'Historical Violation Rate', weight: 0.35, score: 75, contribution: 26.25, description: '3 critical violations in last 60 days' },
          { factor: 'Rule Recidivism (MRP/Quantity)', weight: 0.25, score: 80, contribution: 20.0, description: 'Repeated unit sale price absence' },
          { factor: 'Category Base Risk', weight: 0.20, score: 60, contribution: 12.0, description: 'Packaged Edible Commodities' },
          { factor: 'Inspection Recency Gap', weight: 0.20, score: 51.25, contribution: 10.25, description: '45 days since last physical verification' }
        ],
        explanation: 'Elevated risk driven by recent repeat violations of Rule 6(1)(e) (MRP unit sale price) and high volume distribution in Western Zone.',
        confidence: 0.94,
        historicalInspectionCount: 18,
        historicalViolationCount: 6,
        lastComputedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'risk-cat-edible-oil',
        entityId: 'cat-edible-oils',
        entityType: 'CATEGORY',
        entityName: 'Edible Oils & Fats',
        riskScore: 78.0,
        riskTier: 'CRITICAL',
        factorBreakdown: [
          { factor: 'Net Quantity Discrepancy Severity', weight: 0.40, score: 85, contribution: 34.0, description: 'Temperature corrected density declarations frequently omitted' },
          { factor: 'Consumer Complaints Index', weight: 0.30, score: 70, contribution: 21.0, description: 'High volume of short-delivery reports' },
          { factor: 'Regulatory Scrutiny Level', weight: 0.30, score: 76.67, contribution: 23.0, description: 'Mandatory surveillance category under PCR 2011 Second Schedule' }
        ],
        explanation: 'Critical risk category due to widespread omission of volume-to-mass conversion at 30°C and dual-unit declaration non-compliance.',
        confidence: 0.96,
        historicalInspectionCount: 42,
        historicalViolationCount: 19,
        lastComputedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    for (const rp of sampleRiskProfiles) {
      this.inMemory.riskProfiles.set(rp.id, rp);
    }

    // Seed Sample Inspect Next Queue (B35)
    const sampleQueue: InspectNextItem[] = [
      {
        id: 'queue-001',
        entityId: 'mfg-priya-foods',
        entityType: 'MANUFACTURER',
        targetName: 'Priya Foods Ltd - Packaging Unit 3',
        category: 'Spices & Condiments',
        region: 'Maharashtra / Pune',
        pinCode: '411028',
        priorityScore: 84.5,
        riskTier: 'HIGH',
        riskProfileId: 'risk-mfg-001',
        recommendedChecklist: [
          'PCR-2011-R06-MRP-USP',
          'PCR-2011-R06-NET-QTY',
          'PCR-2011-R07-FONT-HEIGHT'
        ],
        status: 'QUEUED',
        estimatedEffortHours: 3.5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'queue-002',
        entityId: 'mfg-royal-beverages',
        entityType: 'MANUFACTURER',
        targetName: 'Royal Beverages Bottling Plant',
        category: 'Packaged Drinking Water',
        region: 'Delhi / Central Delhi',
        pinCode: '110006',
        priorityScore: 92.0,
        riskTier: 'CRITICAL',
        recommendedChecklist: [
          'PCR-2011-R06-NET-QTY',
          'PCR-2011-R06-DATE-FORMAT',
          'PCR-2011-R06-MFG-NAME'
        ],
        status: 'QUEUED',
        estimatedEffortHours: 4.0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    for (const q of sampleQueue) {
      this.inMemory.inspectNextQueue.set(q.id, q);
    }
  }
}

export const db = new DatabaseManager();

