import { v4 as uuidv4 } from 'uuid';

export interface RuleEntity {
  id: string;
  ruleCode: string;
  title: string;
  sectionReference: string;
  categoryApplicability: string;
  version: string;
  effectiveFrom: string;
  effectiveTo?: string | null;
  parameters: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

const rulesStore: Map<string, RuleEntity> = new Map();

// Seed initial legal metrology rules
const seedRules = () => {
  if (rulesStore.size > 0) return;

  const initialRules: RuleEntity[] = [
    {
      id: 'rule_mr_declaration',
      ruleCode: 'LM_RULE_01_MRP_DECLARATION',
      title: 'Maximum Retail Price Declaration & Inclusive Taxes',
      sectionReference: 'Legal Metrology (Packaged Commodities) Rules, 2011 Rule 6(1)(e)',
      categoryApplicability: 'ALL',
      version: '1.0.0',
      effectiveFrom: '2011-03-01T00:00:00Z',
      effectiveTo: null,
      parameters: { requireInclusiveTaxMention: true, currency: 'INR' },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    },
    {
      id: 'rule_net_qty',
      ruleCode: 'LM_RULE_02_NET_QUANTITY',
      title: 'Standard Net Quantity & Standard Unit Declaration',
      sectionReference: 'Legal Metrology (Packaged Commodities) Rules, 2011 Rule 6(1)(a)',
      categoryApplicability: 'ALL',
      version: '1.0.0',
      effectiveFrom: '2011-03-01T00:00:00Z',
      effectiveTo: null,
      parameters: { allowedUnits: ['g', 'kg', 'ml', 'l', 'unit', 'pcs', 'N', 'm'] },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    },
    {
      id: 'rule_mfr_address',
      ruleCode: 'LM_RULE_03_MANUFACTURER_ADDRESS',
      title: 'Manufacturer/Packer/Importer Name & Complete Postal Address',
      sectionReference: 'Legal Metrology (Packaged Commodities) Rules, 2011 Rule 6(1)(a)',
      categoryApplicability: 'ALL',
      version: '1.0.0',
      effectiveFrom: '2011-03-01T00:00:00Z',
      effectiveTo: null,
      parameters: { requirePincode: true },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    },
  ];

  for (const r of initialRules) {
    rulesStore.set(r.id, r);
  }
};

seedRules();

export class B19Repository {
  async findAll(filters: { category?: string; version?: string; isActive?: boolean; limit?: number; offset?: number }) {
    seedRules();
    const limit = filters.limit || 10;
    const offset = filters.offset || 0;
    let list = Array.from(rulesStore.values()).filter((r) => !r.deletedAt);

    if (filters.category && filters.category !== 'ALL') {
      list = list.filter((r) => r.categoryApplicability === 'ALL' || r.categoryApplicability.toLowerCase() === filters.category!.toLowerCase());
    }
    if (filters.version) {
      list = list.filter((r) => r.version === filters.version);
    }
    if (filters.isActive !== undefined) {
      list = list.filter((r) => r.isActive === filters.isActive);
    }

    return {
      items: list.slice(offset, offset + limit),
      total: list.length,
    };
  }

  async findById(id: string): Promise<RuleEntity | null> {
    seedRules();
    const r = rulesStore.get(id);
    if (!r || r.deletedAt) return null;
    return r;
  }

  async findByCodeAndVersion(ruleCode: string, version: string): Promise<RuleEntity | null> {
    seedRules();
    for (const r of rulesStore.values()) {
      if (r.ruleCode === ruleCode && r.version === version && !r.deletedAt) {
        return r;
      }
    }
    return null;
  }

  async create(data: { ruleCode: string; title: string; sectionReference: string; categoryApplicability?: string; version?: string; effectiveFrom?: string; parameters?: any }): Promise<RuleEntity> {
    seedRules();
    const id = uuidv4();
    const rule: RuleEntity = {
      id,
      ruleCode: data.ruleCode,
      title: data.title,
      sectionReference: data.sectionReference,
      categoryApplicability: data.categoryApplicability || 'ALL',
      version: data.version || '1.0.0',
      effectiveFrom: data.effectiveFrom || new Date().toISOString(),
      effectiveTo: null,
      parameters: data.parameters || {},
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    };
    rulesStore.set(id, rule);
    return rule;
  }

  async createNewVersion(existingRuleId: string, updates: Partial<RuleEntity>): Promise<RuleEntity | null> {
    const existing = await this.findById(existingRuleId);
    if (!existing) return null;

    // Deactivate previous version
    existing.isActive = false;
    existing.effectiveTo = new Date().toISOString();
    existing.updatedAt = new Date().toISOString();

    // Bump version number
    const [major, minor, patch] = existing.version.split('.').map(Number);
    const newVersion = `${major}.${minor + 1}.${patch}`;

    const newId = uuidv4();
    const newRule: RuleEntity = {
      ...existing,
      ...updates,
      id: newId,
      version: updates.version || newVersion,
      effectiveFrom: new Date().toISOString(),
      effectiveTo: null,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    rulesStore.set(newId, newRule);
    return newRule;
  }
}
