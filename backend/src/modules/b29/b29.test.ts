import request from 'supertest';
import { app } from '../../app.js';
import { db } from '../../shared/database/index.js';
import { generateToken } from '../../shared/auth/index.js';

describe('Module B29: Report Generation & PDF/Editable Export Service', () => {
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

  it('should compile an inspection into a structured Report with verification checksum and signed URL', async () => {
    // 1. Seed inspection
    const insp = db.store.inspections.set('insp-b29-01', {
      id: 'insp-b29-01',
      inspectorId: 'usr-inspector-01',
      productName: 'Priya Mango Pickle 500g',
      category: 'Pickles & Condiments',
      brand: 'Priya',
      status: 'COMPLETED',
      ruleVersion: 'PCR-2011-v2.0',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 2. Seed a check result & violation
    const rule = Array.from(db.store.rules.values())[0];
    db.store.checkResults.set('chk-b29-01', {
      id: 'chk-b29-01',
      inspectionId: 'insp-b29-01',
      ruleId: rule.id,
      ruleCode: rule.ruleCode,
      ruleVersion: rule.version,
      status: 'FLAG',
      confidence: 0.95,
      explanation: 'Missing MRP tax inclusion phrase',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    db.store.violations.set('viol-b29-01', {
      id: 'viol-b29-01',
      inspectionId: 'insp-b29-01',
      checkResultId: 'chk-b29-01',
      ruleId: rule.id,
      ruleCode: rule.ruleCode,
      ruleVersion: rule.version,
      legalReference: rule.legalReference,
      violationType: rule.title,
      severity: 'CRITICAL',
      explanation: 'Missing MRP tax inclusion phrase',
      status: 'OPEN',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 3. Generate PDF Report
    const res = await request(app)
      .post('/api/v1/b29')
      .set('Authorization', `Bearer ${inspectorToken}`)
      .send({
        inspectionId: 'insp-b29-01',
        format: 'PDF',
        notes: 'Official enforcement inspection report generated',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.reportVersion).toBe('v1.0');
    expect(res.body.data.format).toBe('PDF');
    expect(res.body.data.downloadUrl).toContain('signed=true');
    expect(res.body.data.verificationChecksum).toBeDefined();
    expect(res.body.data.contentSummary.overallDisposition).toBe('NON_COMPLIANT');
    expect(res.body.data.contentSummary.violationsCount).toBe(1);

    // Audit log check
    const audit = db.store.auditLogs.find(l => l.objectId === res.body.data.id);
    expect(audit).toBeDefined();
    expect(audit?.action).toBe('B29_REPORT_GENERATED');
  });

  it('should support JSON and CSV export formats', async () => {
    db.store.inspections.set('insp-b29-02', {
      id: 'insp-b29-02',
      inspectorId: 'usr-inspector-01',
      productName: 'Amul Milk 1L',
      category: 'Dairy',
      status: 'COMPLETED',
      ruleVersion: 'PCR-2011-v2.0',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const resJson = await request(app)
      .post('/api/v1/b29')
      .set('Authorization', `Bearer ${inspectorToken}`)
      .send({
        inspectionId: 'insp-b29-02',
        format: 'JSON',
      });

    expect(resJson.status).toBe(201);
    expect(resJson.body.data.format).toBe('JSON');

    const resCsv = await request(app)
      .post('/api/v1/b29')
      .set('Authorization', `Bearer ${inspectorToken}`)
      .send({
        inspectionId: 'insp-b29-02',
        format: 'CSV',
      });

    expect(resCsv.status).toBe(201);
    expect(resCsv.body.data.format).toBe('CSV');
  });

  it('should reject unauthorized role with 403 PERMISSION_DENIED', async () => {
    const res = await request(app)
      .post('/api/v1/b29')
      .set('Authorization', `Bearer ${manufacturerToken}`)
      .send({
        inspectionId: 'insp-01',
        format: 'PDF',
      });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('PERMISSION_DENIED');
  });

  it('should return 404 29_NOT_FOUND when inspection or report does not exist', async () => {
    const res = await request(app)
      .get('/api/v1/b29/non-existent-report-id')
      .set('Authorization', `Bearer ${inspectorToken}`);

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('29_NOT_FOUND');
  });
});
