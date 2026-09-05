import { config } from '../../config';

export interface SecurityConfigEntity {
  id: string;
  corsOrigin: string;
  rateLimitMax: number;
  rateLimitWindowMs: number;
  helmetEnabled: boolean;
  updatedAt: string;
}

let securitySettings: SecurityConfigEntity = {
  id: 'sec_global',
  corsOrigin: config.corsOrigin,
  rateLimitMax: config.rateLimitMax,
  rateLimitWindowMs: config.rateLimitWindowMs,
  helmetEnabled: true,
  updatedAt: new Date().toISOString(),
};

export class B03Repository {
  async getSettings(): Promise<SecurityConfigEntity> {
    return securitySettings;
  }

  async updateSettings(updates: Partial<SecurityConfigEntity>): Promise<SecurityConfigEntity> {
    securitySettings = {
      ...securitySettings,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return securitySettings;
  }
}
