import request from 'supertest';
import { createApp } from '../../app.js';
import { db } from '../../shared/database/index.js';
import { generateTestToken } from '../../shared/auth/index.js';

describe('B37 - Manufacturer Appeal & Rectification Service', () => {
  const app = createApp();

  const adminToken = generateTestToken({
    id: 'usr-admin-01',
    email: 'admin@legalmetrology.gov.in',
    name: 'Rajesh Sharma',
    role: 'ADMIN',
  });

  const supervisorToken = generateTestToken({
    id: 'usr-supervisor-01',
    email: 'supervisor@legalmetrology.gov.in',
    name: 'Sunita Verma',
    role: 'SUPERVISOR',
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

  describe('GET /api/v1/b37 - List & Query Appeals', () => {
    it('returns seeded appeals with status and grounds', async () => {
      const res = await request(app)
        .get('/api/v1/b37')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0].appealNumber).toBe('LM/APL/2026/0019');
    });

    it('filters appeals by status and noticeId', async () => {
      const res = await request(app)
        .get('/api/v1/b37?status=SUBMITTED&noticeId=notice-001')
        .set('Authorization', `Bearer ${manufacturerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].noticeId).toBe('notice-001');
    });
  });

  describe('POST /api/v1/b37 - Submit Appeal with Evidence', () => {
    it('allows Manufacturer to submit an appeal with corrective action plan and evidence', async () => {
      const payload = {
        noticeId: 'notice-001',
        manufacturerId: 'mfg-priya-foods',
        appellantName: 'Priya Foods Senior Legal Counsel',
        groundsForAppeal: 'Technical printer misalignment during packaging roll changeover; zero intent to mislead consumers.',
        correctiveActionPlan: 'Installed high-speed automated machine vision sensors on line 4 and recalled batch #9921.',
        rectificationEvidence: [
          {
            evidenceType: 'REVISED_ARTWORK',
            documentUrl: 'https://storage.legalmetrology.gov.in/rectifications/proof_sensor_line4.pdf',
            description: 'Automated vision sensor calibration certificate.',
          }
        ]
      };

      const res = await request(app)
        .post('/api/v1/b37')
        .set('Authorization', `Bearer ${manufacturerToken}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.appealNumber).toMatch(/^LM\/APL\/\d{4}\/\d{4}$/);
      expect(res.body.data.status).toBe('SUBMITTED');

      // Check that notice status was updated to RESPONDED
      const noticeRes = await request(app)
        .get('/api/v1/b36/notice-001')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(noticeRes.body.data.status).toBe('RESPONDED');
    });

    it('returns 36_NOT_FOUND when submitting appeal for non-existent notice', async () => {
      const payload = {
        noticeId: 'notice-does-not-exist',
        manufacturerId: 'mfg-priya-foods',
        appellantName: 'Legal Counsel',
        groundsForAppeal: 'Valid grounds for non-existent notice',
        correctiveActionPlan: 'Detailed action plan for non-existent notice',
      };

      const res = await request(app)
        .post('/api/v1/b37')
        .set('Authorization', `Bearer ${manufacturerToken}`)
        .send(payload);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('36_NOT_FOUND');
    });
  });

  describe('PATCH /api/v1/b37/:id - Legal Officer Review', () => {
    it('allows Supervisor to accept appeal with penalty mitigation', async () => {
      const res = await request(app)
        .patch('/api/v1/b37/appeal-001')
        .set('Authorization', `Bearer ${supervisorToken}`)
        .send({
          decision: 'MITIGATE',
          decisionNotes: 'Rectification evidence verified. 50% compounding penalty mitigation approved under Rule 33.',
          penaltyMitigationPercent: 50,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('MITIGATED');
      expect(res.body.data.decision).toBe('MITIGATE');
      expect(res.body.data.penaltyMitigationPercent).toBe(50);
      expect(res.body.data.reviewedBy).toBe('usr-supervisor-01');
    });

    it('rejects unprivileged Inspector from deciding appeal with 403', async () => {
      const res = await request(app)
        .patch('/api/v1/b37/appeal-001')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .send({
          decision: 'ACCEPT',
          decisionNotes: 'Inspector attempting to accept appeal.',
        });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('PERMISSION_DENIED');
    });
  });
});
