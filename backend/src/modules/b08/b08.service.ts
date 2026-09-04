import { B08Repository, ProductEntity } from './b08.repository';
import { NotFoundError, ValidationError, PermissionDeniedError } from '../../shared/errors';
import { recordAuditLog } from '../../shared/audit';

export class B08Service {
  private repo = new B08Repository();

  async getProducts(userRole: string, userId: string, category?: string, limit = 10, offset = 0) {
    // Manufacturer scoped endpoint only returns products belonging to that manufacturer's account
    const manufacturerIdFilter = userRole === 'Manufacturer' ? userId : undefined;
    return this.repo.findAll({ category, manufacturerId: manufacturerIdFilter, limit, offset });
  }

  async getProductById(id: string, userRole: string, userId: string): Promise<ProductEntity> {
    const product = await this.repo.findById(id);
    if (!product) {
      throw new NotFoundError('08', 'Product');
    }
    if (userRole === 'Manufacturer' && product.manufacturerId !== userId) {
      throw new PermissionDeniedError('Manufacturer can only view products belonging to their account');
    }
    return product;
  }

  async createProduct(payload: { name: string; sku: string; category: string; brand: string; manufacturerId?: string; packageType?: string; netQuantity: number; unit?: string }, userRole: string, userId: string): Promise<ProductEntity> {
    if (!payload.name || !payload.sku || !payload.category || !payload.brand || payload.netQuantity === undefined) {
      throw new ValidationError('name, sku, category, brand, and netQuantity are required');
    }

    const manufacturerId = userRole === 'Manufacturer' ? userId : (payload.manufacturerId || userId);

    const created = await this.repo.create({ ...payload, manufacturerId });
    recordAuditLog({
      userId,
      action: 'CREATE_PRODUCT',
      entityType: 'Product',
      entityId: created.id,
      newValue: created,
    });
    return created;
  }

  async updateProduct(id: string, updates: Partial<ProductEntity>, userRole: string, userId: string): Promise<ProductEntity> {
    const previous = await this.getProductById(id, userRole, userId);
    const updated = await this.repo.update(id, updates);
    if (!updated) {
      throw new NotFoundError('08', 'Product');
    }

    recordAuditLog({
      userId,
      action: 'UPDATE_PRODUCT',
      entityType: 'Product',
      entityId: id,
      previousValue: previous,
      newValue: updated,
    });
    return updated;
  }
}
