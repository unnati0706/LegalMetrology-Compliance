import { B19Repository, RuleEntity } from './b19.repository';
import { NotFoundError, ValidationError, PermissionDeniedError } from '../../shared/errors';
import { recordAuditLog } from '../../shared/audit';

export class B19Service {
  private repo = new B19Repository();

  async getRules(category?: string, version?: string, isActive?: boolean, limit = 10, offset = 0) {
    return this.repo.findAll({ category, version, isActive, limit, offset });
  }

  async getRuleById(id: string): Promise<RuleEntity> {
    const rule = await this.repo.findById(id);
    if (!rule) {
      throw new NotFoundError('19', 'Rule');
    }
    return rule;
  }

  async createRule(payload: { ruleCode: string; title: string; sectionReference: string; categoryApplicability?: string; version?: string; parameters?: any }, userRole: string, userId: string): Promise<RuleEntity> {
    if (userRole !== 'Administrator') {
      throw new PermissionDeniedError('Only Administrators can define or modify compliance rules');
    }

    if (!payload.ruleCode || !payload.title || !payload.sectionReference) {
      throw new ValidationError('ruleCode, title, and sectionReference are required');
    }

    const created = await this.repo.create(payload);
    recordAuditLog({
      userId,
      action: 'CREATE_COMPLIANCE_RULE',
      entityType: 'Rule',
      entityId: created.id,
      newValue: created,
    });
    return created;
  }

  async updateRuleVersion(id: string, updates: Partial<RuleEntity>, userRole: string, userId: string): Promise<RuleEntity> {
    if (userRole !== 'Administrator') {
      throw new PermissionDeniedError('Only Administrators can update compliance rules');
    }

    const previous = await this.getRuleById(id);
    const updated = await this.repo.createNewVersion(id, updates);
    if (!updated) {
      throw new NotFoundError('19', 'Rule');
    }

    recordAuditLog({
      userId,
      action: 'CREATE_RULE_VERSION',
      entityType: 'Rule',
      entityId: updated.id,
      previousValue: previous,
      newValue: updated,
    });

    return updated;
  }
}
