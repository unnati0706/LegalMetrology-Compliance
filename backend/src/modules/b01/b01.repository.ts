import { v4 as uuidv4 } from 'uuid';

export interface ConfigEntity {
  id: string;
  key: string;
  value: any;
  description?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

const configsInMemory: Map<string, ConfigEntity> = new Map();

// Seed initial system config
const defaultConfigId = uuidv4();
configsInMemory.set(defaultConfigId, {
  id: defaultConfigId,
  key: 'SYSTEM_SETTINGS',
  value: { env: 'development', complianceVersion: '1.0.0', maxImageMB: 10 },
  description: 'Global system configuration settings',
  version: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  deletedAt: null,
});

export class B01Repository {
  async findAll(limit = 10, offset = 0): Promise<{ items: ConfigEntity[]; total: number }> {
    const active = Array.from(configsInMemory.values()).filter((c) => !c.deletedAt);
    return {
      items: active.slice(offset, offset + limit),
      total: active.length,
    };
  }

  async findById(id: string): Promise<ConfigEntity | null> {
    const config = configsInMemory.get(id);
    if (!config || config.deletedAt) return null;
    return config;
  }

  async create(data: { key: string; value: any; description?: string }): Promise<ConfigEntity> {
    const id = uuidv4();
    const newConfig: ConfigEntity = {
      id,
      key: data.key,
      value: data.value,
      description: data.description,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    };
    configsInMemory.set(id, newConfig);
    return newConfig;
  }

  async update(id: string, updates: { value?: any; description?: string }): Promise<ConfigEntity | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const updated: ConfigEntity = {
      ...existing,
      ...(updates.value !== undefined ? { value: updates.value } : {}),
      ...(updates.description !== undefined ? { description: updates.description } : {}),
      version: existing.version + 1,
      updatedAt: new Date().toISOString(),
    };

    configsInMemory.set(id, updated);
    return updated;
  }
}
