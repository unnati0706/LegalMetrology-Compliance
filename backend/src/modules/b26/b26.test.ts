import request from 'supertest';
import { app } from '../../app.js';
import { db } from '../../shared/database/index.js';
import { generateToken } from '../../shared/auth/index.js';

describe('Module B26: Manual Review & Override Workflow Service', () => {
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

  it('should list check results waiting in manual review queue', async () => {
    const rule = Array.from(db.store.rules.values())[0];
    db.store.checkResults.set('chk-rev-01', {
      id: 'chk-rev-01',
      inspectionId: 'insp-b26-01',
      ruleId: rule.id,
      ruleCode: rule.ruleCode,
      ruleVersion: rule.version,
      status: 'MANUAL_REVIEW',
      confidence: 0.65,
      explanation: 'Low OCR confidence for declaration.',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const res = await request(app)
      .get('/api/v1/b26?status=MANUAL_REVIEW')
      .set('Authorization', `Bearer ${inspectorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].id).toBe('chk-rev-01');
    expect(res.body.data[0].rule).toBeDefined();
  });

  it('should allow inspector to CONFIRM_PASS with mandatory reason and audit entry', async () => {
    const rule = Array.from(db.store.rules.values())[0];
    db.store.checkResults.set('chk-rev-02', {
      id: 'chk-rev-02',
      inspectionId: 'insp-b26-02',
      ruleId: rule.id,
      ruleCode: rule.ruleCode,
      ruleVersion: rule.version,
      status: 'MANUAL_REVIEW',
      confidence: 0.60,
      explanation: 'Low OCR confidence on date declaration.',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const res = await request(app)
      .patch('/api/v1/b26/chk-rev-02')
      .set('Authorization', `Bearer ${inspectorToken}`)
      .send({
        resolution: 'CONFIRM_PASS',
        overrideReason: 'Inspected physical package under daylight; date 01/2026 is clear and legible.',
        notes: 'Passed manual verification',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.checkResult.status).toBe('PASS');
    expect(res.body.data.checkResult.isOverridden).toBe(true);
    expect(res.body.data.checkResult.overrideReason).toContain('Inspected physical package');

    // Audit log check
    const log = db.store.auditLogs.find(l => l.objectId === 'chk-rev-02' && l.action === 'B26_MANUAL_REVIEW_RESOLVED');
    expect(log).toBeDefined();
    expect(log?.reason).toContain('Inspected physical package');
  });

  it('should automatically generate a Violation when inspector does CONFIRM_FLAG', async () => {
    const rule = Array.from(db.store.rules.values()).find(r => r.ruleCode === 'PCR-2011-R06-MRP-FORMAT')!;
    db.store.checkResults.set('chk-rev-03', {
      id: 'chk-rev-03',
      inspectionId: 'insp-b26-03',
      ruleId: rule.id,
      ruleCode: rule.ruleCode,
      ruleVersion: rule.version,
      status: 'MANUAL_REVIEW',
      confidence: 0.58,
      explanation: 'Ambiguous taxes phrase.',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const res = await request(app)
      .patch('/api/v1/b26/chk-rev-03')
      .set('Authorization', `Bearer ${inspectorToken}`)
      .send({
        resolution: 'CONFIRM_FLAG',
        overrideReason: 'Verified package label; missing mandatory "inclusive of all taxes" statement.',
        notes: 'Confirmed non-compliance',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.checkResult.status).toBe('FLAG');
    expect(res.body.data.violation).toBeDefined();
    expect(res.body.data.violation.ruleCode).toBe('PCR-2011-R06-MRP-FORMAT');
    expect(res.body.data.violation.status).toBe('OPEN');
  });

  it('should reject unauthorized role with 403 PERMISSION_DENIED', async () => {
    const res = await request(app)
      .patch('/api/v1/b26/any-id')
      .set('Authorization', `Bearer ${manufacturerToken}`)
      .send({
        resolution: 'CONFIRM_PASS',
        overrideReason: 'Attempting unauthorized override',
      });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('PERMISSION_DENIED');
  });

  it('should return 404 26_NOT_FOUND when item not found', async () => {
    const res = await request(app)
      .get('/api/v1/b26/non-existent-chk')
      .set('Authorization', `Bearer ${inspectorToken}`);

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('26_NOT_FOUND');
  });
});
