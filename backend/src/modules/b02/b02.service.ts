import { B02Repository } from './b02.repository';
import { NotFoundError } from '../../shared/errors';
import { recordAuditLog } from '../../shared/audit';

export class B02Service {
  private repo = new B02Repository();

  async getDatabaseInfo() {
    return this.repo.getTables();
  }

  async getTableMeta(id: string) {
    const table = await this.repo.getTableById(id);
    if (!table) {
      throw new NotFoundError('02', 'Table Metadata');
    }
    return table;
  }

  async syncSchema(userId?: string) {
    const info = await this.repo.getTables();
    recordAuditLog({
      userId,
      action: 'SYNC_SCHEMA',
      entityType: 'DatabaseSchema',
      entityId: 'global',
      newValue: { timestamp: new Date().toISOString() },
    });
    return { synced: true, tablesCount: info.tables.length };
  }
}
