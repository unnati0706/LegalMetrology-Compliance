import request from 'supertest';
import { createApp } from '../../app.js';
import { db } from '../../shared/database/index.js';
import { generateTestToken } from '../../shared/auth/index.js';

describe('B33 - Geographic Analysis Service', () => {
  const app = createApp();

  const adminToken = generateTestToken({
    id: 'usr-admin-01',
    email: 'admin@legalmetrology.gov.in',
    name: 'Admin User',
    role: 'ADMIN',
  });

  const inspectorToken = generateTestToken({
    id: 'usr-inspector-01',
    email: 'inspector.mumbai@legalmetrology.gov.in',
    name: 'Amit Patel',
    role: 'INSPECTOR',
  });

  const mfgToken = generateTestToken({
    id: 'usr-manufacturer-01',
    email: 'compliance@priyafoods.in',
    name: 'Priya Foods',
    role: 'MANUFACTURER',
  });

  beforeEach(() => {
    db.reset();
  });

  describe('GET /api/v1/b33 - List Geographic Metrics', () => {
    it('returns seeded geographic zones with Indian locations and hotspot indicators', async () => {
      const res = await request(app)
        .get('/api/v1/b33')
        .set('Authorization', `Bearer ${inspectorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(4);
      const states = res.body.data.map((z: any) => z.state);
      expect(states).toContain('Maharashtra');
      expect(states).toContain('Delhi');
      expect(states).toContain('Karnataka');
    });

    it('filters zones by hotspot status', async () => {
      const res = await request(app)
        .get('/api/v1/b33?isHotspot=true')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.every((z: any) => z.isHotspot === true)).toBe(true);
    });

    it('filters zones by State and 6-digit PIN code', async () => {
      const res = await request(app)
        .get('/api/v1/b33?state=Maharashtra&pinCode=400001')
        .set('Authorization', `Bearer ${mfgToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].district).toBe('Mumbai City');
    });
  });

  describe('POST /api/v1/b33 - Recalculate Zone Metrics', () => {
    it('allows Admin to register and compute metrics for a new jurisdiction', async () => {
      const payload = {
        state: 'Tamil Nadu',
        district: 'Chennai',
        pinCode: '600001',
        coordinates: { latitude: 13.0827, longitude: 80.2707 },
        activeInspectorsCount: 7,
      };

      const res = await request(app)
        .post('/api/v1/b33')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.data.state).toBe('Tamil Nadu');
      expect(res.body.data.district).toBe('Chennai');
      expect(res.body.data.pinCode).toBe('600001');

      // Verify audit entry
      const audit = db.store.auditLogs.find(a => a.action === 'RECALCULATE_GEO_ZONE_METRICS');
      expect(audit).toBeDefined();
    });

    it('rejects invalid PIN code with 400 VALIDATION_ERROR', async () => {
      const payload = {
        state: 'Tamil Nadu',
        district: 'Chennai',
        pinCode: '6000', // Invalid PIN
      };

      const res = await request(app)
        .post('/api/v1/b33')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payload);

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('PATCH /api/v1/b33/:id - Update Zone Details', () => {
    it('allows updating hotspot and inspector allocation', async () => {
      const res = await request(app)
        .patch('/api/v1/b33/geo-zone-pune')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          isHotspot: true,
          activeInspectorsCount: 9,
          notes: 'Increased field inspection monitoring for festive season distribution',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.isHotspot).toBe(true);
      expect(res.body.data.activeInspectorsCount).toBe(9);
    });

    it('returns 33_NOT_FOUND when updating non-existent zone', async () => {
      const res = await request(app)
        .patch('/api/v1/b33/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isHotspot: true });

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('33_NOT_FOUND');
    });
  });
});
