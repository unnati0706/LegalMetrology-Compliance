import request from 'supertest';
import { createApp } from '../../app.js';
import { db } from '../../shared/database/index.js';
import { generateTestToken } from '../../shared/auth/index.js';
import { Inspection, Violation } from '../../shared/types/index.js';

describe('B32 - Violation Trend & Pattern Detection Service', () => {
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

    // Create a series of repeated violations for the same manufacturer across products
    const insp1: Inspection = {
      id: 'insp-pat-01',
      inspectorId: 'usr-inspector-01',
      productName: 'Priya Pickle 500g',
      category: 'Spices & Condiments',
      brand: 'Priya Foods Ltd',
      manufacturerId: 'mfg-priya-foods',
      status: 'FLAGGED',
      ruleVersion: 'PCR-2011-v2.0',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    };

    const insp2: Inspection = {
      id: 'insp-pat-02',
      inspectorId: 'usr-inspector-01',
      productName: 'Priya Mustard Oil 1L',
      category: 'Edible Oils',
      brand: 'Priya Foods Ltd',
      manufacturerId: 'mfg-priya-foods',
      status: 'FLAGGED',
      ruleVersion: 'PCR-2011-v2.0',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    };

    const viol1: Violation = {
      id: 'viol-pat-01',
      inspectionId: 'insp-pat-01',
      checkResultId: 'chk-pat-01',
      ruleId: 'rule-mrp-missing',
      ruleCode: 'PCR-2011-R06-MRP',
      ruleVersion: 'PCR-2011-v2.0',
      legalReference: 'Rule 6(1)(e)',
      violationType: 'MRP Declaration Missing',
      severity: 'CRITICAL',
      explanation: 'Missing MRP',
      status: 'OPEN',
      createdAt: insp1.createdAt,
      updatedAt: insp1.createdAt,
    };

    const viol2: Violation = {
      id: 'viol-pat-02',
      inspectionId: 'insp-pat-02',
      checkResultId: 'chk-pat-02',
      ruleId: 'rule-net-qty-unit',
      ruleCode: 'PCR-2011-R06-NET-QTY',
      ruleVersion: 'PCR-2011-v2.0',
      legalReference: 'Rule 6(1)(c)',
      violationType: 'Invalid Net Quantity Unit',
      severity: 'MAJOR',
      explanation: 'Wrong units used',
      status: 'OPEN',
      createdAt: insp2.createdAt,
      updatedAt: insp2.createdAt,
    };

    db.store.inspections.set(insp1.id, insp1);
    db.store.inspections.set(insp2.id, insp2);
    db.store.violations.set(viol1.id, viol1);
    db.store.violations.set(viol2.id, viol2);
  });

  describe('POST /api/v1/b32 - Trigger Pattern Detection Scan', () => {
    it('detects repeat manufacturer violations across inspection history', async () => {
      const res = await request(app)
        .post('/api/v1/b32')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ lookbackDays: 30, minOccurrencesThreshold: 2 });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.scannedViolationsCount).toBe(2);
      expect(res.body.data.detectedPatterns).toHaveLength(1);
      expect(res.body.data.detectedPatterns[0].entityId).toBe('mfg-priya-foods');
      expect(res.body.data.detectedPatterns[0].occurrenceCount).toBe(2);
      expect(res.body.data.detectedPatterns[0].ruleCodes).toContain('PCR-2011-R06-MRP');
      expect(res.body.data.detectedPatterns[0].ruleCodes).toContain('PCR-2011-R06-NET-QTY');
    });

    it('rejects unauthorized Manufacturer scan trigger with 403', async () => {
      const res = await request(app)
        .post('/api/v1/b32')
        .set('Authorization', `Bearer ${mfgToken}`)
        .send({ lookbackDays: 30 });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('PERMISSION_DENIED');
    });
  });

  describe('GET /api/v1/b32 and PATCH /api/v1/b32/:id', () => {
    it('lists patterns with filters and allows status transition to INVESTIGATING', async () => {
      // First scan
      const scanRes = await request(app)
        .post('/api/v1/b32')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ lookbackDays: 30, minOccurrencesThreshold: 2 });

      const patternId = scanRes.body.data.detectedPatterns[0].id;

      // GET list
      const listRes = await request(app)
        .get('/api/v1/b32?status=ACTIVE')
        .set('Authorization', `Bearer ${inspectorToken}`);
      expect(listRes.status).toBe(200);
      expect(listRes.body.data).toHaveLength(1);

      // PATCH status to INVESTIGATING
      const patchRes = await request(app)
        .patch(`/api/v1/b32/${patternId}`)
        .set('Authorization', `Bearer ${inspectorToken}`)
        .send({
          status: 'INVESTIGATING',
          resolutionNotes: 'Assigned inspection team to audit manufacturing line at Pune facility.',
        });

      expect(patchRes.status).toBe(200);
      expect(patchRes.body.data.status).toBe('INVESTIGATING');

      // Verify Audit log
      const audit = db.store.auditLogs.find(a => a.action === 'UPDATE_PATTERN_STATUS');
      expect(audit).toBeDefined();
    });

    it('returns 32_NOT_FOUND for non-existent pattern ID', async () => {
      const res = await request(app)
        .get('/api/v1/b32/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('32_NOT_FOUND');
    });
  });
});
