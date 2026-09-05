-- Migration 004: Rules and Declarations Entities (Declarations, Rules)

CREATE TABLE IF NOT EXISTS declarations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inspection_id UUID NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
    evidence_id UUID NULL REFERENCES evidence(id) ON DELETE SET NULL,
    raw_extracted_fields JSONB NOT NULL,
    normalized_fields JSONB NOT NULL,
    field_confidences JSONB NOT NULL,
    overall_confidence NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
    is_manually_verified BOOLEAN NOT NULL DEFAULT FALSE,
    manual_override_reason TEXT NULL,
    verified_by UUID NULL REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_declarations_inspection ON declarations(inspection_id);

CREATE TABLE IF NOT EXISTS rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_code VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    section_reference VARCHAR(255) NOT NULL,
    category_applicability VARCHAR(100) NOT NULL DEFAULT 'ALL',
    version VARCHAR(50) NOT NULL DEFAULT '1.0.0',
    effective_from TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    effective_to TIMESTAMPTZ NULL,
    parameters JSONB NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_rules_code ON rules(rule_code);
CREATE INDEX IF NOT EXISTS idx_rules_category ON rules(category_applicability);
