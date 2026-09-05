import { db } from '../../shared/database/index.js';
import { SelfCertification } from '../../shared/types/index.js';
import { QueryCertificationsInput } from './b39.schemas.js';

export class B39Repository {
  public async getCertifications(query: QueryCertificationsInput): Promise<{ certifications: SelfCertification[]; total: number }> {
    let all = Array.from(db.store.selfCertifications.values()).filter(c => !c.deletedAt);

    if (query.status) {
      all = all.filter(c => c.status === query.status);
    }
    if (query.manufacturerId) {
      all = all.filter(c => c.manufacturerId === query.manufacturerId);
    }
    if (query.sku) {
      all = all.filter(c => c.sku.toLowerCase().includes(query.sku!.toLowerCase()));
    }
    if (query.category) {
      all = all.filter(c => c.category === query.category);
    }

    all.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const total = all.length;
    const page = query.page || 1;
    const limit = query.limit || 20;
    const startIndex = (page - 1) * limit;
    const certifications = all.slice(startIndex, startIndex + limit);

    return { certifications, total };
  }

  public async findCertificationById(id: string): Promise<SelfCertification | null> {
    const cert = db.store.selfCertifications.get(id);
    if (!cert || cert.deletedAt) return null;
    return cert;
  }

  public async saveCertification(cert: SelfCertification): Promise<SelfCertification> {
    db.store.selfCertifications.set(cert.id, cert);
    return cert;
  }

  public async updateCertification(cert: SelfCertification): Promise<SelfCertification> {
    db.store.selfCertifications.set(cert.id, cert);
    return cert;
  }
}
