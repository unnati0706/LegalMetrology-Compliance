"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.B08Service = void 0;
const b08_repository_1 = require("./b08.repository");
const errors_1 = require("../../shared/errors");
const audit_1 = require("../../shared/audit");
class B08Service {
    repo = new b08_repository_1.B08Repository();
    async getProducts(userRole, userId, category, limit = 10, offset = 0) {
        // Manufacturer scoped endpoint only returns products belonging to that manufacturer's account
        const manufacturerIdFilter = userRole === 'Manufacturer' ? userId : undefined;
        return this.repo.findAll({ category, manufacturerId: manufacturerIdFilter, limit, offset });
    }
    async getProductById(id, userRole, userId) {
        const product = await this.repo.findById(id);
        if (!product) {
            throw new errors_1.NotFoundError('08', 'Product');
        }
        if (userRole === 'Manufacturer' && product.manufacturerId !== userId) {
            throw new errors_1.PermissionDeniedError('Manufacturer can only view products belonging to their account');
        }
        return product;
    }
    async createProduct(payload, userRole, userId) {
        if (!payload.name || !payload.sku || !payload.category || !payload.brand || payload.netQuantity === undefined) {
            throw new errors_1.ValidationError('name, sku, category, brand, and netQuantity are required');
        }
        const manufacturerId = userRole === 'Manufacturer' ? userId : (payload.manufacturerId || userId);
        const created = await this.repo.create({ ...payload, manufacturerId });
        (0, audit_1.recordAuditLog)({
            userId,
            action: 'CREATE_PRODUCT',
            entityType: 'Product',
            entityId: created.id,
            newValue: created,
        });
        return created;
    }
    async updateProduct(id, updates, userRole, userId) {
        const previous = await this.getProductById(id, userRole, userId);
        const updated = await this.repo.update(id, updates);
        if (!updated) {
            throw new errors_1.NotFoundError('08', 'Product');
        }
        (0, audit_1.recordAuditLog)({
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
exports.B08Service = B08Service;
