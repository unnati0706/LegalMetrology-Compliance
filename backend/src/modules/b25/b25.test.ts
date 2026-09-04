import request from 'supertest';
import { app } from '../../app.js';
import { db } from '../../shared/database/index.js';
import { generateToken } from '../../shared/auth/index.js';

describe('Module B25: Violation Generation & Evidence Mapping Service', () => {
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

  describe('Violation Synthesis and Evidence Mapping', () => {
    it('should convert FLAGGED check results into formal Violation records linked to evidence', async () => {
      // 1. Seed a piece of Evidence
      const evidenceId = 'evi-pkg-front-01';
      db.store.evidence.set(evidenceId, {
        id: evidenceId,
        inspectionId: 'insp-b25-01',
        imageUrl: 'https://s3.ap-south-1.amazonaws.com/evidence/pkg-front.jpg',
        storageKey: 'evidence/pkg-front.jpg',
        packageSide: 'PDP',
        mimeType: 'image/jpeg',
        fileSizeBytes: 204800,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // 2. Run B21 completeness check with missing mandatory fields to generate FLAG check results
      await request(app)
        .post('/api/v1/b21')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .send({
          inspectionId: 'insp-b25-01',
          declarations: [
            { field: 'generic_name', value: 'Tomato Sauce', confidence: 0.95 },
            // Missing all other mandatory fields
          ]
        });

      // Also create a check result linked to evidence
      const ruleMrp = Array.from(db.store.rules.values()).find(r => r.ruleCode === 'PCR-2011-R06-MRP-FORMAT')!;
      db.store.checkResults.set('chk-flag-mrp', {
        id: 'chk-flag-mrp',
        inspectionId: 'insp-b25-01',
        ruleId: ruleMrp.id,
        ruleCode: ruleMrp.ruleCode,
        ruleVersion: ruleMrp.version,
        status: 'FLAG',
        confidence: 0.95,
        explanation: 'MRP declaration does not state inclusive of all taxes.',
        evidenceId,
        boundingBox: { ymin: 0.7, xmin: 0.6, ymax: 0.85, xmax: 0.95 },
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // 3. Trigger B25 Violation Generation
      const genRes = await request(app)
        .post('/api/v1/b25')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .send({
          inspectionId: 'insp-b25-01',
        });

      expect(genRes.status).toBe(200);
      expect(genRes.body.success).toBe(true);
      expect(genRes.body.data.violations.length).toBeGreaterThan(0);

      // Verify mapped fields
      const mrpViolation = genRes.body.data.violations.find((v: any) => v.ruleCode === 'PCR-2011-R06-MRP-FORMAT');
      expect(mrpViolation).toBeDefined();
      expect(mrpViolation.severity).toBe('CRITICAL');
      expect(mrpViolation.evidenceId).toBe(evidenceId);
      expect(mrpViolation.packageSide).toBe('PDP');
      expect(mrpViolation.boundingBox).toEqual({ ymin: 0.7, xmin: 0.6, ymax: 0.85, xmax: 0.95 });
      expect(mrpViolation.status).toBe('OPEN');

      // Check Audit Log was recorded
      const auditEntry = db.store.auditLogs.find(l => l.action === 'B25_VIOLATIONS_GENERATED');
      expect(auditEntry).toBeDefined();
    });

    it('should be idempotent and not duplicate violations on repeated calls', async () => {
      const rule = Array.from(db.store.rules.values())[0];
      db.store.checkResults.set('chk-dup-test', {
        id: 'chk-dup-test',
        inspectionId: 'insp-idemp-01',
        ruleId: rule.id,
        ruleCode: rule.ruleCode,
        ruleVersion: rule.version,
        status: 'FLAG',
        confidence: 0.95,
        explanation: 'Missing declaration',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // First run
      const res1 = await request(app)
        .post('/api/v1/b25')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .send({ inspectionId: 'insp-idemp-01' });

      expect(res1.body.data.generatedCount).toBe(1);
      expect(res1.body.data.existingCount).toBe(0);

      // Second run
      const res2 = await request(app)
        .post('/api/v1/b25')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .send({ inspectionId: 'insp-idemp-01' });

      expect(res2.body.data.generatedCount).toBe(0);
      expect(res2.body.data.existingCount).toBe(1);
      expect(res2.body.data.violations.length).toBe(1);
    });

    it('should retrieve a single violation with rule and evidence metadata', async () => {
      const rule = Array.from(db.store.rules.values())[0];
      const evidenceId = 'evi-b25-fetch';
      db.store.evidence.set(evidenceId, {
        id: evidenceId,
        inspectionId: 'insp-b25-fetch',
        imageUrl: 'https://s3.ap-south-1.amazonaws.com/evidence/fetch.jpg',
        storageKey: 'evidence/fetch.jpg',
        packageSide: 'FRONT',
        mimeType: 'image/jpeg',
        fileSizeBytes: 10240,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const violation = db.store.violations.set('viol-single-01', {
        id: 'viol-single-01',
        inspectionId: 'insp-b25-fetch',
        checkResultId: 'chk-fetch',
        ruleId: rule.id,
        ruleCode: rule.ruleCode,
        ruleVersion: rule.version,
        legalReference: rule.legalReference,
        violationType: rule.title,
        severity: 'CRITICAL',
        explanation: 'Mandatory declaration missing.',
        evidenceId,
        packageSide: 'FRONT',
        status: 'OPEN',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request(app)
        .get('/api/v1/b25/viol-single-01')
        .set('Authorization', `Bearer ${inspectorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe('viol-single-01');
      expect(res.body.data.rule).toBeDefined();
      expect(res.body.data.rule.ruleCode).toBe(rule.ruleCode);
      expect(res.body.data.evidence).toBeDefined();
      expect(res.body.data.evidence.packageSide).toBe('FRONT');
    });

    it('should update violation status to RESOLVED with notes and audit record', async () => {
      const rule = Array.from(db.store.rules.values())[0];
      db.store.violations.set('viol-update-01', {
        id: 'viol-update-01',
        inspectionId: 'insp-update',
        checkResultId: 'chk-update',
        ruleId: rule.id,
        ruleCode: rule.ruleCode,
        ruleVersion: rule.version,
        legalReference: rule.legalReference,
        violationType: rule.title,
        severity: 'MAJOR',
        explanation: 'Explanation text',
        status: 'OPEN',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request(app)
        .patch('/api/v1/b25/viol-update-01')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .send({
          status: 'RESOLVED',
          resolutionNotes: 'Manufacturer provided corrected artwork with compliant MRP and tax declaration.',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('RESOLVED');
      expect(res.body.data.resolutionNotes).toContain('Manufacturer provided corrected artwork');

      // Verify audit log
      const log = db.store.auditLogs.find(l => l.objectId === 'viol-update-01');
      expect(log).toBeDefined();
      expect(log?.action).toBe('B25_VIOLATION_STATUS_UPDATED');
    });

    it('should return 409 INVALID_STATE_TRANSITION when attempting to reopen an already resolved violation', async () => {
      const rule = Array.from(db.store.rules.values())[0];
      db.store.violations.set('viol-resolved-01', {
        id: 'viol-resolved-01',
        inspectionId: 'insp-trans',
        checkResultId: 'chk-trans',
        ruleId: rule.id,
        ruleCode: rule.ruleCode,
        ruleVersion: rule.version,
        legalReference: rule.legalReference,
        violationType: rule.title,
        severity: 'MAJOR',
        explanation: 'Resolved issue',
        status: 'RESOLVED',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request(app)
        .patch('/api/v1/b25/viol-resolved-01')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .send({
          status: 'OPEN',
          resolutionNotes: 'Attempting invalid state reopen',
        });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('INVALID_STATE_TRANSITION');
    });

    it('should reject unauthorized roles with 403 PERMISSION_DENIED', async () => {
      const res = await request(app)
        .post('/api/v1/b25')
        .set('Authorization', `Bearer ${manufacturerToken}`)
        .send({ inspectionId: 'insp-01' });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('PERMISSION_DENIED');
    });

    it('should return 404 25_NOT_FOUND when violation does not exist', async () => {
      const res = await request(app)
        .get('/api/v1/b25/unknown-violation-id')
        .set('Authorization', `Bearer ${inspectorToken}`);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('25_NOT_FOUND');
    });
  });
});
