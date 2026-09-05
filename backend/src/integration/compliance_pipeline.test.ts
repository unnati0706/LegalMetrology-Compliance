import request from 'supertest';
import { app } from '../app.js';
import { db } from '../shared/database/index.js';
import { generateToken } from '../shared/auth/index.js';

describe('End-to-End Compliance Pipeline (B21 -> B22 -> B23 -> B24 -> B25)', () => {
  const inspectorToken = generateToken({
    id: 'usr-inspector-01',
    email: 'inspector.mumbai@legalmetrology.gov.in',
    name: 'Amit Patel',
    role: 'INSPECTOR',
    organization: 'Legal Metrology Maharashtra',
  });

  beforeEach(() => {
    db.reset();
  });

  it('should run an end-to-end package commodity inspection pipeline, flag violations, and map evidence', async () => {
    const inspectionId = 'insp-pipeline-e2e-01';

    // Step 0: Register package artwork Evidence
    const frontEvidenceId = 'evi-packet-front-01';
    db.store.evidence.set(frontEvidenceId, {
      id: frontEvidenceId,
      inspectionId,
      imageUrl: 'https://s3.ap-south-1.amazonaws.com/evidence/haldiram-bhujia-front.jpg',
      storageKey: 'evidence/haldiram-bhujia-front.jpg',
      packageSide: 'PDP',
      qualityScore: 94.5,
      mimeType: 'image/jpeg',
      fileSizeBytes: 412000,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Step 1: Execute B21 (Declaration Completeness)
    const b21Res = await request(app)
      .post('/api/v1/b21')
      .set('Authorization', `Bearer ${inspectorToken}`)
      .send({
        inspectionId,
        isImported: false,
        declarations: [
          { field: 'manufacturer_packer_importer', value: 'Haldiram Snacks Pvt Ltd, Noida 201301', confidence: 0.95, evidenceId: frontEvidenceId },
          { field: 'generic_name', value: 'Aloo Bhujia', confidence: 0.96, evidenceId: frontEvidenceId },
          { field: 'net_quantity', value: '1000 gms', confidence: 0.95, evidenceId: frontEvidenceId }, // Non-standard metric unit will be caught in B22
          { field: 'mfg_date', value: '11/2026', confidence: 0.94, evidenceId: frontEvidenceId }, // Post-dated will be caught in B24
          { field: 'mrp', value: 'MRP ₹ 180.00', confidence: 0.95, evidenceId: frontEvidenceId }, // Missing taxes will be caught in B22
          // Missing consumer_care field! B21 should FLAG this
        ]
      });

    expect(b21Res.status).toBe(200);
    expect(b21Res.body.data.summary.flagged).toBe(1); // Missing consumer care

    // Step 2: Execute B22 (MRP & Net Quantity Engine)
    const b22Res = await request(app)
      .post('/api/v1/b22')
      .set('Authorization', `Bearer ${inspectorToken}`)
      .send({
        inspectionId,
        mrpDeclaration: {
          rawText: 'MRP ₹ 180.00', // Missing 'inclusive of all taxes'
          confidence: 0.95,
          evidenceId: frontEvidenceId,
          boundingBox: { ymin: 0.75, xmin: 0.7, ymax: 0.82, xmax: 0.92 }
        },
        netQuantityDeclaration: {
          rawText: 'Net Weight: 1000 gms', // Illegal 'gms'
          confidence: 0.95,
          evidenceId: frontEvidenceId,
          boundingBox: { ymin: 0.70, xmin: 0.7, ymax: 0.74, xmax: 0.88 }
        },
      });

    expect(b22Res.status).toBe(200);
    expect(b22Res.body.data.summary.flagged).toBeGreaterThanOrEqual(2); // MRP tax missing + 'gms' non-standard

    // Step 3: Execute B23 (Entity & Consumer Care Engine)
    const b23Res = await request(app)
      .post('/api/v1/b23')
      .set('Authorization', `Bearer ${inspectorToken}`)
      .send({
        inspectionId,
        entityDeclaration: {
          entityType: 'MANUFACTURER',
          rawText: 'Manufactured by Haldiram Snacks Pvt Ltd, Sector 68, Noida, Uttar Pradesh 201301',
          pinCode: '201301',
          confidence: 0.95,
          evidenceId: frontEvidenceId,
        },
        consumerCareDeclaration: {
          rawText: 'Customer Support: 1800-102-5555, email: feedback@haldiram.com',
          phone: '1800-102-5555',
          email: 'feedback@haldiram.com',
          confidence: 0.95,
          evidenceId: frontEvidenceId,
        }
      });

    expect(b23Res.status).toBe(200);
    expect(b23Res.body.data.summary.passed).toBe(3); // Valid address with PIN, valid phone, valid email

    // Step 4: Execute B24 (Date & Placement/Font-Size Engine)
    const b24Res = await request(app)
      .post('/api/v1/b24')
      .set('Authorization', `Bearer ${inspectorToken}`)
      .send({
        inspectionId,
        inspectionDate: '2026-09-04T12:00:00Z',
        dateDeclaration: {
          rawText: 'Pkd Date: 12/2026', // Post-dated Dec 2026
          month: 12,
          year: 2026,
          confidence: 0.95,
          evidenceId: frontEvidenceId,
        },
        packageDetails: {
          netQuantityGramsOrMl: 1000,
          measuredFontHeightMm: 3.0,
          contrastRatio: 4.8,
          isLegible: true,
          evidenceId: frontEvidenceId,
        }
      });

    expect(b24Res.status).toBe(200);
    expect(b24Res.body.data.summary.flagged).toBeGreaterThanOrEqual(1); // Post-dated

    // Step 5: Execute B25 (Violation Generation & Evidence Mapping)
    const b25Res = await request(app)
      .post('/api/v1/b25')
      .set('Authorization', `Bearer ${inspectorToken}`)
      .send({
        inspectionId,
      });

    expect(b25Res.status).toBe(200);
    expect(b25Res.body.data.violations.length).toBeGreaterThanOrEqual(4);

    // Verify all generated violations link back to evidence and contain legal citations
    for (const v of b25Res.body.data.violations) {
      expect(v.inspectionId).toBe(inspectionId);
      expect(v.legalReference).toBeDefined();
      expect(v.severity).toMatch(/^(CRITICAL|MAJOR|MINOR)$/);
      expect(v.status).toBe('OPEN');
    }

    // Step 6: Query B25 violations list with filter
    const listRes = await request(app)
      .get(`/api/v1/b25?inspectionId=${inspectionId}&severity=CRITICAL`)
      .set('Authorization', `Bearer ${inspectorToken}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.data.length).toBeGreaterThanOrEqual(1);
    for (const v of listRes.body.data) {
      expect(v.severity).toBe('CRITICAL');
    }
  });
});
