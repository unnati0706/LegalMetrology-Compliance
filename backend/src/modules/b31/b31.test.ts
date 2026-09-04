import request from 'supertest';
import { createApp } from '../../app.js';
import { db } from '../../shared/database/index.js';
import { generateTestToken } from '../../shared/auth/index.js';
import { Inspection, Violation } from '../../shared/types/index.js';

describe('B31 - Analytics Aggregation Service', () => {
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

  const manufacturerToken = generateTestToken({
    id: 'usr-manufacturer-01',
    email: 'compliance@priyafoods.in',
    name: 'Priya Foods',
    role: 'MANUFACTURER',
  });

  beforeEach(() => {
    db.reset();

    // Populate test inspections and violations
    const insp1: Inspection = {
      id: 'insp-b31-01',
      inspectorId: 'usr-inspector-01',
      productName: 'Priya Sunflower Oil 1L',
      category: 'Edible Oils',
      brand: 'Priya Gold',
      manufacturerId: 'mfg-priya-foods',
      status: 'FLAGGED',
      ruleVersion: 'PCR-2011-v2.0',
      createdAt: new Date('2026-08-01T10:00:00Z'),
      updatedAt: new Date('2026-08-01T10:00:00Z'),
    };

    const insp2: Inspection = {
      id: 'insp-b31-02',
      inspectorId: 'usr-inspector-01',
      productName: 'Tata Salt 1kg',
      category: 'Spices & Condiments',
      brand: 'Tata',
      manufacturerId: 'mfg-tata-consumer',
      status: 'COMPLETED',
      ruleVersion: 'PCR-2011-v2.0',
      createdAt: new Date('2026-08-05T11:00:00Z'),
      updatedAt: new Date('2026-08-05T11:00:00Z'),
    };

    const viol1: Violation = {
      id: 'viol-b31-01',
      inspectionId: 'insp-b31-01',
      checkResultId: 'chk-01',
      ruleId: 'rule-mrp-missing',
      ruleCode: 'PCR-2011-R06-MRP',
      ruleVersion: 'PCR-2011-v2.0',
      legalReference: 'Rule 6(1)(e)',
      violationType: 'MRP Declaration Missing',
      severity: 'CRITICAL',
      explanation: 'Missing MRP declaration',
      status: 'OPEN',
      createdAt: new Date('2026-08-01T10:05:00Z'),
      updatedAt: new Date('2026-08-01T10:05:00Z'),
    };

    db.store.inspections.set(insp1.id, insp1);
    db.store.inspections.set(insp2.id, insp2);
    db.store.violations.set(viol1.id, viol1);
  });

  describe('GET /api/v1/b31 - Aggregation & KPIs', () => {
    it('computes accurate compliance rate and category stats for all roles', async () => {
      const res = await request(app)
        .get('/api/v1/b31')
        .set('Authorization', `Bearer ${inspectorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.kpis.totalInspections).toBe(2);
      expect(res.body.data.kpis.nonCompliantCount).toBe(1);
      expect(res.body.data.kpis.compliantCount).toBe(1);
      expect(res.body.data.kpis.overallComplianceRate).toBe(50.0);
      expect(res.body.data.kpis.criticalViolations).toBe(1);
      expect(res.body.data.kpis.topViolatedRules).toHaveLength(1);
      expect(res.body.data.kpis.topViolatedRules[0].ruleCode).toBe('PCR-2011-R06-MRP');
    });

    it('filters metrics by category accurately', async () => {
      const res = await request(app)
        .get('/api/v1/b31?category=Spices%20%26%20Condiments')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.kpis.totalInspections).toBe(1);
      expect(res.body.data.kpis.totalViolations).toBe(0);
      expect(res.body.data.kpis.overallComplianceRate).toBe(100.0);
    });
  });

  describe('POST /api/v1/b31 - Snapshot Generation', () => {
    it('allows Admin to create an analytics snapshot with audit logging and idempotency', async () => {
      const payload = {
        periodType: 'MONTHLY',
        periodKey: '2026-08',
      };

      const res = await request(app)
        .post('/api/v1/b31')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Idempotency-Key', 'idem-snap-001')
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.periodKey).toBe('2026-08');
      expect(res.body.data.metricsSummary.totalInspections).toBe(2);

      // Verify Audit log exists
      const audit = db.store.auditLogs.find(a => a.action === 'GENERATE_ANALYTICS_SNAPSHOT');
      expect(audit).toBeDefined();

      // Test idempotency
      const res2 = await request(app)
        .post('/api/v1/b31')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Idempotency-Key', 'idem-snap-001')
        .send(payload);

      expect(res2.status).toBe(201);
      expect(res2.body.data.id).toBe(res.body.data.id);
    });

    it('rejects unauthorized Manufacturer from creating snapshots with 403', async () => {
      const res = await request(app)
        .post('/api/v1/b31')
        .set('Authorization', `Bearer ${manufacturerToken}`)
        .send({ periodType: 'MONTHLY', periodKey: '2026-08' });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('PERMISSION_DENIED');
    });

    it('returns VALIDATION_ERROR (400) when missing periodKey', async () => {
      const res = await request(app)
        .post('/api/v1/b31')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ periodType: 'MONTHLY' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/v1/b31/:id and PATCH /api/v1/b31/:id', () => {
    it('retrieves and updates snapshot by id', async () => {
      // Create a snapshot
      const createRes = await request(app)
        .post('/api/v1/b31')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ periodType: 'MONTHLY', periodKey: '2026-08' });

      const snapId = createRes.body.data.id;

      // GET by id
      const getRes = await request(app)
        .get(`/api/v1/b31/${snapId}`)
        .set('Authorization', `Bearer ${inspectorToken}`);
      expect(getRes.status).toBe(200);
      expect(getRes.body.data.periodKey).toBe('2026-08');

      // PATCH archive
      const patchRes = await request(app)
        .patch(`/api/v1/b31/${snapId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'ARCHIVED', notes: 'Archived for quarterly review' });

      expect(patchRes.status).toBe(200);
      expect(patchRes.body.data.status).toBe('ARCHIVED');
    });

    it('returns 31_NOT_FOUND (404) for non-existent snapshot', async () => {
      const res = await request(app)
        .get('/api/v1/b31/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('31_NOT_FOUND');
    });
  });
});
