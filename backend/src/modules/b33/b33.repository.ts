import { db } from '../../shared/database/index.js';
import { GeographicZoneMetric, Inspection, Violation } from '../../shared/types/index.js';
import { GeoQuery } from './b33.schemas.js';

export class B33Repository {
  public async getGeoZones(query: GeoQuery): Promise<{ items: GeographicZoneMetric[]; total: number }> {
    let list = Array.from(db.store.geoZones.values()).filter(g => !g.deletedAt);

    if (query.state) {
      list = list.filter(g => g.state.toLowerCase() === query.state!.toLowerCase());
    }
    if (query.district) {
      list = list.filter(g => g.district?.toLowerCase() === query.district!.toLowerCase());
    }
    if (query.pinCode) {
      list = list.filter(g => g.pinCode === query.pinCode);
    }
    if (query.isHotspot !== undefined) {
      list = list.filter(g => g.isHotspot === query.isHotspot);
    }
    if (query.riskTier) {
      list = list.filter(g => g.riskTier === query.riskTier);
    }

    list.sort((a, b) => b.totalViolations - a.totalViolations);

    const total = list.length;
    const startIndex = (query.page - 1) * query.limit;
    const items = list.slice(startIndex, startIndex + query.limit);

    return { items, total };
  }

  public async findGeoZoneById(id: string): Promise<GeographicZoneMetric | null> {
    const g = db.store.geoZones.get(id);
    if (!g || g.deletedAt) return null;
    return g;
  }

  public async findGeoZoneByLocation(state: string, district?: string): Promise<GeographicZoneMetric | null> {
    for (const g of db.store.geoZones.values()) {
      if (
        !g.deletedAt &&
        g.state.toLowerCase() === state.toLowerCase() &&
        (!district || g.district?.toLowerCase() === district.toLowerCase())
      ) {
        return g;
      }
    }
    return null;
  }

  public async saveGeoZone(zone: GeographicZoneMetric): Promise<GeographicZoneMetric> {
    db.store.geoZones.set(zone.id, zone);
    return zone;
  }

  public async getInspectionsInZone(state: string, district?: string): Promise<Inspection[]> {
    return Array.from(db.store.inspections.values()).filter(i => {
      if (i.deletedAt) return false;
      const loc = i.location?.toLowerCase() || '';
      const stateMatch = loc.includes(state.toLowerCase());
      const distMatch = district ? loc.includes(district.toLowerCase()) : true;
      return stateMatch && distMatch;
    });
  }

  public async getViolationsForInspections(inspectionIds: string[]): Promise<Violation[]> {
    const idSet = new Set(inspectionIds);
    return Array.from(db.store.violations.values()).filter(
      v => !v.deletedAt && idSet.has(v.inspectionId)
    );
  }
}
