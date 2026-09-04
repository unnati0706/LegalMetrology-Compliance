import request from 'supertest';
import { createApp } from '../../app.js';
import { db } from '../../shared/database/index.js';
import { generateTestToken } from '../../shared/auth/index.js';

describe('B40 - Multi-Agency Interoperability & Case Dossier Hub', () => {
  const app = createApp();

  const adminToken = generateTestToken({
    id: 'usr-admin-01',
    email: 'admin@legalmetrology.gov.in',
    name: 'Rajesh Sharma',
    role: 'ADMIN',
  });

  const inspectorToken = generateTestToken({
    id: 'usr-inspector-01',
    email: 'inspector@legalmetrology.gov.in',
    name: 'Amit Patel',
    role: 'INSPECTOR',
  });

  const manufacturerToken = generateTestToken({
    id: 'usr-manufacturer-01',
    email: 'compliance@priyafoods.in',
    name: 'Priya Foods Officer',
    role: 'MANUFACTURER',
  });

  beforeEach(() => {
    db.reset();
  });

  describe('GET /api/v1/b40 - List Case Dossiers', () => {
    it('returns seeded case dossiers with cryptographic checksums and target agencies', async () => {
      const res = await request(app)
        .get('/api/v1/b40')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data[0].dossierNumber).toBe('LM/DOS/2026/FSSAI-0012');
      expect(res.body.data[0].targetAgency).toBe('FSSAI');
      expect(res.body.data[0].payloadChecksum).toBeDefined();
    });

    it('filters dossiers by target agency', async () => {
      const res = await request(app)
        .get('/api/v1/b40?targetAgency=FSSAI')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
    });
  });

  describe('POST /api/v1/b40 - Compile Case Dossier', () => {
    it('compiles evidence and violation manifests into a signed dossier bundle', async () => {
      const payload = {
        inspectionId: 'insp-sample-01',
        targetAgency: 'DISTRICT_COURT',
        caseTitle: 'State of Maharashtra vs Priya Foods Ltd - Criminal Complaint u/s 39',
        manufacturerId: 'mfg-priya-foods',
        manufacturerName: 'Priya Foods Ltd',
        statutoryOffenses: [
          'Section 36(1) of Legal Metrology Act, 2009',
          'Rule 6(1)(e) of Legal Metrology (Packaged Commodities) Rules, 2011'
        ],
        noticeIds: ['notice-001'],
        penaltyId: 'pen-001',
      };

      const res = await request(app)
        .post('/api/v1/b40')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.dossierNumber).toMatch(/^LM\/DOS\/\d{4}\/DISTRICT_COURT-\d{4}$/);
      expect(res.body.data.payloadChecksum).toBeDefined();
      expect(res.body.data.summaryOfEvidence).toBeDefined();
      expect(res.body.data.status).toBe('GENERATED');
    });

    it('rejects unprivileged Inspector from compiling case dossier with 403', async () => {
      const payload = {
        inspectionId: 'insp-sample-01',
        targetAgency: 'FSSAI',
        caseTitle: 'Test Case Dossier',
        manufacturerId: 'mfg-priya-foods',
        manufacturerName: 'Priya Foods Ltd',
        statutoryOffenses: ['Section 39'],
      };

      const res = await request(app)
        .post('/api/v1/b40')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .send(payload);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('PERMISSION_DENIED');
    });
  });

  describe('POST /api/v1/b40/:id/transmit - Transmit Case Dossier', () => {
    it('transmits case dossier to external portal and records acknowledgment reference', async () => {
      const res = await request(app)
        .post('/api/v1/b40/dossier-001/transmit')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          externalAcknowledgmentRef: 'FSSAI-INSPECTION-REF-994411',
          notes: 'Secure API payload dispatched to FSSAI FoSCoS portal.',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('TRANSMITTED');
      expect(res.body.data.externalAcknowledgmentRef).toBe('FSSAI-INSPECTION-REF-994411');
      expect(res.body.data.transmissionTimestamp).toBeDefined();
    });

    it('returns 40_NOT_FOUND when transmitting non-existent dossier', async () => {
      const res = await request(app)
        .post('/api/v1/b40/dossier-non-existent/transmit')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('40_NOT_FOUND');
    });
  });
});
