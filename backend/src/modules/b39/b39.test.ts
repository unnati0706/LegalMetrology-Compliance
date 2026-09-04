import request from 'supertest';
import { createApp } from '../../app.js';
import { db } from '../../shared/database/index.js';
import { generateTestToken } from '../../shared/auth/index.js';

describe('B39 - Manufacturer Pre-Market Self-Certification Portal', () => {
  const app = createApp();

  const adminToken = generateTestToken({
    id: 'usr-admin-01',
    email: 'admin@legalmetrology.gov.in',
    name: 'Rajesh Sharma',
    role: 'ADMIN',
  });

  const inspectorToken = generateTestToken({
    id: 'usr-inspector-01',
    email: 'inspector@legalmetrology.gov.in',
    name: 'Amit Patel',
    role: 'INSPECTOR',
  });

  const manufacturerToken = generateTestToken({
    id: 'usr-manufacturer-01',
    email: 'compliance@priyafoods.in',
    name: 'Priya Foods Officer',
    role: 'MANUFACTURER',
  });

  beforeEach(() => {
    db.reset();
  });

  describe('GET /api/v1/b39 - List Self-Certifications', () => {
    it('returns seeded certificates with digital seals and validity dates', async () => {
      const res = await request(app)
        .get('/api/v1/b39')
        .set('Authorization', `Bearer ${manufacturerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data[0].certificateNumber).toBe('LM/SMC/2026/CERT-104');
      expect(res.body.data[0].status).toBe('VERIFIED_COMPLIANT');
      expect(res.body.data[0].digitalSealHash).toBeDefined();
    });

    it('filters certificates by SKU and status', async () => {
      const res = await request(app)
        .get('/api/v1/b39?sku=PF-BR&status=VERIFIED_COMPLIANT')
        .set('Authorization', `Bearer ${manufacturerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
    });
  });

  describe('POST /api/v1/b39 - Create Self-Certification', () => {
    it('verifies 100% compliant packaging and issues digital certificate', async () => {
      const payload = {
        manufacturerId: 'mfg-priya-foods',
        manufacturerName: 'Priya Foods Ltd',
        productName: 'Priya Organic Turmeric Powder 200g',
        category: 'Spices',
        sku: 'PF-TP-200G-01',
        artworkImageUrl: 'https://storage.legalmetrology.gov.in/artworks/turmeric_200g.png',
        declarationsDeclared: {
          mrp: 'Rs 60.00 (Incl. of all taxes)',
          netQuantity: '200 g',
          manufacturer: 'Priya Foods Ltd, Plot 4, Pune, PIN: 411028',
          consumerCare: 'care@priyafoods.in, 1800-111-2222',
          dateOfMfg: '09/2026'
        },
        validityDays: 365,
      };

      const res = await request(app)
        .post('/api/v1/b39')
        .set('Authorization', `Bearer ${manufacturerToken}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.certificateNumber).toMatch(/^LM\/SMC\/\d{4}\/CERT-\d{4}$/);
      expect(res.body.data.complianceScore).toBe(100);
      expect(res.body.data.status).toBe('VERIFIED_COMPLIANT');
      expect(res.body.data.passedChecks.length).toBe(5);
      expect(res.body.data.flaggedDefects.length).toBe(0);
      expect(res.body.data.digitalSealHash).toBeDefined();
    });

    it('flags non-compliant artwork when required declaration is omitted', async () => {
      const payload = {
        manufacturerId: 'mfg-priya-foods',
        manufacturerName: 'Priya Foods Ltd',
        productName: 'Priya Defective Snack Pack',
        category: 'Snacks',
        sku: 'PF-SNACK-DEFECT',
        artworkImageUrl: 'https://storage.legalmetrology.gov.in/artworks/snack.png',
        declarationsDeclared: {
          mrp: 'Rs 20.00',
          // omitted netQuantity, dateOfMfg, consumerCare
          manufacturer: 'Priya Foods Ltd'
        }
      };

      const res = await request(app)
        .post('/api/v1/b39')
        .set('Authorization', `Bearer ${manufacturerToken}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe('NON_COMPLIANT_FLAGGED');
      expect(res.body.data.complianceScore).toBeLessThan(100);
      expect(res.body.data.flaggedDefects.length).toBeGreaterThan(0);
    });
  });

  describe('PATCH /api/v1/b39/:id - Update / Revoke Certificate', () => {
    it('allows Admin to revoke certificate on post-market violation', async () => {
      const res = await request(app)
        .patch('/api/v1/b39/cert-001')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'REVOKED',
          reason: 'Subsequent physical marketplace inspection revealed altered net weight.',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('REVOKED');
    });

    it('rejects unprivileged Inspector from revoking certificate with 403', async () => {
      const res = await request(app)
        .patch('/api/v1/b39/cert-001')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .send({
          status: 'REVOKED',
          reason: 'Inspector attempting revocation',
        });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('PERMISSION_DENIED');
    });
  });
});
