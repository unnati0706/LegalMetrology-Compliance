import { v4 as uuidv4 } from 'uuid';
import { 
  Declaration, 
  Rule, 
  CheckResult, 
  Violation, 
  Evidence, 
  AuditLog, 
  Inspection, 
  User 
} from '../types/index.js';

export interface InMemoryDb {
  users: Map<string, User>;
  inspections: Map<string, Inspection>;
  declarations: Map<string, Declaration>;
  rules: Map<string, Rule>;
  checkResults: Map<string, CheckResult>;
  violations: Map<string, Violation>;
  evidence: Map<string, Evidence>;
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
    auditLogs: [],
    idempotencyKeys: new Map(),
  };

  constructor() {
    this.seedRules();
    this.seedUsers();
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
    this.inMemory.auditLogs = [];
    this.inMemory.idempotencyKeys.clear();
    this.seedRules();
    this.seedUsers();
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
}

export const db = new DatabaseManager();
