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
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

const productsStore: Map<string, ProductEntity> = new Map();

// Seed initial products
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
