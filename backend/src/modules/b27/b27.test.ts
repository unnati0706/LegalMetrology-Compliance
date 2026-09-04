import request from 'supertest';
import { app } from '../../app.js';
import { db } from '../../shared/database/index.js';
import { generateToken } from '../../shared/auth/index.js';

describe('Module B27: Inspection Search & History Service', () => {
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

  it('should create an inspection and return 201 with audit log', async () => {
    const payload = {
      productName: 'Priya Ginger Garlic Paste',
      category: 'Food & Spices',
      brand: 'Priya',
      manufacturerId: 'mfg-priya-01',
      location: 'Hyderabad Market, Telangana',
    };

    const res = await request(app)
      .post('/api/v1/b27')
      .set('Authorization', `Bearer ${inspectorToken}`)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.productName).toBe('Priya Ginger Garlic Paste');
    expect(res.body.data.status).toBe('PENDING_ANALYSIS');

    const audit = db.store.auditLogs.find(l => l.objectId === res.body.data.id);
    expect(audit).toBeDefined();
  });

  it('should search inspections by product name substring and status filter', async () => {
    // Seed 2 inspections
    await request(app)
      .post('/api/v1/b27')
      .set('Authorization', `Bearer ${inspectorToken}`)
      .send({ productName: 'Haldiram Bhujia', category: 'Snacks' });

    await request(app)
      .post('/api/v1/b27')
      .set('Authorization', `Bearer ${inspectorToken}`)
      .send({ productName: 'Amul Butter', category: 'Dairy' });

    const searchRes = await request(app)
      .get('/api/v1/b27?productName=haldiram')
      .set('Authorization', `Bearer ${inspectorToken}`);

    expect(searchRes.status).toBe(200);
    expect(searchRes.body.data.length).toBe(1);
    expect(searchRes.body.data[0].productName).toBe('Haldiram Bhujia');
  });

  it('should return 409 INVALID_STATE_TRANSITION if trying to complete an inspection with unresolved manual review items', async () => {
    const createRes = await request(app)
      .post('/api/v1/b27')
      .set('Authorization', `Bearer ${inspectorToken}`)
      .send({ productName: 'Test Biscuit', category: 'Bakery' });

    const inspId = createRes.body.data.id;

    // Attach an unresolved manual review check result
    const rule = Array.from(db.store.rules.values())[0];
    db.store.checkResults.set('chk-pending-review', {
      id: 'chk-pending-review',
      inspectionId: inspId,
      ruleId: rule.id,
      ruleCode: rule.ruleCode,
      ruleVersion: rule.version,
      status: 'MANUAL_REVIEW',
      confidence: 0.6,
      explanation: 'Pending manual review',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Attempt transition to COMPLETED
    const updateRes = await request(app)
      .patch(`/api/v1/b27/${inspId}`)
      .set('Authorization', `Bearer ${inspectorToken}`)
      .send({ status: 'COMPLETED' });

    expect(updateRes.status).toBe(409);
    expect(updateRes.body.error.code).toBe('INVALID_STATE_TRANSITION');
    expect(updateRes.body.error.message).toContain('unresolved manual review items exist');
  });

  it('should reject unauthorized creation by MANUFACTURER with 403 PERMISSION_DENIED', async () => {
    const res = await request(app)
      .post('/api/v1/b27')
      .set('Authorization', `Bearer ${manufacturerToken}`)
      .send({ productName: 'Unauthorized Product', category: 'General' });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('PERMISSION_DENIED');
  });

  it('should return 404 27_NOT_FOUND when inspection does not exist', async () => {
    const res = await request(app)
      .get('/api/v1/b27/non-existent-insp-id')
      .set('Authorization', `Bearer ${inspectorToken}`);

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('27_NOT_FOUND');
  });
});
