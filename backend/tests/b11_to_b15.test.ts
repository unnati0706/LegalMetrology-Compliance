import request from 'supertest';
import app from '../src/app';

describe('Modules B11 - B15 Integration Tests', () => {
  let adminToken: string;
  let inspectorToken: string;
  let supervisorToken: string;
  let manufacturerToken: string;

  let createdMetaId: string;
  let createdQualityId: string;
  let createdOcrId: string;
  let createdVisionId: string;

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

    const supervisorRes = await request(app)
      .post('/api/v1/b04/login')
      .send({ email: 'supervisor1@legalmetrology.gov.in', password: 'Supervisor123!' });
    supervisorToken = supervisorRes.body.data.accessToken;

    const mfrRes = await request(app)
      .post('/api/v1/b04/login')
      .send({ email: 'compliance@nestle.com', password: 'Manufacturer123!' });
    manufacturerToken = mfrRes.body.data.accessToken;
  });

  describe('Module B11 - Image Management & Metadata Service', () => {
    it('POST /api/v1/b11 should create image metadata record', async () => {
      const res = await request(app)
        .post('/api/v1/b11')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .send({
          evidenceId: 'ev_001',
          inspectionId: 'insp_001',
          packageSide: 'back',
          widthPixels: 3840,
          heightPixels: 2160,
          checksum: 'abc123checksumhash',
        });
      expect(res.status).toBe(201);
      expect(res.body.data.packageSide).toBe('back');
      createdMetaId = res.body.data.id;
    });

    it('GET /api/v1/b11/:id should return image metadata details', async () => {
      const res = await request(app)
        .get(`/api/v1/b11/${createdMetaId}`)
        .set('Authorization', `Bearer ${inspectorToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(createdMetaId);
    });

    it('GET /api/v1/b11 with non-existent ID should return 11_NOT_FOUND', async () => {
      const res = await request(app)
        .get('/api/v1/b11/invalid_meta_id')
        .set('Authorization', `Bearer ${inspectorToken}`);
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('11_NOT_FOUND');
    });
  });

  describe('Module B12 - Audit Trail Query Service', () => {
    it('GET /api/v1/b12 should allow Supervisor to query audit trail with filters', async () => {
      const res = await request(app)
        .get('/api/v1/b12?entityType=ImageMetadata')
        .set('Authorization', `Bearer ${supervisorToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET /api/v1/b12 should reject Manufacturer role with PERMISSION_DENIED (403)', async () => {
      const res = await request(app)
        .get('/api/v1/b12')
        .set('Authorization', `Bearer ${manufacturerToken}`);
      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('PERMISSION_DENIED');
    });

    it('POST /api/v1/b12 should export audit trail snapshot', async () => {
      const res = await request(app)
        .post('/api/v1/b12')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Monthly audit report export' });
      expect(res.status).toBe(201);
      expect(res.body.data.recordCount).toBeGreaterThan(0);
    });
  });

  describe('Module B13 - Image Quality Analysis Service', () => {
    it('POST /api/v1/b13 should run quality analysis and return scores', async () => {
      const res = await request(app)
        .post('/api/v1/b13')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .send({
          evidenceId: 'ev_001',
          blurScore: 10,
          glareScore: 5,
          cropScore: 5,
        });
      expect(res.status).toBe(201);
      expect(res.body.data.isAcceptable).toBe(true);
      expect(res.body.data.overallQuality).toBeGreaterThanOrEqual(0.80);
      createdQualityId = res.body.data.id;
    });

    it('GET /api/v1/b13/:id should return quality result by id', async () => {
      const res = await request(app)
        .get(`/api/v1/b13/${createdQualityId}`)
        .set('Authorization', `Bearer ${inspectorToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(createdQualityId);
    });
  });

  describe('Module B14 - OCR Orchestration & Provider Abstraction', () => {
    it('POST /api/v1/b14 should execute OCR text extraction', async () => {
      const res = await request(app)
        .post('/api/v1/b14')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .send({ evidenceId: 'ev_001' });
      expect(res.status).toBe(201);
      expect(res.body.data.rawText).toContain('NET QUANTITY');
      expect(res.body.data.overallConfidence).toBeGreaterThan(0.80);
      createdOcrId = res.body.data.id;
    });

    it('POST /api/v1/b14 with simulated failure should emit OCR_PROCESSING_FAILED', async () => {
      const res = await request(app)
        .post('/api/v1/b14')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .send({ evidenceId: 'ev_001', simulateFailure: true });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('OCR_PROCESSING_FAILED');
    });

    it('PATCH /api/v1/b14/:id should update corrected OCR text', async () => {
      const res = await request(app)
        .patch(`/api/v1/b14/${createdOcrId}`)
        .set('Authorization', `Bearer ${inspectorToken}`)
        .send({ rawText: 'NET QUANTITY: 75g (Corrected)' });
      expect(res.status).toBe(200);
      expect(res.body.data.rawText).toBe('NET QUANTITY: 75g (Corrected)');
    });
  });

  describe('Module B15 - Vision Orchestration & Provider Abstraction', () => {
    it('POST /api/v1/b15 should run vision region detection', async () => {
      const res = await request(app)
        .post('/api/v1/b15')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .send({ evidenceId: 'ev_001' });
      expect(res.status).toBe(201);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].boundingBox).toHaveProperty('x');
      createdVisionId = res.body.data[0].id;
    });

    it('POST /api/v1/b15 with simulated failure should emit VISION_PROCESSING_FAILED', async () => {
      const res = await request(app)
        .post('/api/v1/b15')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .send({ evidenceId: 'ev_001', simulateFailure: true });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VISION_PROCESSING_FAILED');
    });

    it('PATCH /api/v1/b15/:id should adjust vision bounding box', async () => {
      const res = await request(app)
        .patch(`/api/v1/b15/${createdVisionId}`)
        .set('Authorization', `Bearer ${inspectorToken}`)
        .send({ boundingBox: { x: 15, y: 15, width: 620, height: 820 } });
      expect(res.status).toBe(200);
      expect(res.body.data.boundingBox.width).toBe(620);
    });
  });
});
