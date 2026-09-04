"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateEvidence = exports.uploadEvidence = exports.getEvidenceById = exports.getEvidenceList = void 0;
const b10_service_1 = require("./b10.service");
const service = new b10_service_1.B10Service();
const getEvidenceList = async (req, res, next) => {
    try {
        const inspectionId = req.query.inspectionId;
        const limit = parseInt(req.query.limit || '10', 10);
        const offset = parseInt(req.query.offset || '0', 10);
        const result = await service.getEvidenceList(inspectionId, limit, offset);
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
exports.getEvidenceList = getEvidenceList;
const getEvidenceById = async (req, res, next) => {
    try {
        const evidence = await service.getEvidenceById(req.params.id);
        res.json({ success: true, data: evidence });
    }
    catch (err) {
        next(err);
    }
};
exports.getEvidenceById = getEvidenceById;
const uploadEvidence = async (req, res, next) => {
    try {
        const user = req.user;
        const evidence = await service.uploadEvidence(req.body, user.id);
        res.status(201).json({ success: true, data: evidence });
    }
    catch (err) {
        next(err);
    }
};
exports.uploadEvidence = uploadEvidence;
const updateEvidence = async (req, res, next) => {
    try {
        const user = req.user;
        const evidence = await service.updateEvidence(req.params.id, req.body, user.id);
        res.json({ success: true, data: evidence });
    }
    catch (err) {
        next(err);
    }
};
exports.updateEvidence = updateEvidence;
