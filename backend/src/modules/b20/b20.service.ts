import { B20Repository } from './b20.repository';
import { B19Repository } from '../b19/b19.repository';
import { NotFoundError, ValidationError } from '../../shared/errors';
import { recordAuditLog } from '../../shared/audit';

export class B20Service {
  private repo = new B20Repository();
  private repo19 = new B19Repository();

  async getApplicableRules(category: string, version?: string, inspectionDate?: string) {
    if (!category) {
      throw new ValidationError('category parameter is required');
    }
    return this.repo.findApplicableRules(category, version, inspectionDate);
  }

  async getApplicabilityById(id: string) {
    const rule = await this.repo19.findById(id);
    if (!rule) {
      throw new NotFoundError('20', 'Rule Applicability Record');
    }
    return rule;
  }

  async evaluateApplicability(payload: { category: string; ruleVersion?: string; inspectionDate?: string }, userId?: string) {
    const rules = await this.getApplicableRules(payload.category, payload.ruleVersion, payload.inspectionDate);

    recordAuditLog({
      userId,
      action: 'EVALUATE_RULE_APPLICABILITY',
      entityType: 'RuleApplicability',
      entityId: payload.category,
      newValue: { rulesCount: rules.length, ruleCodes: rules.map((r) => r.ruleCode) },
    });

    return {
      category: payload.category,
      ruleVersion: payload.ruleVersion || '1.0.0',
      applicableRulesCount: rules.length,
      rules,
    };
  }
}
