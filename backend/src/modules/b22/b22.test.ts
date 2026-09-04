import request from 'supertest';
import { app } from '../../app.js';
import { db } from '../../shared/database/index.js';
import { generateToken } from '../../shared/auth/index.js';

describe('Module B22: MRP & Net Quantity Validation Engine', () => {
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

  describe('Deterministic Compliance Logic', () => {
    it('should PASS for valid MRP declaration with taxes, INR currency, and valid SI units', async () => {
      const payload = {
        inspectionId: 'insp-b22-01',
        mrpDeclaration: {
          rawText: 'MRP ₹ 250.00 (inclusive of all taxes)',
          confidence: 0.95,
        },
        netQuantityDeclaration: {
          rawText: 'Net Qty: 500 g',
          confidence: 0.96,
        },
      };

      const res = await request(app)
        .post('/api/v1/b22')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .send(payload);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.summary.passed).toBe(4);
      expect(res.body.data.summary.flagged).toBe(0);
    });

    it('should FLAG when MRP misses "inclusive of all taxes" statement', async () => {
      const payload = {
        inspectionId: 'insp-b22-02',
        mrpDeclaration: {
          rawText: 'MRP Rs. 150.00', // Missing incl of all taxes
          confidence: 0.95,
        },
        netQuantityDeclaration: {
          rawText: 'Net Qty: 200 g',
          confidence: 0.95,
        },
      };

      const res = await request(app)
        .post('/api/v1/b22')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .send(payload);

      expect(res.status).toBe(200);
      expect(res.body.data.summary.flagged).toBeGreaterThanOrEqual(1);
      const mrpCheck = res.body.data.results.find((r: any) => r.ruleCode === 'PCR-2011-R06-MRP-FORMAT');
      expect(mrpCheck.status).toBe('FLAG');
      expect(mrpCheck.explanation).toContain('inclusive of all taxes');
    });

    it('should FLAG when foreign currency symbol is used instead of INR/₹', async () => {
      const payload = {
        inspectionId: 'insp-b22-03',
        mrpDeclaration: {
          rawText: 'MRP $ 10.00 incl. of all taxes', // Dollar symbol
          confidence: 0.95,
        },
        netQuantityDeclaration: {
          rawText: 'Net Qty: 500 g',
          confidence: 0.95,
        },
      };

      const res = await request(app)
        .post('/api/v1/b22')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .send(payload);

      expect(res.status).toBe(200);
      const currencyCheck = res.body.data.results.find((r: any) => r.ruleCode === 'PCR-2011-R06-MRP-CURRENCY');
      expect(currencyCheck.status).toBe('FLAG');
      expect(currencyCheck.explanation).toContain('foreign currency');
    });

    it('should FLAG non-standard metric abbreviations like "gms" or "ltrs"', async () => {
      const payload = {
        inspectionId: 'insp-b22-04',
        mrpDeclaration: {
          rawText: 'MRP ₹ 120.00 incl. of all taxes',
          confidence: 0.95,
        },
        netQuantityDeclaration: {
          rawText: 'Net Weight: 500 gms', // Non-standard 'gms'
          confidence: 0.95,
        },
      };

      const res = await request(app)
        .post('/api/v1/b22')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .send(payload);

      expect(res.status).toBe(200);
      const metricCheck = res.body.data.results.find((r: any) => r.ruleCode === 'PCR-2011-R06-QTY-METRIC');
      expect(metricCheck.status).toBe('FLAG');
      expect(metricCheck.explanation).toContain('non-standard abbreviations');
    });

    it('should FLAG missing Unit Sale Price (USP) when quantity exceeds 1kg', async () => {
      const payload = {
        inspectionId: 'insp-b22-05',
        mrpDeclaration: {
          rawText: 'MRP ₹ 600.00 incl. of all taxes',
          confidence: 0.95,
        },
        netQuantityDeclaration: {
          rawText: 'Net Qty: 5 kg', // > 1kg requires USP
          confidence: 0.95,
        },
        // No unitSalePriceDeclaration provided
      };

      const res = await request(app)
        .post('/api/v1/b22')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .send(payload);

      expect(res.status).toBe(200);
      const uspCheck = res.body.data.results.find((r: any) => r.ruleCode === 'PCR-2011-R06-1-E-USP');
      expect(uspCheck.status).toBe('FLAG');
      expect(uspCheck.explanation).toContain('Unit Sale Price (USP) declaration is mandatory');
    });

    it('should PASS when USP is properly declared for packages > 1kg', async () => {
      const payload = {
        inspectionId: 'insp-b22-06',
        mrpDeclaration: {
          rawText: 'MRP ₹ 500.00 incl. of all taxes',
          confidence: 0.95,
        },
        netQuantityDeclaration: {
          rawText: 'Net Qty: 2 kg',
          confidence: 0.95,
        },
        unitSalePriceDeclaration: {
          rawText: 'USP: ₹ 250 / kg',
          confidence: 0.95,
        }
      };

      const res = await request(app)
        .post('/api/v1/b22')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .send(payload);

      expect(res.status).toBe(200);
      const uspCheck = res.body.data.results.find((r: any) => r.ruleCode === 'PCR-2011-R06-1-E-USP');
      expect(uspCheck.status).toBe('PASS');
    });

    it('should route to MANUAL_REVIEW when confidence is low (< 0.75)', async () => {
      const payload = {
        inspectionId: 'insp-b22-07',
        mrpDeclaration: {
          rawText: 'MRP ₹ 100 incl taxes',
          confidence: 0.65, // low confidence
        },
        netQuantityDeclaration: {
          rawText: '500 g',
          confidence: 0.95,
        },
      };

      const res = await request(app)
        .post('/api/v1/b22')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .send(payload);

      expect(res.status).toBe(200);
      expect(res.body.data.summary.manualReview).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Security, Error Handling, and Endpoints', () => {
    it('should return 403 PERMISSION_DENIED for unauthorized role', async () => {
      const res = await request(app)
        .post('/api/v1/b22')
        .set('Authorization', `Bearer ${manufacturerToken}`)
        .send({
          inspectionId: 'insp-01',
          mrpDeclaration: { rawText: 'MRP ₹ 50' },
          netQuantityDeclaration: { rawText: '100 g' },
        });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('PERMISSION_DENIED');
    });

    it('should return 404 22_NOT_FOUND on missing resource', async () => {
      const res = await request(app)
        .get('/api/v1/b22/unknown-check-id')
        .set('Authorization', `Bearer ${inspectorToken}`);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('22_NOT_FOUND');
    });
  });
});
