import request from 'supertest';
import { app } from '../../app.js';
import { db } from '../../shared/database/index.js';
import { generateToken } from '../../shared/auth/index.js';

describe('Module B28: Evidence Locker Service', () => {
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

  it('should store evidence in the locker and return signed URL', async () => {
    const payload = {
      inspectionId: 'insp-b28-01',
      imageUrl: 'https://storage.googleapis.com/temp-bucket/packet-front.jpg',
      packageSide: 'PDP',
      qualityScore: 95.5,
      mimeType: 'image/jpeg',
      fileSizeBytes: 350000,
    };

    const res = await request(app)
      .post('/api/v1/b28')
      .set('Authorization', `Bearer ${inspectorToken}`)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.packageSide).toBe('PDP');
    expect(res.body.data.signedUrl).toContain('signed=true');

    // Verify audit log
    const audit = db.store.auditLogs.find(l => l.objectId === res.body.data.id);
    expect(audit).toBeDefined();
    expect(audit?.action).toBe('B28_EVIDENCE_STORED');
  });

  it('should reject unsupported MIME type with 400 VALIDATION_ERROR', async () => {
    const payload = {
      inspectionId: 'insp-b28-02',
      imageUrl: 'https://example.com/document.pdf',
      mimeType: 'application/pdf', // Invalid for image evidence
      fileSizeBytes: 150000,
    };

    const res = await request(app)
      .post('/api/v1/b28')
      .set('Authorization', `Bearer ${inspectorToken}`)
      .send(payload);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should retrieve evidence with signed URL and linked declarations/violations', async () => {
    // 1. Add evidence
    const addRes = await request(app)
      .post('/api/v1/b28')
      .set('Authorization', `Bearer ${inspectorToken}`)
      .send({
        inspectionId: 'insp-b28-03',
        imageUrl: 'https://example.com/back.jpg',
        packageSide: 'BACK',
        mimeType: 'image/png',
        fileSizeBytes: 240000,
      });

    const evidenceId = addRes.body.data.id;

    // 2. Link a declaration to this evidence
    db.store.declarations.set('decl-link-01', {
      id: 'decl-link-01',
      inspectionId: 'insp-b28-03',
      field: 'mrp',
      value: '₹100',
      confidence: 0.95,
      status: 'DETECTED',
      evidenceId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 3. Fetch evidence item
    const fetchRes = await request(app)
      .get(`/api/v1/b28/${evidenceId}`)
      .set('Authorization', `Bearer ${inspectorToken}`);

    expect(fetchRes.status).toBe(200);
    expect(fetchRes.body.data.id).toBe(evidenceId);
    expect(fetchRes.body.data.linkedDeclarations.length).toBe(1);
    expect(fetchRes.body.data.linkedDeclarations[0].field).toBe('mrp');
  });

  it('should reject unauthorized role with 403 PERMISSION_DENIED', async () => {
    const res = await request(app)
      .post('/api/v1/b28')
      .set('Authorization', `Bearer ${manufacturerToken}`)
      .send({
        inspectionId: 'insp-b28-04',
        imageUrl: 'https://example.com/test.jpg',
        mimeType: 'image/jpeg',
        fileSizeBytes: 50000,
      });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('PERMISSION_DENIED');
  });

  it('should return 404 28_NOT_FOUND when evidence item does not exist', async () => {
    const res = await request(app)
      .get('/api/v1/b28/non-existent-evi-id')
      .set('Authorization', `Bearer ${inspectorToken}`);

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('28_NOT_FOUND');
  });
});
