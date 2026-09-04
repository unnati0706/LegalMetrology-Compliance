import request from 'supertest';
import { app } from '../../app.js';
import { db } from '../../shared/database/index.js';
import { generateToken } from '../../shared/auth/index.js';

describe('Module B23: Manufacturer/Packer/Importer & Consumer-Care Validation Engine', () => {
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
    it('should PASS for complete entity address with valid Indian PIN code and consumer care details', async () => {
      const payload = {
        inspectionId: 'insp-b23-01',
        entityDeclaration: {
          entityType: 'MANUFACTURER',
          rawText: 'Manufactured by Priya Foods Ltd, Plot 14, IDA Uppal, Hyderabad, Telangana - 500039',
          confidence: 0.95,
        },
        consumerCareDeclaration: {
          rawText: 'Customer Care Executive, Priya Foods Ltd, Call Toll-Free: 1800-425-9999, Email: customercare@priyafoods.in',
          confidence: 0.95,
        }
      };

      const res = await request(app)
        .post('/api/v1/b23')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .send(payload);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.summary.passed).toBe(3);
      expect(res.body.data.summary.flagged).toBe(0);
    });

    it('should FLAG when manufacturer address lacks a valid 6-digit Indian PIN code', async () => {
      const payload = {
        inspectionId: 'insp-b23-02',
        entityDeclaration: {
          entityType: 'MANUFACTURER',
          rawText: 'Manufactured by Priya Foods Ltd, Hyderabad, India', // No PIN code
          confidence: 0.95,
        },
        consumerCareDeclaration: {
          rawText: 'Call: 9849012345, Email: care@priyafoods.in',
          confidence: 0.95,
        }
      };

      const res = await request(app)
        .post('/api/v1/b23')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .send(payload);

      expect(res.status).toBe(200);
      const addrCheck = res.body.data.results.find((r: any) => r.ruleCode === 'PCR-2011-R06-ENTITY-ADDR');
      expect(addrCheck.status).toBe('FLAG');
      expect(addrCheck.explanation).toContain('6-digit Indian PIN code');
    });

    it('should FLAG when consumer care phone number is missing or invalid', async () => {
      const payload = {
        inspectionId: 'insp-b23-03',
        entityDeclaration: {
          rawText: 'Manufactured by Haldiram Snacks Pvt Ltd, Noida 201301',
          confidence: 0.95,
        },
        consumerCareDeclaration: {
          rawText: 'Consumer Care Cell, Email: support@haldiram.in', // Missing phone
          confidence: 0.95,
        }
      };

      const res = await request(app)
        .post('/api/v1/b23')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .send(payload);

      expect(res.status).toBe(200);
      const phoneCheck = res.body.data.results.find((r: any) => r.ruleCode === 'PCR-2011-R06-CC-PHONE');
      expect(phoneCheck.status).toBe('FLAG');
      expect(phoneCheck.explanation).toContain('operational Indian phone/toll-free number');
    });

    it('should FLAG when consumer care email address is missing or invalid', async () => {
      const payload = {
        inspectionId: 'insp-b23-04',
        entityDeclaration: {
          rawText: 'Manufactured by Amul Dairy, Anand, Gujarat 388001',
          confidence: 0.95,
        },
        consumerCareDeclaration: {
          rawText: 'Call 1800-258-3333 for consumer complaints', // Missing email
          confidence: 0.95,
        }
      };

      const res = await request(app)
        .post('/api/v1/b23')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .send(payload);

      expect(res.status).toBe(200);
      const emailCheck = res.body.data.results.find((r: any) => r.ruleCode === 'PCR-2011-R06-CC-EMAIL');
      expect(emailCheck.status).toBe('FLAG');
      expect(emailCheck.explanation).toContain('valid email address');
    });

    it('should route to MANUAL_REVIEW when confidence is below 0.75', async () => {
      const payload = {
        inspectionId: 'insp-b23-05',
        entityDeclaration: {
          rawText: 'Priya Foods Uppal 500039',
          confidence: 0.61, // Low confidence
        },
        consumerCareDeclaration: {
          rawText: 'care@priyafoods.in 9849012345',
          confidence: 0.95,
        }
      };

      const res = await request(app)
        .post('/api/v1/b23')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .send(payload);

      expect(res.status).toBe(200);
      expect(res.body.data.summary.manualReview).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Security and Endpoints', () => {
    it('should reject unauthorized role with 403 PERMISSION_DENIED', async () => {
      const res = await request(app)
        .post('/api/v1/b23')
        .set('Authorization', `Bearer ${manufacturerToken}`)
        .send({
          inspectionId: 'insp-01',
          entityDeclaration: { rawText: 'Test' },
          consumerCareDeclaration: { rawText: 'Test' },
        });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('PERMISSION_DENIED');
    });

    it('should return 404 23_NOT_FOUND when check result not found', async () => {
      const res = await request(app)
        .get('/api/v1/b23/non-existent-b23-id')
        .set('Authorization', `Bearer ${inspectorToken}`);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('23_NOT_FOUND');
    });
  });
});
