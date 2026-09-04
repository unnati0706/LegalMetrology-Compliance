import request from 'supertest';
import { app } from '../../app.js';
import { db } from '../../shared/database/index.js';
import { generateToken } from '../../shared/auth/index.js';

describe('Module B24: Date & Placement/Readability/Font-Size Validation Engine', () => {
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
    it('should PASS for valid past packing date, compliant numeral height, and good contrast ratio', async () => {
      const payload = {
        inspectionId: 'insp-b24-01',
        inspectionDate: '2026-09-04T12:00:00Z',
        dateDeclaration: {
          rawText: 'Mfg Date: 05/2026',
          month: 5,
          year: 2026,
          confidence: 0.95,
        },
        packageDetails: {
          netQuantityGramsOrMl: 500, // Bracket 200g-1kg requires >= 2.0mm
          measuredFontHeightMm: 2.8,
          contrastRatio: 5.2,
          isLegible: true,
          packageSide: 'PDP',
        }
      };

      const res = await request(app)
        .post('/api/v1/b24')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .send(payload);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.summary.passed).toBe(3);
      expect(res.body.data.summary.flagged).toBe(0);
    });

    it('should FLAG post-dated package commodity where packing date is in the future', async () => {
      const payload = {
        inspectionId: 'insp-b24-02',
        inspectionDate: '2026-09-04T12:00:00Z', // Current inspection is Sept 2026
        dateDeclaration: {
          rawText: 'Mfd: 12/2026', // Post-dated Dec 2026!
          month: 12,
          year: 2026,
          confidence: 0.95,
        },
        packageDetails: {
          netQuantityGramsOrMl: 500,
          measuredFontHeightMm: 2.5,
          contrastRatio: 4.5,
        }
      };

      const res = await request(app)
        .post('/api/v1/b24')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .send(payload);

      expect(res.status).toBe(200);
      const dateCheck = res.body.data.results.find((r: any) => r.ruleCode === 'PCR-2011-R06-DATE-FORMAT');
      expect(dateCheck.status).toBe('FLAG');
      expect(dateCheck.explanation).toContain('post-dated');
    });

    it('should FLAG numeral font height below Schedule II minimum requirement', async () => {
      const payload = {
        inspectionId: 'insp-b24-03',
        inspectionDate: '2026-09-04T12:00:00Z',
        dateDeclaration: {
          rawText: 'Pkd: 03/2026',
          confidence: 0.95,
        },
        packageDetails: {
          netQuantityGramsOrMl: 2000, // 2kg package requires >= 4.0mm
          measuredFontHeightMm: 2.2, // Only 2.2mm -> Violation
          contrastRatio: 4.5,
        }
      };

      const res = await request(app)
        .post('/api/v1/b24')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .send(payload);

      expect(res.status).toBe(200);
      const fontCheck = res.body.data.results.find((r: any) => r.ruleCode === 'PCR-2011-R07-FONT-HEIGHT');
      expect(fontCheck.status).toBe('FLAG');
      expect(fontCheck.explanation).toContain('below the statutory minimum of 4mm');
    });

    it('should FLAG poor contrast ratio on Principal Display Panel', async () => {
      const payload = {
        inspectionId: 'insp-b24-04',
        inspectionDate: '2026-09-04T12:00:00Z',
        dateDeclaration: {
          rawText: 'Mfd: 01/2026',
          confidence: 0.95,
        },
        packageDetails: {
          netQuantityGramsOrMl: 200,
          measuredFontHeightMm: 1.5,
          contrastRatio: 2.1, // Insufficient contrast (< 3.0:1)
          isLegible: true,
        }
      };

      const res = await request(app)
        .post('/api/v1/b24')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .send(payload);

      expect(res.status).toBe(200);
      const pdpCheck = res.body.data.results.find((r: any) => r.ruleCode === 'PCR-2011-R09-PDP-READABILITY');
      expect(pdpCheck.status).toBe('FLAG');
      expect(pdpCheck.explanation).toContain('contrast ratio');
    });

    it('should route to MANUAL_REVIEW on low date extraction confidence', async () => {
      const payload = {
        inspectionId: 'insp-b24-05',
        dateDeclaration: {
          rawText: 'Mfd: ??/2026',
          confidence: 0.55, // Low confidence
        },
        packageDetails: {
          netQuantityGramsOrMl: 500,
        }
      };

      const res = await request(app)
        .post('/api/v1/b24')
        .set('Authorization', `Bearer ${inspectorToken}`)
        .send(payload);

      expect(res.status).toBe(200);
      expect(res.body.data.summary.manualReview).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Security and Endpoints', () => {
    it('should reject unauthorized role with 403 PERMISSION_DENIED', async () => {
      const res = await request(app)
        .post('/api/v1/b24')
        .set('Authorization', `Bearer ${manufacturerToken}`)
        .send({
          inspectionId: 'insp-01',
          dateDeclaration: { rawText: '01/2026' },
          packageDetails: { netQuantityGramsOrMl: 500 },
        });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('PERMISSION_DENIED');
    });

    it('should return 404 24_NOT_FOUND when check result does not exist', async () => {
      const res = await request(app)
        .get('/api/v1/b24/non-existent-b24-id')
        .set('Authorization', `Bearer ${inspectorToken}`);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('24_NOT_FOUND');
    });
  });
});
