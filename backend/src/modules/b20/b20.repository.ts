import { B19Repository, RuleEntity } from '../b19/b19.repository';

export class RuleVersionNotFoundError extends Error {
  public statusCode = 400;
  public errorCode = 'RULE_VERSION_NOT_FOUND';
  constructor(message: string = 'Referenced rule version does not exist') {
    super(message);
  }
}

export class B20Repository {
  private repo19 = new B19Repository();

  async findApplicableRules(category: string, version?: string, inspectionDate?: string): Promise<RuleEntity[]> {
    const all = await this.repo19.findAll({ category, isActive: true, limit: 100 });
    let applicable = all.items;

    if (version) {
      const match = applicable.filter((r) => r.version === version);
      if (match.length === 0) {
        throw new RuleVersionNotFoundError(`Rule version '${version}' does not exist for category '${category}'`);
      }
      applicable = match;
    }

    if (inspectionDate) {
      const time = new Date(inspectionDate).getTime();
      applicable = applicable.filter((r) => {
        const from = new Date(r.effectiveFrom).getTime();
        const to = r.effectiveTo ? new Date(r.effectiveTo).getTime() : Infinity;
        return time >= from && time <= to;
      });
    }

    return applicable;
  }
}
