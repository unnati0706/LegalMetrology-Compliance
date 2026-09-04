-- SIH26034 Legal Metrology Compliance Platform
-- Migration: 001_initial_schema.sql
-- Base Schema for Modules B21 - B25

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Rules Table
CREATE TABLE IF NOT EXISTS rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_code VARCHAR(64) NOT NULL,
    version VARCHAR(32) NOT NULL,
    category VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    legal_reference VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(32) NOT NULL DEFAULT 'MAJOR',
    is_active BOOLEAN NOT NULL DEFAULT true,
    validation_config JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    CONSTRAINT uq_rule_code_version UNIQUE (rule_code, version)
);

CREATE INDEX IF NOT EXISTS idx_rules_category ON rules(category);
CREATE INDEX IF NOT EXISTS idx_rules_version ON rules(version);
CREATE INDEX IF NOT EXISTS idx_rules_active ON rules(is_active);

-- 2. Evidence Table
CREATE TABLE IF NOT EXISTS evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inspection_id UUID NOT NULL,
    image_url TEXT NOT NULL,
    storage_key VARCHAR(255) NOT NULL,
    package_side VARCHAR(32) NOT NULL DEFAULT 'PDP',
    quality_score NUMERIC(5, 2) NULL,
    mime_type VARCHAR(64) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);

CREATE INDEX IF NOT EXISTS idx_evidence_inspection ON evidence(inspection_id);

-- 3. Declarations Table
CREATE TABLE IF NOT EXISTS declarations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inspection_id UUID NOT NULL,
    field VARCHAR(128) NOT NULL,
    value TEXT NOT NULL,
    raw_text TEXT NULL,
    confidence NUMERIC(5, 4) NOT NULL DEFAULT 0.9000,
    status VARCHAR(32) NOT NULL DEFAULT 'DETECTED',
    evidence_id UUID NULL REFERENCES evidence(id) ON DELETE SET NULL,
    bounding_box JSONB NULL,
    corrected_by UUID NULL,
    correction_reason TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);

CREATE INDEX IF NOT EXISTS idx_declarations_inspection ON declarations(inspection_id);
CREATE INDEX IF NOT EXISTS idx_declarations_field ON declarations(field);
CREATE INDEX IF NOT EXISTS idx_declarations_status ON declarations(status);

-- 4. Check Results Table
CREATE TABLE IF NOT EXISTS check_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inspection_id UUID NOT NULL,
    rule_id UUID NOT NULL REFERENCES rules(id) ON DELETE RESTRICT,
    rule_code VARCHAR(64) NULL,
    rule_version VARCHAR(32) NOT NULL,
    status VARCHAR(32) NOT NULL, -- PASS, FLAG, MANUAL_REVIEW
    confidence NUMERIC(5, 4) NOT NULL DEFAULT 1.0000,
    explanation TEXT NOT NULL,
    evidence_id UUID NULL REFERENCES evidence(id) ON DELETE SET NULL,
    declaration_id UUID NULL REFERENCES declarations(id) ON DELETE SET NULL,
    bounding_box JSONB NULL,
    evaluation_details JSONB NULL,
    is_overridden BOOLEAN NOT NULL DEFAULT false,
    overridden_by UUID NULL,
    override_reason TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);

CREATE INDEX IF NOT EXISTS idx_check_results_inspection ON check_results(inspection_id);
CREATE INDEX IF NOT EXISTS idx_check_results_rule ON check_results(rule_id);
CREATE INDEX IF NOT EXISTS idx_check_results_status ON check_results(status);
CREATE INDEX IF NOT EXISTS idx_check_results_created ON check_results(created_at);

-- 5. Violations Table
CREATE TABLE IF NOT EXISTS violations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inspection_id UUID NOT NULL,
    check_result_id UUID NOT NULL REFERENCES check_results(id) ON DELETE RESTRICT,
    rule_id UUID NOT NULL REFERENCES rules(id) ON DELETE RESTRICT,
    rule_code VARCHAR(64) NOT NULL,
    rule_version VARCHAR(32) NOT NULL,
    legal_reference VARCHAR(255) NOT NULL,
    violation_type VARCHAR(255) NOT NULL,
    severity VARCHAR(32) NOT NULL DEFAULT 'MAJOR', -- CRITICAL, MAJOR, MINOR
    explanation TEXT NOT NULL,
    evidence_id UUID NULL REFERENCES evidence(id) ON DELETE SET NULL,
    package_side VARCHAR(32) DEFAULT 'PDP',
    bounding_box JSONB NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'OPEN', -- OPEN, IN_REVIEW, RESOLVED, OVERRIDDEN, DISMISSED
    resolution_notes TEXT NULL,
    resolved_by UUID NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);

CREATE INDEX IF NOT EXISTS idx_violations_inspection ON violations(inspection_id);
CREATE INDEX IF NOT EXISTS idx_violations_severity ON violations(severity);
CREATE INDEX IF NOT EXISTS idx_violations_status ON violations(status);
CREATE INDEX IF NOT EXISTS idx_violations_rule_code ON violations(rule_code);
CREATE INDEX IF NOT EXISTS idx_violations_created ON violations(created_at);

-- 6. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(64) NOT NULL,
    action VARCHAR(128) NOT NULL,
    object_type VARCHAR(64) NOT NULL,
    object_id VARCHAR(64) NOT NULL,
    previous_value JSONB NULL,
    new_value JSONB NULL,
    reason TEXT NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_object ON audit_logs(object_type, object_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_time ON audit_logs(timestamp);
