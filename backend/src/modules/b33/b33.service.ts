import { v4 as uuidv4 } from 'uuid';
import { B33Repository } from './b33.repository.js';
import { 
  GeoQuery, 
  RecalculateGeoMetricsInput, 
  UpdateGeoZoneInput 
} from './b33.schemas.js';
import { 
  GeographicZoneMetric, 
  GeoRiskTier 
} from '../../shared/types/index.js';
import { AuthUser } from '../../shared/auth/index.js';
import { ApiError } from '../../shared/errors/index.js';
import { auditLogService } from '../../shared/audit/index.js';

export class B33Service {
  constructor(private repo: B33Repository = new B33Repository()) {}

  public async listGeoZones(query: GeoQuery) {
    return this.repo.getGeoZones(query);
  }

  public async getGeoZoneById(id: string): Promise<GeographicZoneMetric> {
    const zone = await this.repo.findGeoZoneById(id);
    if (!zone) {
      throw ApiError.notFound('33_NOT_FOUND', `Geographic zone with ID '${id}' not found`);
    }
    return zone;
  }

  public async recalculateZoneMetrics(
    input: RecalculateGeoMetricsInput,
    user: AuthUser,
    ipAddress?: string
  ): Promise<GeographicZoneMetric> {
    const inspections = await this.repo.getInspectionsInZone(input.state, input.district);
    const inspectionIds = inspections.map(i => i.id);
    const violations = await this.repo.getViolationsForInspections(inspectionIds);

    const totalInspections = inspections.length;
    const totalViolations = violations.length;

    let complianceRate = 100.0;
    if (totalInspections > 0) {
      const nonCompliantCount = new Set(violations.map(v => v.inspectionId)).size;
      complianceRate = parseFloat(
        (((totalInspections - nonCompliantCount) / totalInspections) * 100).toFixed(2)
      );
    }

    let riskTier: GeoRiskTier = 'LOW';
    let isHotspot = false;

    if (complianceRate < 60.0 || totalViolations >= 15) {
      riskTier = 'CRITICAL';
      isHotspot = true;
    } else if (complianceRate < 75.0 || totalViolations >= 8) {
      riskTier = 'HIGH';
      isHotspot = true;
    } else if (complianceRate < 85.0 || totalViolations >= 3) {
      riskTier = 'MEDIUM';
      isHotspot = false;
    }

    const existing = await this.repo.findGeoZoneByLocation(input.state, input.district);

    const zone: GeographicZoneMetric = existing ? {
      ...existing,
      pinCode: input.pinCode || existing.pinCode,
      coordinates: input.coordinates || existing.coordinates,
      totalInspections,
      totalViolations,
      complianceRate,
      riskTier,
      isHotspot,
      activeInspectorsCount: input.activeInspectorsCount,
      lastInspectedAt: inspections.length > 0 ? inspections[inspections.length - 1].createdAt : existing.lastInspectedAt,
      updatedAt: new Date(),
    } : {
      id: uuidv4(),
      state: input.state,
      district: input.district,
      pinCode: input.pinCode,
      coordinates: input.coordinates,
      totalInspections,
      totalViolations,
      complianceRate,
      riskTier,
      isHotspot,
      activeInspectorsCount: input.activeInspectorsCount,
      lastInspectedAt: inspections.length > 0 ? inspections[inspections.length - 1].createdAt : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const saved = await this.repo.saveGeoZone(zone);

    await auditLogService.log({
      userId: user.id,
      action: 'RECALCULATE_GEO_ZONE_METRICS',
      objectType: 'GEO_ZONE',
      objectId: saved.id,
      newValue: { state: saved.state, district: saved.district, riskTier: saved.riskTier, isHotspot: saved.isHotspot },
      ipAddress,
    });

    return saved;
  }

  public async updateGeoZone(
    id: string,
    input: UpdateGeoZoneInput,
    user: AuthUser,
    ipAddress?: string
  ): Promise<GeographicZoneMetric> {
    const zone = await this.getGeoZoneById(id);
    const prev = { ...zone };

    if (input.isHotspot !== undefined) zone.isHotspot = input.isHotspot;
    if (input.riskTier) zone.riskTier = input.riskTier;
    if (input.activeInspectorsCount !== undefined) zone.activeInspectorsCount = input.activeInspectorsCount;
    zone.updatedAt = new Date();

    const updated = await this.repo.saveGeoZone(zone);

    await auditLogService.log({
      userId: user.id,
      action: 'UPDATE_GEO_ZONE',
      objectType: 'GEO_ZONE',
      objectId: id,
      previousValue: prev,
      newValue: updated,
      reason: input.notes,
      ipAddress,
    });

    return updated;
  }
}
