import request from 'supertest';
import app from '../src/app';

describe('Modules B06 - B10 Integration Tests', () => {
  let adminToken: string;
  let inspectorToken: string;
  let manufacturerToken: string;

  let createdAuditId: string;
  let createdUserId: string;
  let createdProductId: string;
  let createdInspectionId: string;

  beforeAll(async () => {
    // Acquire tokens via B04 login endpoint
    const adminRes = await request(app)
      .post('/api/v1/b04/login')
      .send({ email: 'admin@legalmetrology.gov.in', password: 'AdminPass123!' });
    adminToken = adminRes.body.data.accessToken;

    const inspectorRes = await request(app)
      .post('/api/v1/b04/login')
      .send({ email: 'inspector1@legalmetrology.gov.in', password: 'Inspector123!' });
    inspectorToken = inspectorRes.body.data.accessToken;

    const mfrRes = await request(app)
      .post('/api/v1/b04/login')
      .send({ email: 'compliance@nestle.com', password: 'Manufacturer123!' });
    manufacturerToken = mfrRes.body.data.accessToken;
  });

  describe('Module B06 - Error Handling & Audit Logging Core', () => {
    it('POST /api/v1/b06 should record an audit log entry', async () => {
      const res = await request(app)
        .post('/api/v1/b06')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ action: 'SYSTEM_AUDIT_TEST', entityType: 'TestEntity', entityId: 'test_123', reason: 'Integration testing' });
      expect(res.status).toBe(201);
      expect(res.body.data.action).toBe('SYSTEM_AUDIT_TEST');
      createdAuditId = res.body.data.id;
    });

    it('GET /api/v1/b06/:id should return audit log by id', async () => {
      const res = await request(app)
        .get(`/api/v1/b06/${createdAuditId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(createdAuditId);
    });

    it('GET /api/v1/b06 with non-existent ID should return 06_NOT_FOUND', async () => {
      const res = await request(app)
        .get('/api/v1/b06/non_existent_audit_id')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('06_NOT_FOUND');
    });
  });

  describe('Module B07 - User Management Service', () => {
    it('POST /api/v1/b07 should invite/create a new user', async () => {
      const res = await request(app)
        .post('/api/v1/b07')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ username: 'officer_sharma', email: 'sharma@legalmetrology.gov.in', role: 'Inspector' });
      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe('invited');
      createdUserId = res.body.data.id;
    });

    it('PATCH /api/v1/b07/:id should activate user status', async () => {
      const res = await request(app)
        .patch(`/api/v1/b07/${createdUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'active' });
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('active');
    });

    it('GET /api/v1/b07 with non-existent ID should return 07_NOT_FOUND', async () => {
      const res = await request(app)
        .get('/api/v1/b07/invalid_user_id')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('07_NOT_FOUND');
    });
  });

  describe('Module B08 - Product Management Service', () => {
    it('POST /api/v1/b08 should create a new product', async () => {
      const res = await request(app)
        .post('/api/v1/b08')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .send({
          name: 'Amul Butter 500g',
          sku: 'AMUL-BUTTER-500G',
          category: 'Dairy',
          brand: 'Amul',
          manufacturerId: 'usr_mfr',
          packageType: 'box',
          netQuantity: 500,
          unit: 'g',
        });
      expect(res.status).toBe(201);
      expect(res.body.data.sku).toBe('AMUL-BUTTER-500G');
      createdProductId = res.body.data.id;
    });

    it('GET /api/v1/b08 should list products', async () => {
      const res = await request(app)
        .get('/api/v1/b08')
        .set('Authorization', `Bearer ${inspectorToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('GET /api/v1/b08/:id with non-existent ID should return 08_NOT_FOUND', async () => {
      const res = await request(app)
        .get('/api/v1/b08/invalid_product_id')
        .set('Authorization', `Bearer ${inspectorToken}`);
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('08_NOT_FOUND');
    });
  });

  describe('Module B09 - Inspection Lifecycle Service', () => {
    it('POST /api/v1/b09 should create an inspection in draft state', async () => {
      const res = await request(app)
        .post('/api/v1/b09')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .send({ productId: createdProductId, manufacturerId: 'usr_mfr', ruleVersion: '1.0.0' });
      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe('draft');
      createdInspectionId = res.body.data.id;
    });

    it('PATCH /api/v1/b09/:id should transition draft -> processing', async () => {
      const res = await request(app)
        .patch(`/api/v1/b09/${createdInspectionId}`)
        .set('Authorization', `Bearer ${inspectorToken}`)
        .send({ status: 'processing' });
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('processing');
    });

    it('PATCH /api/v1/b09/:id attempting invalid transition processing -> finalized should fail with INVALID_STATE_TRANSITION', async () => {
      const res = await request(app)
        .patch(`/api/v1/b09/${createdInspectionId}`)
        .set('Authorization', `Bearer ${inspectorToken}`)
        .send({ status: 'finalized' });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INVALID_STATE_TRANSITION');
    });
  });

  describe('Module B10 - Evidence & Object Storage Service', () => {
    it('POST /api/v1/b10 should upload evidence and return signed URL', async () => {
      const sampleBase64 = Buffer.from('mock-image-bytes-legal-metrology').toString('base64');
      const res = await request(app)
        .post('/api/v1/b10')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .send({
          inspectionId: createdInspectionId,
          fileName: 'package_front.jpg',
          mimeType: 'image/jpeg',
          fileBase64: sampleBase64,
          packageSide: 'front',
        });
      expect(res.status).toBe(201);
      expect(res.body.data.signedUrl).toContain('https://s3.ap-south-1.amazonaws.com');
      expect(res.body.data.packageSide).toBe('front');
    });

    it('POST /api/v1/b10 with invalid MIME type should fail with INVALID_IMAGE (400)', async () => {
      const sampleBase64 = Buffer.from('exe-content').toString('base64');
      const res = await request(app)
        .post('/api/v1/b10')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .send({
          inspectionId: createdInspectionId,
          fileName: 'malicious.exe',
          mimeType: 'application/x-msdownload',
          fileBase64: sampleBase64,
        });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INVALID_IMAGE');
    });
  });
});
