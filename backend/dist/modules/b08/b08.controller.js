"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProduct = exports.createProduct = exports.getProductById = exports.getProducts = void 0;
const b08_service_1 = require("./b08.service");
const service = new b08_service_1.B08Service();
const getProducts = async (req, res, next) => {
    try {
        const user = req.user;
        const category = req.query.category;
        const limit = parseInt(req.query.limit || '10', 10);
        const offset = parseInt(req.query.offset || '0', 10);
        const result = await service.getProducts(user.role, user.id, category, limit, offset);
        res.json({
            success: true,
            data: result.items,
            pagination: { limit, offset, total: result.total },
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getProducts = getProducts;
const getProductById = async (req, res, next) => {
    try {
        const user = req.user;
        const product = await service.getProductById(req.params.id, user.role, user.id);
        res.json({ success: true, data: product });
    }
    catch (err) {
        next(err);
    }
};
exports.getProductById = getProductById;
const createProduct = async (req, res, next) => {
    try {
        const user = req.user;
        const product = await service.createProduct(req.body, user.role, user.id);
        res.status(201).json({ success: true, data: product });
    }
    catch (err) {
        next(err);
    }
};
exports.createProduct = createProduct;
const updateProduct = async (req, res, next) => {
    try {
        const user = req.user;
        const product = await service.updateProduct(req.params.id, req.body, user.role, user.id);
        res.json({ success: true, data: product });
    }
    catch (err) {
        next(err);
    }
};
exports.updateProduct = updateProduct;
