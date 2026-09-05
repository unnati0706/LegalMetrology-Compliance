-- Migration 003: Pipeline Entities (Image Quality Results, OCR Results, Vision Detections)

CREATE TABLE IF NOT EXISTS image_quality_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evidence_id UUID NOT NULL REFERENCES evidence(id) ON DELETE CASCADE,
    blur_score NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
    glare_score NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
    crop_score NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
    overall_quality NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
    is_acceptable BOOLEAN NOT NULL DEFAULT TRUE,
    flags JSONB NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_image_quality_evidence ON image_quality_results(evidence_id);

CREATE TABLE IF NOT EXISTS ocr_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evidence_id UUID NOT NULL REFERENCES evidence(id) ON DELETE CASCADE,
    raw_text TEXT NOT NULL,
    overall_confidence NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
    blocks JSONB NOT NULL,
    provider_name VARCHAR(100) NOT NULL DEFAULT 'tesseract',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ocr_results_evidence ON ocr_results(evidence_id);

CREATE TABLE IF NOT EXISTS vision_detections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evidence_id UUID NOT NULL REFERENCES evidence(id) ON DELETE CASCADE,
    region_type VARCHAR(100) NOT NULL, -- PDP, MRP, NET_QUANTITY, MANUFACTURER_INFO
    bounding_box JSONB NOT NULL, -- { x, y, width, height }
    confidence NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_vision_detections_evidence ON vision_detections(evidence_id);
