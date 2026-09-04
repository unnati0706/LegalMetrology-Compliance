import request from 'supertest';
import { createApp } from '../../app.js';
import { db } from '../../shared/database/index.js';
import { generateTestToken } from '../../shared/auth/index.js';
import { Inspection, Violation } from '../../shared/types/index.js';

describe('B34 - Risk Scoring Engine', () => {
  const app = createApp();

  const adminToken = generateTestToken({
    id: 'usr-admin-01',
    email: 'admin@legalmetrology.gov.in',
    name: 'Admin User',
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

    // Create realistic inspections with multiple violations for risk scoring verification
    const insp: Inspection = {
      id: 'insp-risk-01',
      inspectorId: 'usr-inspector-01',
      productName: 'Priya Pure Mustard Oil',
      category: 'Edible Oils',
      brand: 'Priya Foods Ltd',
      manufacturerId: 'mfg-priya-foods',
      status: 'FLAGGED',
      ruleVersion: 'PCR-2011-v2.0',
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    };

    const v1: Violation = {
      id: 'viol-risk-01',
      inspectionId: insp.id,
      checkResultId: 'chk-01',
      ruleId: 'rule-net-qty',
      ruleCode: 'PCR-2011-R06-NET-QTY',
      ruleVersion: 'PCR-2011-v2.0',
      legalReference: 'Rule 6(1)(c)',
      violationType: 'Net Quantity Missing',
      severity: 'CRITICAL',
      explanation: 'Net quantity missing',
      status: 'OPEN',
      createdAt: insp.createdAt,
      updatedAt: insp.createdAt,
    };

    const v2: Violation = {
      id: 'viol-risk-02',
      inspectionId: insp.id,
      checkResultId: 'chk-02',
      ruleId: 'rule-mrp',
      ruleCode: 'PCR-2011-R06-MRP',
      ruleVersion: 'PCR-2011-v2.0',
      legalReference: 'Rule 6(1)(e)',
      violationType: 'MRP Missing',
      severity: 'CRITICAL',
      explanation: 'MRP missing',
      status: 'OPEN',
      createdAt: insp.createdAt,
      updatedAt: insp.createdAt,
    };

    db.store.inspections.set(insp.id, insp);
    db.store.violations.set(v1.id, v1);
    db.store.violations.set(v2.id, v2);
  });

  describe('GET /api/v1/b34 - Query Risk Profiles', () => {
    it('returns seeded risk profiles with factor breakdowns', async () => {
      const res = await request(app)
        .get('/api/v1/b34')
        .set('Authorization', `Bearer ${inspectorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
      expect(res.body.data[0].factorBreakdown).toBeDefined();
    });

    it('filters risk profiles by risk tier and minimum score', async () => {
      const res = await request(app)
        .get('/api/v1/b34?riskTier=CRITICAL&minScore=70')
        .set('Authorization', `Bearer ${mfgToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.every((r: any) => r.riskTier === 'CRITICAL' && r.riskScore >= 70)).toBe(true);
    });
  });

  describe('POST /api/v1/b34 - Compute Risk Profile', () => {
    it('calculates deterministic explainable risk score with multi-factor weighting', async () => {
      const payload = {
        entityId: 'mfg-priya-foods',
        entityType: 'MANUFACTURER',
        entityName: 'Priya Foods Ltd (Edible Oil Division)',
        lookbackDays: 60,
      };

      const res = await request(app)
        .post('/api/v1/b34')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.data.riskScore).toBeGreaterThan(50);
      expect(res.body.data.factorBreakdown).toHaveLength(4);
      expect(res.body.data.explanation).toContain('Priya Foods Ltd');

      // Verify audit log entry
      const audit = db.store.auditLogs.find(a => a.action === 'COMPUTE_RISK_PROFILE');
      expect(audit).toBeDefined();
    });

    it('rejects unprivileged Inspector from computing risk with 403', async () => {
      const res = await request(app)
        .post('/api/v1/b34')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .send({
          entityId: 'mfg-priya-foods',
          entityType: 'MANUFACTURER',
          entityName: 'Priya Foods Ltd',
        });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('PERMISSION_DENIED');
    });
  });

  describe('PATCH /api/v1/b34/:id - Supervisor Override', () => {
    it('allows Supervisor to manually adjust risk score with mandatory audit reason', async () => {
      const res = await request(app)
        .patch('/api/v1/b34/risk-mfg-001')
        .set('Authorization', `Bearer ${supervisorToken}`)
        .send({
          riskScore: 88.0,
          riskTier: 'CRITICAL',
          overrideReason: 'Escalated due to direct consumer court notice regarding underweight packaging',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.riskScore).toBe(88.0);
      expect(res.body.data.riskTier).toBe('CRITICAL');
      expect(res.body.data.isOverridden).toBe(true);
      expect(res.body.data.overriddenBy).toBe('usr-supervisor-01');

      // Verify audit log entry with reason
      const audit = db.store.auditLogs.find(a => a.action === 'OVERRIDE_RISK_PROFILE');
      expect(audit).toBeDefined();
      expect(audit?.reason).toContain('consumer court');
    });

    it('rejects override without detailed reason with 400 VALIDATION_ERROR', async () => {
      const res = await request(app)
        .patch('/api/v1/b34/risk-mfg-001')
        .set('Authorization', `Bearer ${supervisorToken}`)
        .send({
          riskScore: 88.0,
          riskTier: 'CRITICAL',
          overrideReason: 'short', // less than 10 characters
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
