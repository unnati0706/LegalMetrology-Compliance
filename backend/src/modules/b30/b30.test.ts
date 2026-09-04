import request from 'supertest';
import { app } from '../../app.js';
import { db } from '../../shared/database/index.js';
import { generateToken } from '../../shared/auth/index.js';

describe('Module B30: Report Versioning & History Service', () => {
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

  it('should track multiple immutable versions (v1.0 -> v1.1) and allow diff comparison', async () => {
    // 1. Seed inspection
    db.store.inspections.set('insp-b30-01', {
      id: 'insp-b30-01',
      inspectorId: 'usr-inspector-01',
      productName: 'Priya Pickle 1kg',
      category: 'Pickles',
      status: 'COMPLETED',
      ruleVersion: 'PCR-2011-v2.0',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 2. Generate initial Report v1.0
    const rep1Res = await request(app)
      .post('/api/v1/b29')
      .set('Authorization', `Bearer ${inspectorToken}`)
      .send({
        inspectionId: 'insp-b30-01',
        format: 'PDF',
      });

    const report1Id = rep1Res.body.data.id;
    expect(rep1Res.body.data.reportVersion).toBe('v1.0');

    // 3. Create amended Report v1.1 via B30
    const rep2Res = await request(app)
      .post('/api/v1/b30')
      .set('Authorization', `Bearer ${inspectorToken}`)
      .send({
        inspectionId: 'insp-b30-01',
        previousReportId: report1Id,
        amendmentReason: 'Corrected brand metadata and attached supplementary rear-panel photograph.',
        format: 'PDF',
      });

    expect(rep2Res.status).toBe(201);
    expect(rep2Res.body.data.reportVersion).toBe('v1.1');
    expect(rep2Res.body.data.previousReportId).toBe(report1Id);

    const report2Id = rep2Res.body.data.id;

    // 4. Query version history for the inspection
    const historyRes = await request(app)
      .get('/api/v1/b30?inspectionId=insp-b30-01')
      .set('Authorization', `Bearer ${inspectorToken}`);

    expect(historyRes.status).toBe(200);
    expect(historyRes.body.data.length).toBe(2);
    expect(historyRes.body.data[0].reportVersion).toBe('v1.0');
    expect(historyRes.body.data[1].reportVersion).toBe('v1.1');

    // 5. Compare the two versions
    const diffRes = await request(app)
      .get(`/api/v1/b30/diff/${report1Id}/${report2Id}`)
      .set('Authorization', `Bearer ${inspectorToken}`);

    expect(diffRes.status).toBe(200);
    expect(diffRes.body.data.baseVersion.version).toBe('v1.0');
    expect(diffRes.body.data.targetVersion.version).toBe('v1.1');
    expect(diffRes.body.data.amendmentReason).toContain('Corrected brand metadata');
  });

  it('should support major version bump (v1.0 -> v2.0) when isMajorVersion is true', async () => {
    db.store.inspections.set('insp-b30-02', {
      id: 'insp-b30-02',
      inspectorId: 'usr-inspector-01',
      productName: 'Haldiram Mixture',
      category: 'Snacks',
      status: 'COMPLETED',
      ruleVersion: 'PCR-2011-v2.0',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const rep1Res = await request(app)
      .post('/api/v1/b29')
      .set('Authorization', `Bearer ${inspectorToken}`)
      .send({
        inspectionId: 'insp-b30-02',
        format: 'PDF',
      });

    const report1Id = rep1Res.body.data.id;

    const repMajorRes = await request(app)
      .post('/api/v1/b30')
      .set('Authorization', `Bearer ${inspectorToken}`)
      .send({
        inspectionId: 'insp-b30-02',
        previousReportId: report1Id,
        amendmentReason: 'Complete re-inspection conducted with physical laboratory net weight verification.',
        format: 'PDF',
        isMajorVersion: true,
      });

    expect(repMajorRes.status).toBe(201);
    expect(repMajorRes.body.data.reportVersion).toBe('v2.0');
  });

  it('should reject unauthorized creation by MANUFACTURER with 403 PERMISSION_DENIED', async () => {
    const res = await request(app)
      .post('/api/v1/b30')
      .set('Authorization', `Bearer ${manufacturerToken}`)
      .send({
        inspectionId: 'insp-01',
        previousReportId: 'rep-01',
        amendmentReason: 'Unauthorized modification attempt',
      });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('PERMISSION_DENIED');
  });

  it('should return 404 30_NOT_FOUND when version not found', async () => {
    const res = await request(app)
      .get('/api/v1/b30/non-existent-report-version')
      .set('Authorization', `Bearer ${inspectorToken}`);

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('30_NOT_FOUND');
  });
});
