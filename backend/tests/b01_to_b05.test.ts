import request from 'supertest';
import app from '../src/app';

describe('Modules B01 - B05 Integration Tests', () => {
  let adminToken: string;
  let inspectorToken: string;
  let manufacturerToken: string;
  let createdConfigId: string;

  beforeAll(async () => {
    // Acquire tokens via B04 login endpoint
    const adminRes = await request(app)
      .post('/api/v1/b04/login')
      .send({ email: 'admin@legalmetrology.gov.in', password: 'AdminPass123!' });
    expect(adminRes.status).toBe(200);
    adminToken = adminRes.body.data.accessToken;

    const inspectorRes = await request(app)
      .post('/api/v1/b04/login')
      .send({ email: 'inspector1@legalmetrology.gov.in', password: 'Inspector123!' });
    expect(inspectorRes.status).toBe(200);
    inspectorToken = inspectorRes.body.data.accessToken;

    const mfrRes = await request(app)
      .post('/api/v1/b04/login')
      .send({ email: 'compliance@nestle.com', password: 'Manufacturer123!' });
    expect(mfrRes.status).toBe(200);
    manufacturerToken = mfrRes.body.data.accessToken;
  });

  describe('Health Endpoint', () => {
    it('GET /health should return 200 UP status', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('UP');
    });
  });

  describe('Module B01 - Application Bootstrap & Configuration', () => {
    it('GET /api/v1/b01 should list configs for authenticated users', async () => {
      const res = await request(app)
        .get('/api/v1/b01')
        .set('Authorization', `Bearer ${inspectorToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('POST /api/v1/b01 should allow Administrator to create config', async () => {
      const res = await request(app)
        .post('/api/v1/b01')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ key: 'TEST_KEY', value: { enabled: true }, description: 'Test setting' });
      expect(res.status).toBe(201);
      expect(res.body.data.key).toBe('TEST_KEY');
      createdConfigId = res.body.data.id;
    });

    it('POST /api/v1/b01 should reject non-Admin users with PERMISSION_DENIED (403)', async () => {
      const res = await request(app)
        .post('/api/v1/b01')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .send({ key: 'FAIL_KEY', value: 123 });
      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('PERMISSION_DENIED');
    });

    it('PATCH /api/v1/b01/:id should update configuration', async () => {
      const res = await request(app)
        .patch(`/api/v1/b01/${createdConfigId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ description: 'Updated test setting' });
      expect(res.status).toBe(200);
      expect(res.body.data.description).toBe('Updated test setting');
      expect(res.body.data.version).toBe(2);
    });
  });

  describe('Module B02 - Database & Schema Foundation', () => {
    it('GET /api/v1/b02 should return database status and tables schema meta', async () => {
      const res = await request(app)
        .get('/api/v1/b02')
        .set('Authorization', `Bearer ${inspectorToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.tables.length).toBeGreaterThan(0);
    });

    it('GET /api/v1/b02/tbl_users should return user table metadata', async () => {
      const res = await request(app)
        .get('/api/v1/b02/tbl_users')
        .set('Authorization', `Bearer ${inspectorToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.tableName).toBe('users');
    });
  });

  describe('Module B03 - Security Middleware & Validation', () => {
    it('GET /api/v1/b03 should return security configuration', async () => {
      const res = await request(app)
        .get('/api/v1/b03')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.helmetEnabled).toBe(true);
    });
  });

  describe('Module B04 - Authentication & Session Security', () => {
    it('POST /api/v1/b04/login with invalid password should fail with 401 UNAUTHORIZED', async () => {
      const res = await request(app)
        .post('/api/v1/b04/login')
        .send({ email: 'admin@legalmetrology.gov.in', password: 'wrong' });
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('GET /api/v1/b04 should list users for Inspector/Admin', async () => {
      const res = await request(app)
        .get('/api/v1/b04')
        .set('Authorization', `Bearer ${inspectorToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('GET /api/v1/b04 should reject Manufacturer role with 403', async () => {
      const res = await request(app)
        .get('/api/v1/b04')
        .set('Authorization', `Bearer ${manufacturerToken}`);
      expect(res.status).toBe(403);
    });
  });

  describe('Module B05 - RBAC & Authorization Engine', () => {
    it('GET /api/v1/b05 should return list of roles', async () => {
      const res = await request(app)
        .get('/api/v1/b05')
        .set('Authorization', `Bearer ${inspectorToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(4);
    });

    it('POST /api/v1/b05 should allow Administrator to create role', async () => {
      const res = await request(app)
        .post('/api/v1/b05')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Auditor', description: 'Third party auditor role', permissions: ['report:read'] });
      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('Auditor');
    });
  });

  describe('Audit Logging & Idempotency', () => {
    it('GET /api/v1/audit-logs should return recorded audit logs', async () => {
      const res = await request(app).get('/api/v1/audit-logs');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('Repeated POST request with same Idempotency-Key should return cached response', async () => {
      const idempotencyKey = 'unique-key-12345';
      const res1 = await request(app)
        .post('/api/v1/b01')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Idempotency-Key', idempotencyKey)
        .send({ key: 'IDEM_KEY', value: 100 });

      const res2 = await request(app)
        .post('/api/v1/b01')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Idempotency-Key', idempotencyKey)
        .send({ key: 'IDEM_KEY', value: 100 });

      expect(res1.status).toBe(201);
      expect(res2.status).toBe(201);
      expect(res1.body.data.id).toBe(res2.body.data.id);
    });
  });
});
