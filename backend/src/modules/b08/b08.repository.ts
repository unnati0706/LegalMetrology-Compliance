import { v4 as uuidv4 } from 'uuid';

export interface ProductEntity {
  id: string;
  name: string;
  sku: string;
  category: string;
  brand: string;
  manufacturerId: string;
  packageType: string;
  netQuantity: number;
  unit: string;
  barcode?: string;
  mrp?: string;
  manufacturerName?: string;
  consumerCare?: string;
  countryOfOrigin?: string;
  expectedCompliance?: string;
  expectedViolations?: string;
  source?: string;
  license?: string;
  base64Image?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

const productsStore: Map<string, ProductEntity> = new Map();

// Seed initial curated dataset products
export function seedDatasetProductsInMemory() {
  try {
    const fs = require('fs');
    const path = require('path');
    const csvPath = path.join(process.cwd(), 'data', 'metadata', 'metadata.csv');
    const productsDir = path.join(process.cwd(), 'data', 'products');
    
    if (fs.existsSync(csvPath)) {
      const csvContent = fs.readFileSync(csvPath, 'utf-8');
      const lines = csvContent.split('\n').filter(Boolean);
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',');
        if (cols.length >= 23) {
          const id = cols[0].trim();
          const barcode = cols[1].trim();
          const name = cols[2].trim();
          const brand = cols[3].trim();
          const category = cols[4].trim();
          const netQtyRaw = cols[8].trim();
          const mrp = cols[9].trim();
          const mfr = cols[10].trim();
          const origin = cols[13].trim();
          const care = cols[16].trim();
          const expectedComp = cols[19].trim();
          const expectedViol = cols[20].trim();
          const source = cols[21].trim();
          const license = cols[22].trim();

          let base64Image = '';
          const b64Path = path.join(productsDir, `${id}.base64`);
          if (fs.existsSync(b64Path)) {
            base64Image = fs.readFileSync(b64Path, 'utf-8');
          }

          productsStore.set(id, {
            id,
            name,
            sku: `SKU-${barcode || id}`,
            category,
            brand,
            manufacturerId: 'usr_mfr',
            packageType: 'Package',
            netQuantity: parseFloat(netQtyRaw) || 500,
            unit: netQtyRaw.includes('L') ? 'L' : netQtyRaw.includes('ml') ? 'ml' : 'g',
            barcode,
            mrp,
            manufacturerName: mfr,
            consumerCare: care,
            countryOfOrigin: origin,
            expectedCompliance: expectedComp,
            expectedViolations: expectedViol,
            source,
            license,
            base64Image,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            deletedAt: null,
          });
        }
      }
      return;
    }
  } catch (err: any) {
    console.warn('[B08Repository] Note reading metadata.csv for seeding:', err.message);
  }

  // Fallback initial seeds if CSV not yet read
  const defaultProdId = 'prod_maggie_001';
  productsStore.set(defaultProdId, {
    id: defaultProdId,
    name: 'Maggi 2-Minute Noodles 70g',
    sku: 'MAGGI-70G-IN',
    category: 'Packaged Food',
    brand: 'Maggi',
    manufacturerId: 'usr_mfr',
    packageType: 'pouch',
    netQuantity: 70,
    unit: 'g',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  });
}

// Initial auto-seed
seedDatasetProductsInMemory();

export class B08Repository {
  async findAll(filters: { category?: string; manufacturerId?: string; limit?: number; offset?: number }) {
    const limit = filters.limit || 10;
    const offset = filters.offset || 0;
    let list = Array.from(productsStore.values()).filter((p) => !p.deletedAt);

    if (filters.category) {
      list = list.filter((p) => p.category.toLowerCase() === filters.category!.toLowerCase());
    }
    if (filters.manufacturerId) {
      list = list.filter((p) => p.manufacturerId === filters.manufacturerId);
    }

    return {
      items: list.slice(offset, offset + limit),
      total: list.length,
    };
  }

  async findById(id: string): Promise<ProductEntity | null> {
    const p = productsStore.get(id);
    if (!p || p.deletedAt) return null;
    return p;
  }

  async create(data: { name: string; sku: string; category: string; brand: string; manufacturerId: string; packageType?: string; netQuantity: number; unit?: string }): Promise<ProductEntity> {
    const id = uuidv4();
    const product: ProductEntity = {
      id,
      name: data.name,
      sku: data.sku,
      category: data.category,
      brand: data.brand,
      manufacturerId: data.manufacturerId,
      packageType: data.packageType || 'box',
      netQuantity: data.netQuantity,
      unit: data.unit || 'g',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    };
    productsStore.set(id, product);
    return product;
  }

  async update(id: string, updates: Partial<ProductEntity>): Promise<ProductEntity | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const updated: ProductEntity = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    productsStore.set(id, updated);
    return updated;
  }
}
