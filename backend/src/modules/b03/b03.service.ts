import { B03Repository } from './b03.repository';
import { recordAuditLog } from '../../shared/audit';

export class B03Service {
  private repo = new B03Repository();

  async getSecuritySettings() {
    return this.repo.getSettings();
  }

  async updateSecuritySettings(updates: any, userId?: string) {
    const previous = await this.repo.getSettings();
    const updated = await this.repo.updateSettings(updates);
    recordAuditLog({
      userId,
      action: 'UPDATE_SECURITY_SETTINGS',
      entityType: 'SecurityConfig',
      entityId: updated.id,
      previousValue: previous,
      newValue: updated,
    });
    return updated;
  }
}
