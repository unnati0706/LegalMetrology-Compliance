import request from 'supertest';
import { createApp } from '../../app.js';
import { db } from '../../shared/database/index.js';
import { generateTestToken } from '../../shared/auth/index.js';

describe('B38 - Compounding & Penalty Assessment Calculator', () => {
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

  describe('GET /api/v1/b38 - List Penalties', () => {
    it('returns seeded penalty assessments with statutory calculations', async () => {
      const res = await request(app)
        .get('/api/v1/b38')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data[0].assessmentNumber).toBe('LM/FIN/2026/PA-0881');
      expect(res.body.data[0].totalAmount).toBe(25000);
    });

    it('filters penalties by manufacturer and status', async () => {
      const res = await request(app)
        .get('/api/v1/b38?status=ASSESSED&manufacturerId=mfg-priya-foods')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
    });
  });

  describe('POST /api/v1/b38 - Assess Penalty', () => {
    it('calculates repeat offense penalty with statutory multipliers', async () => {
      const payload = {
        inspectionId: 'insp-sample-01',
        noticeId: 'notice-001',
        manufacturerId: 'mfg-priya-foods',
        manufacturerName: 'Priya Foods Ltd',
        offenseType: 'SECOND_OFFENSE',
        sectionsViolated: [
          'Section 36(1) - Non-standard package declarations',
          'Section 39 - Offenses by companies'
        ],
        compoundingApplicable: true,
      };

      const res = await request(app)
        .post('/api/v1/b38')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      // Section 36(1) base 25000 * 2 = 50000; Section 39 base 20000 * 2 = 40000. Total = 90000
      expect(res.body.data.totalAmount).toBe(90000);
      expect(res.body.data.compoundingFee).toBe(90000);
      expect(res.body.data.breakdown.length).toBe(2);
      expect(res.body.data.offenseType).toBe('SECOND_OFFENSE');
    });

    it('rejects unprivileged Inspector from assessing penalty with 403', async () => {
      const payload = {
        inspectionId: 'insp-sample-01',
        manufacturerId: 'mfg-priya-foods',
        manufacturerName: 'Priya Foods Ltd',
        sectionsViolated: ['Section 36(1)'],
      };

      const res = await request(app)
        .post('/api/v1/b38')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .send(payload);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('PERMISSION_DENIED');
    });
  });

  describe('PATCH /api/v1/b38/:id - Record Payment & Compounding', () => {
    it('records payment and generates official receipt number', async () => {
      const res = await request(app)
        .patch('/api/v1/b38/pen-001')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'PAID',
          paymentReference: 'SBI-EPAY-99882211',
          notes: 'Online treasury remittance verified.',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('PAID');
      expect(res.body.data.paymentReference).toBe('SBI-EPAY-99882211');
      expect(res.body.data.receiptNumber).toMatch(/^LM\/REC\/\d{4}\/\d{4}$/);
      expect(res.body.data.paidAt).toBeDefined();
    });

    it('allows escalating dispute to court', async () => {
      const res = await request(app)
        .patch('/api/v1/b38/pen-001')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'ESCALATED_TO_COURT',
          courtCaseReference: 'CC/DL/2026/7741',
          notes: 'Refusal to compound; referred to CJM Court.',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('ESCALATED_TO_COURT');
      expect(res.body.data.courtCaseReference).toBe('CC/DL/2026/7741');
    });
  });
});
