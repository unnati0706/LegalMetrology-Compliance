import request from 'supertest';
import app from '../src/app';

describe('Modules B16 - B20 Integration Tests', () => {
  let adminToken: string;
  let inspectorToken: string;
  let manufacturerToken: string;

  let createdDeclarationId: string;
  let createdRuleId: string;

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

  describe('Module B16 - Field Extraction Service', () => {
    it('POST /api/v1/b16 should extract candidate fields from OCR text', async () => {
      const res = await request(app)
        .post('/api/v1/b16')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .send({
          inspectionId: 'insp_001',
          evidenceId: 'ev_001',
          ocrText: 'MRP Rs. 50.00 (Incl. of all taxes)\nNET QUANTITY: 500g\nMFG DATE: 02/2026',
        });
      expect(res.status).toBe(201);
      expect(res.body.data.rawExtractedFields.mrpRaw).toContain('50.00');
      createdDeclarationId = res.body.data.id;
    });

    it('GET /api/v1/b16/:id should return declaration details', async () => {
      const res = await request(app)
        .get(`/api/v1/b16/${createdDeclarationId}`)
        .set('Authorization', `Bearer ${inspectorToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(createdDeclarationId);
    });

    it('GET /api/v1/b16 with non-existent ID should return 16_NOT_FOUND', async () => {
      const res = await request(app)
        .get('/api/v1/b16/invalid_decl_id')
        .set('Authorization', `Bearer ${inspectorToken}`);
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('16_NOT_FOUND');
    });
  });

  describe('Module B17 - Declaration Normalization Service', () => {
    it('POST /api/v1/b17 should normalize raw fields into canonical types', async () => {
      const res = await request(app)
        .post('/api/v1/b17')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .send({ declarationId: createdDeclarationId });
      expect(res.status).toBe(201);
      expect(res.body.data.normalizedFields.mrp.value).toBe(50.0);
      expect(res.body.data.normalizedFields.netQuantity.baseQuantity).toBe(0.5);
    });

    it('GET /api/v1/b17 with non-existent ID should return 17_NOT_FOUND', async () => {
      const res = await request(app)
        .get('/api/v1/b17/invalid_decl_id')
        .set('Authorization', `Bearer ${inspectorToken}`);
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('17_NOT_FOUND');
    });
  });

  describe('Module B18 - Confidence Scoring & Manual Corrections', () => {
    it('POST /api/v1/b18 should evaluate confidence threshold', async () => {
      const res = await request(app)
        .post('/api/v1/b18')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .send({ declarationId: createdDeclarationId, confidences: { mrp: 0.95, netQuantity: 0.50 } });
      expect(res.status).toBe(201);
      expect(res.body.data.requiresManualReview).toBe(true);
    });

    it('PATCH /api/v1/b18/:id without stated reason should fail with VALIDATION_ERROR', async () => {
      const res = await request(app)
        .patch(`/api/v1/b18/${createdDeclarationId}`)
        .set('Authorization', `Bearer ${inspectorToken}`)
        .send({ normalizedFields: { mrp: { value: 50.0 } } });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('PATCH /api/v1/b18/:id with reason should record manual override', async () => {
      const res = await request(app)
        .patch(`/api/v1/b18/${createdDeclarationId}`)
        .set('Authorization', `Bearer ${inspectorToken}`)
        .send({
          normalizedFields: { mrp: { value: 50.0, currency: 'INR' } },
          reason: 'Verified manually from high-res package photo',
        });
      expect(res.status).toBe(200);
      expect(res.body.data.isManuallyVerified).toBe(true);
      expect(res.body.data.manualOverrideReason).toContain('Verified manually');
    });
  });

  describe('Module B19 - Rule Library & Versioning Service', () => {
    it('GET /api/v1/b19 should return legal metrology rules', async () => {
      const res = await request(app)
        .get('/api/v1/b19')
        .set('Authorization', `Bearer ${inspectorToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('POST /api/v1/b19 should reject non-Admin users with PERMISSION_DENIED (403)', async () => {
      const res = await request(app)
        .post('/api/v1/b19')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .send({ ruleCode: 'TEST_RULE', title: 'Test Rule', sectionReference: 'Sec 1' });
      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('PERMISSION_DENIED');
    });

    it('POST /api/v1/b19 should allow Administrator to create rule', async () => {
      const res = await request(app)
        .post('/api/v1/b19')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          ruleCode: 'LM_RULE_04_EXPIRY_DATE',
          title: 'Expiry/Best Before Date Declaration',
          sectionReference: 'Legal Metrology Rules 2011 Rule 6(1)(m)',
          categoryApplicability: 'Food',
        });
      expect(res.status).toBe(201);
      expect(res.body.data.ruleCode).toBe('LM_RULE_04_EXPIRY_DATE');
      createdRuleId = res.body.data.id;
    });

    it('PATCH /api/v1/b19/:id should create a new version of the rule', async () => {
      const res = await request(app)
        .patch(`/api/v1/b19/${createdRuleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Expiry/Best Before Date Declaration (Updated)' });
      expect(res.status).toBe(200);
      expect(res.body.data.version).toBe('1.1.0');
    });
  });

  describe('Module B20 - Rule Applicability Engine', () => {
    it('GET /api/v1/b20 should return applicable active rules for category', async () => {
      const res = await request(app)
        .get('/api/v1/b20?category=ALL')
        .set('Authorization', `Bearer ${inspectorToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('GET /api/v1/b20 with non-existent ruleVersion should emit RULE_VERSION_NOT_FOUND', async () => {
      const res = await request(app)
        .get('/api/v1/b20?category=ALL&ruleVersion=99.99.99')
        .set('Authorization', `Bearer ${inspectorToken}`);
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('RULE_VERSION_NOT_FOUND');
    });
  });
});
