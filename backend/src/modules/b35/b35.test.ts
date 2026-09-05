import request from 'supertest';
import { createApp } from '../../app.js';
import { db } from '../../shared/database/index.js';
import { generateTestToken } from '../../shared/auth/index.js';

describe('B35 - Inspect-Next Queue Service', () => {
  const app = createApp();

  const adminToken = generateTestToken({
    id: 'usr-admin-01',
    email: 'admin@legalmetrology.gov.in',
    name: 'Admin User',
    role: 'ADMIN',
  });

  const inspectorToken = generateTestToken({
    id: 'usr-inspector-01',
    email: 'inspector.mumbai@legalmetrology.gov.in',
    name: 'Amit Patel',
    role: 'INSPECTOR',
  });

  const mfgToken = generateTestToken({
    id: 'usr-manufacturer-01',
    email: 'compliance@priyafoods.in',
    name: 'Priya Foods',
    role: 'MANUFACTURER',
  });

  beforeEach(() => {
    db.reset();
  });

  describe('GET /api/v1/b35 - List Prioritized Queue', () => {
    it('returns ranked Inspect-Next queue sorted by priority score', async () => {
      const res = await request(app)
        .get('/api/v1/b35')
        .set('Authorization', `Bearer ${inspectorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
      expect(res.body.data[0].priorityScore).toBeGreaterThanOrEqual(res.body.data[1].priorityScore);
      expect(res.body.data[0].recommendedChecklist).toBeDefined();
    });

    it('filters queue by status QUEUED and riskTier HIGH', async () => {
      const res = await request(app)
        .get('/api/v1/b35?status=QUEUED&riskTier=HIGH')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.every((q: any) => q.status === 'QUEUED' && q.riskTier === 'HIGH')).toBe(true);
    });
  });

  describe('POST /api/v1/b35 - Refresh Queue from Risk Profiles', () => {
    it('generates queue items from high-risk profiles with recommended checklist', async () => {
      const res = await request(app)
        .post('/api/v1/b35')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          region: 'Northern Zone - Delhi NCR',
          minRiskScoreThreshold: 60.0,
          limitItems: 5,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalQueued).toBeGreaterThanOrEqual(2);

      // Verify audit log
      const audit = db.store.auditLogs.find(a => a.action === 'REFRESH_INSPECT_NEXT_QUEUE');
      expect(audit).toBeDefined();
    });

    it('rejects unauthorized Manufacturer from refreshing queue with 403', async () => {
      const res = await request(app)
        .post('/api/v1/b35')
        .set('Authorization', `Bearer ${mfgToken}`)
        .send({ minRiskScoreThreshold: 50 });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('PERMISSION_DENIED');
    });
  });

  describe('PATCH /api/v1/b35/:id - Assignment and Workflow Transitions', () => {
    it('assigns queue item to an inspector', async () => {
      const res = await request(app)
        .patch('/api/v1/b35/queue-001')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          assignedInspectorId: 'usr-inspector-01',
          assignedInspectorName: 'Amit Patel',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('ASSIGNED');
      expect(res.body.data.assignedInspectorId).toBe('usr-inspector-01');
      expect(res.body.data.assignedInspectorName).toBe('Amit Patel');
    });

    it('allows deferring inspection with valid reason', async () => {
      const res = await request(app)
        .patch('/api/v1/b35/queue-002')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .send({
          deferredReason: 'Manufacturing plant temporarily closed for annual boiler maintenance until next Monday.',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('DEFERRED');
      expect(res.body.data.deferredReason).toContain('boiler maintenance');
    });

    it('returns 35_NOT_FOUND for non-existent queue item', async () => {
      const res = await request(app)
        .get('/api/v1/b35/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('35_NOT_FOUND');
    });
  });
});
