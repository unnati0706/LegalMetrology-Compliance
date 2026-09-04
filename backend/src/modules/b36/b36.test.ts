import request from 'supertest';
import { createApp } from '../../app.js';
import { db } from '../../shared/database/index.js';
import { generateTestToken } from '../../shared/auth/index.js';

describe('B36 - Legal Notice & Show-Cause Issuance Service', () => {
  const app = createApp();

  const adminToken = generateTestToken({
    id: 'usr-admin-01',
    email: 'admin@legalmetrology.gov.in',
    name: 'Rajesh Sharma',
    role: 'ADMIN',
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

  describe('GET /api/v1/b36 - List & Filter Legal Notices', () => {
    it('returns seeded legal notices with pagination metadata', async () => {
      const res = await request(app)
        .get('/api/v1/b36')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0].noticeNumber).toBe('LM/NZ/2026/SC-0042');
      expect(res.body.meta.total).toBeGreaterThanOrEqual(1);
    });

    it('filters notices by status and manufacturerId', async () => {
      const res = await request(app)
        .get('/api/v1/b36?status=ISSUED&manufacturerId=mfg-priya-foods')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].manufacturerId).toBe('mfg-priya-foods');
    });
  });

  describe('POST /api/v1/b36 - Issue Legal Notice', () => {
    it('allows Admin to issue a show cause notice with digital signature and deadline', async () => {
      const payload = {
        inspectionId: 'insp-sample-01',
        noticeType: 'SHOW_CAUSE',
        manufacturerId: 'mfg-royal-beverages',
        manufacturerName: 'Royal Beverages Ltd',
        issuingAuthority: 'Office of the Controller, Legal Metrology, Delhi',
        statutoryReference: 'Section 39 Legal Metrology Act, 2009',
        allegations: [
          {
            ruleCode: 'PCR-2011-R06-NET-QTY',
            description: 'Non-standard quantity declaration on 750ml bottle',
            severity: 'CRITICAL',
          }
        ],
        deadlineDays: 30,
        servedToEmail: 'legal@royalbeverages.in',
        notes: 'Immediate explanation required regarding short-fill batch 2026-B.',
      };

      const res = await request(app)
        .post('/api/v1/b36')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.noticeNumber).toMatch(/^LM\/NZ\/\d{4}\/SC-\d{4}$/);
      expect(res.body.data.digitalSignatureHash).toBeDefined();
      expect(res.body.data.status).toBe('ISSUED');
      expect(new Date(res.body.data.responseDeadline).getTime()).toBeGreaterThan(Date.now());
    });

    it('rejects unauthorized Manufacturer from issuing notice with 403', async () => {
      const payload = {
        inspectionId: 'insp-sample-01',
        noticeType: 'SHOW_CAUSE',
        manufacturerId: 'mfg-royal-beverages',
        manufacturerName: 'Royal Beverages Ltd',
        issuingAuthority: 'Office of the Controller',
        statutoryReference: 'Section 39',
        allegations: [
          { ruleCode: 'PCR-2011-R06-NET-QTY', description: 'Defect', severity: 'MAJOR' }
        ]
      };

      const res = await request(app)
        .post('/api/v1/b36')
        .set('Authorization', `Bearer ${manufacturerToken}`)
        .send(payload);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('PERMISSION_DENIED');
    });

    it('returns VALIDATION_ERROR when allegations array is empty', async () => {
      const payload = {
        inspectionId: 'insp-sample-01',
        noticeType: 'SHOW_CAUSE',
        manufacturerId: 'mfg-royal-beverages',
        manufacturerName: 'Royal Beverages Ltd',
        issuingAuthority: 'Office of the Controller',
        statutoryReference: 'Section 39',
        allegations: [],
      };

      const res = await request(app)
        .post('/api/v1/b36')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payload);

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/v1/b36/:id and PATCH /api/v1/b36/:id', () => {
    it('retrieves and updates notice status with audit log', async () => {
      const getRes = await request(app)
        .get('/api/v1/b36/notice-001')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(getRes.status).toBe(200);
      expect(getRes.body.data.id).toBe('notice-001');

      const patchRes = await request(app)
        .patch('/api/v1/b36/notice-001')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'SERVED',
          servedToEmail: 'compliance.head@priyafoods.in',
          notes: 'Notice delivered via digital portal & registered post.',
        });

      expect(patchRes.status).toBe(200);
      expect(patchRes.body.data.status).toBe('SERVED');
      expect(patchRes.body.data.servedToEmail).toBe('compliance.head@priyafoods.in');
    });

    it('returns 36_NOT_FOUND when notice ID does not exist', async () => {
      const res = await request(app)
        .get('/api/v1/b36/notice-non-existent')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('36_NOT_FOUND');
    });
  });
});
