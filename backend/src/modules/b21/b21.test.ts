import request from 'supertest';
import { app } from '../../app.js';
import { db } from '../../shared/database/index.js';
import { generateToken } from '../../shared/auth/index.js';

describe('Module B21: Declaration Completeness & Format Validation Engine', () => {
  const inspectorToken = generateToken({
    id: 'usr-inspector-01',
    email: 'inspector@legalmetrology.gov.in',
    name: 'Amit Patel',
    role: 'INSPECTOR',
  });

  const manufacturerToken = generateToken({
    id: 'usr-manufacturer-01',
    email: 'mfg@priyafoods.in',
    name: 'Priya Foods',
    role: 'MANUFACTURER',
  });

  beforeEach(() => {
    db.reset();
  });

  describe('Deterministic Compliance Logic (Unit & Integration)', () => {
    it('should PASS when all mandatory declarations are present with high confidence', async () => {
      const payload = {
        inspectionId: 'insp-b21-test-01',
        isImported: false,
        declarations: [
          { field: 'manufacturer_packer_importer', value: 'Manufactured by Priya Foods Ltd, Hyderabad 500001', confidence: 0.95 },
          { field: 'generic_name', value: 'Mango Pickle in Oil', confidence: 0.96 },
          { field: 'net_quantity', value: '500 g', confidence: 0.98 },
          { field: 'mfg_date', value: '01/2026', confidence: 0.94 },
          { field: 'mrp', value: '₹140.00 incl. of all taxes', confidence: 0.95 },
          { field: 'consumer_care', value: 'care@priyafoods.in, 1800-425-9999', confidence: 0.93 },
        ]
      };

      const res = await request(app)
        .post('/api/v1/b21')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .send(payload);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.summary.totalChecks).toBe(6);
      expect(res.body.data.summary.passed).toBe(6);
      expect(res.body.data.summary.flagged).toBe(0);
      expect(res.body.data.summary.manualReview).toBe(0);

      // Verify Audit Log was recorded
      const logs = db.store.auditLogs.filter(l => l.objectId === 'insp-b21-test-01');
      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0].action).toBe('B21_COMPLETENESS_EVALUATED');
    });

    it('should FLAG missing mandatory declarations (e.g. missing consumer_care and mrp)', async () => {
      const payload = {
        inspectionId: 'insp-b21-test-02',
        isImported: false,
        declarations: [
          { field: 'manufacturer_packer_importer', value: 'Manufactured by Priya Foods Ltd, Hyderabad 500001', confidence: 0.95 },
          { field: 'generic_name', value: 'Mango Pickle', confidence: 0.96 },
          { field: 'net_quantity', value: '500 g', confidence: 0.98 },
          { field: 'mfg_date', value: '01/2026', confidence: 0.94 },
          // Missing mrp and consumer_care
        ]
      };

      const res = await request(app)
        .post('/api/v1/b21')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .send(payload);

      expect(res.status).toBe(200);
      expect(res.body.data.summary.flagged).toBe(2);
      
      const flaggedResults = res.body.data.results.filter((r: any) => r.status === 'FLAG');
      expect(flaggedResults.length).toBe(2);
      expect(flaggedResults.some((r: any) => r.ruleCode === 'PCR-2011-R06-1-E')).toBe(true);
      expect(flaggedResults.some((r: any) => r.ruleCode === 'PCR-2011-R06-1-G')).toBe(true);
    });

    it('should route to MANUAL_REVIEW when confidence is below threshold (< 0.75)', async () => {
      const payload = {
        inspectionId: 'insp-b21-test-03',
        isImported: false,
        declarations: [
          { field: 'manufacturer_packer_importer', value: 'Priya Foods', confidence: 0.62 }, // Low confidence
          { field: 'generic_name', value: 'Mango Pickle', confidence: 0.95 },
          { field: 'net_quantity', value: '500 g', confidence: 0.95 },
          { field: 'mfg_date', value: '01/2026', confidence: 0.95 },
          { field: 'mrp', value: '₹140.00 incl. of all taxes', confidence: 0.95 },
          { field: 'consumer_care', value: 'care@priyafoods.in', confidence: 0.95 },
        ]
      };

      const res = await request(app)
        .post('/api/v1/b21')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .send(payload);

      expect(res.status).toBe(200);
      expect(res.body.data.summary.manualReview).toBe(1);
      const reviewResult = res.body.data.results.find((r: any) => r.status === 'MANUAL_REVIEW');
      expect(reviewResult).toBeDefined();
      expect(reviewResult.ruleCode).toBe('PCR-2011-R06-1-A');
    });

    it('should require Country of Origin when isImported is true', async () => {
      const payload = {
        inspectionId: 'insp-b21-imported-01',
        isImported: true,
        declarations: [
          { field: 'manufacturer_packer_importer', value: 'Imported by Global Traders Delhi 110001', confidence: 0.95 },
          { field: 'generic_name', value: 'Olive Oil', confidence: 0.95 },
          { field: 'net_quantity', value: '1 l', confidence: 0.95 },
          { field: 'mfg_date', value: '01/2026', confidence: 0.95 },
          { field: 'mrp', value: '₹950.00 incl. of all taxes', confidence: 0.95 },
          { field: 'consumer_care', value: 'help@globaltraders.in', confidence: 0.95 },
          // Missing country_of_origin
        ]
      };

      const res = await request(app)
        .post('/api/v1/b21')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .send(payload);

      expect(res.status).toBe(200);
      expect(res.body.data.summary.totalChecks).toBe(7);
      const originResult = res.body.data.results.find((r: any) => r.ruleCode === 'PCR-2011-R06-ORIGIN');
      expect(originResult.status).toBe('FLAG');
    });
  });

  describe('Security, RBAC, and Validation', () => {
    it('should return 403 PERMISSION_DENIED when MANUFACTURER attempts to trigger evaluation', async () => {
      const res = await request(app)
        .post('/api/v1/b21')
        .set('Authorization', `Bearer ${manufacturerToken}`)
        .send({
          inspectionId: 'insp-01',
          declarations: [{ field: 'mrp', value: '₹100' }]
        });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('PERMISSION_DENIED');
    });

    it('should return 400 VALIDATION_ERROR on invalid payload', async () => {
      const res = await request(app)
        .post('/api/v1/b21')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .send({
          // missing inspectionId
          declarations: []
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 404 21_NOT_FOUND when requesting non-existent check result', async () => {
      const res = await request(app)
        .get('/api/v1/b21/non-existent-id')
        .set('Authorization', `Bearer ${inspectorToken}`);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('21_NOT_FOUND');
    });
  });

  describe('Idempotency and Override Support', () => {
    it('should return cached response when Idempotency-Key header is repeated', async () => {
      const payload = {
        inspectionId: 'insp-b21-idemp-01',
        declarations: [
          { field: 'generic_name', value: 'Wheat Flour', confidence: 0.95 }
        ]
      };

      const res1 = await request(app)
        .post('/api/v1/b21')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .set('Idempotency-Key', 'idemp-key-b21-123')
        .send(payload);

      expect(res1.status).toBe(200);

      const res2 = await request(app)
        .post('/api/v1/b21')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .set('Idempotency-Key', 'idemp-key-b21-123')
        .send(payload);

      expect(res2.status).toBe(200);
      expect(res2.body).toEqual(res1.body);
    });

    it('should support manual override of check result with stated reason and audit entry', async () => {
      // First create check result
      const evalRes = await request(app)
        .post('/api/v1/b21')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .send({
          inspectionId: 'insp-b21-override',
          declarations: [{ field: 'generic_name', value: 'Salt', confidence: 0.9 }]
        });

      const flaggedId = evalRes.body.data.results.find((r: any) => r.status === 'FLAG').id;

      const overrideRes = await request(app)
        .patch(`/api/v1/b21/${flaggedId}`)
        .set('Authorization', `Bearer ${inspectorToken}`)
        .send({
          status: 'PASS',
          overrideReason: 'Physical commodity package inspected manually; declaration verified on rear fold.'
        });

      expect(overrideRes.status).toBe(200);
      expect(overrideRes.body.data.status).toBe('PASS');
      expect(overrideRes.body.data.isOverridden).toBe(true);
      expect(overrideRes.body.data.overrideReason).toContain('Physical commodity package inspected');

      // Check audit log
      const auditLog = db.store.auditLogs.find(l => l.objectId === flaggedId && l.action === 'B21_CHECK_RESULT_OVERRIDE');
      expect(auditLog).toBeDefined();
      expect(auditLog?.reason).toContain('Physical commodity package inspected');
    });
  });
});
