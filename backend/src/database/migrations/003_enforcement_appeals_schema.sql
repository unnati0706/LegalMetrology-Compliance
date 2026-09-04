-- SIH26034 Legal Metrology Compliance Platform
-- Migration: 003_enforcement_appeals_schema.sql
-- Schema extensions for Modules B36 - B40 (Legal Notices, Appeals, Compounding Penalties, Self-Certification, Multi-Agency Case Dossiers)

-- 1. Legal Notices Table (B36)
CREATE TABLE IF NOT EXISTS legal_notices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notice_number VARCHAR(64) NOT NULL UNIQUE,
    notice_type VARCHAR(64) NOT NULL DEFAULT 'SHOW_CAUSE',
    inspection_id UUID NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
    manufacturer_id VARCHAR(128) NOT NULL,
    manufacturer_name VARCHAR(255) NOT NULL,
    issuing_authority VARCHAR(255) NOT NULL,
    statutory_reference TEXT NOT NULL,
    allegations JSONB NOT NULL DEFAULT '[]'::jsonb,
    response_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'ISSUED',
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    served_at TIMESTAMP WITH TIME ZONE NULL,
    served_to_email VARCHAR(255) NULL,
    digital_signature_hash VARCHAR(128) NULL,
    notes TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);

CREATE INDEX IF NOT EXISTS idx_notices_inspection ON legal_notices(inspection_id);
CREATE INDEX IF NOT EXISTS idx_notices_mfg ON legal_notices(manufacturer_id);
CREATE INDEX IF NOT EXISTS idx_notices_status ON legal_notices(status);
CREATE INDEX IF NOT EXISTS idx_notices_deadline ON legal_notices(response_deadline);

-- 2. Manufacturer Appeals & Rectification Table (B37)
CREATE TABLE IF NOT EXISTS manufacturer_appeals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appeal_number VARCHAR(64) NOT NULL UNIQUE,
    notice_id UUID NOT NULL REFERENCES legal_notices(id) ON DELETE CASCADE,
    manufacturer_id VARCHAR(128) NOT NULL,
    appellant_name VARCHAR(255) NOT NULL,
    grounds_for_appeal TEXT NOT NULL,
    corrective_action_plan TEXT NOT NULL,
    rectification_evidence JSONB NOT NULL DEFAULT '[]'::jsonb,
    status VARCHAR(32) NOT NULL DEFAULT 'SUBMITTED',
    reviewed_by UUID NULL REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE NULL,
    decision VARCHAR(32) NULL,
    decision_notes TEXT NULL,
    penalty_mitigation_percent NUMERIC(5, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);

CREATE INDEX IF NOT EXISTS idx_appeals_notice ON manufacturer_appeals(notice_id);
CREATE INDEX IF NOT EXISTS idx_appeals_mfg ON manufacturer_appeals(manufacturer_id);
CREATE INDEX IF NOT EXISTS idx_appeals_status ON manufacturer_appeals(status);

-- 3. Compounding & Penalties Table (B38)
CREATE TABLE IF NOT EXISTS penalty_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_number VARCHAR(64) NOT NULL UNIQUE,
    inspection_id UUID NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
    notice_id UUID NULL REFERENCES legal_notices(id) ON DELETE SET NULL,
    manufacturer_id VARCHAR(128) NOT NULL,
    manufacturer_name VARCHAR(255) NOT NULL,
    offense_type VARCHAR(64) NOT NULL DEFAULT 'FIRST_OFFENSE',
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    compounding_applicable BOOLEAN NOT NULL DEFAULT true,
    compounding_fee NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    breakdown JSONB NOT NULL DEFAULT '[]'::jsonb,
    status VARCHAR(32) NOT NULL DEFAULT 'ASSESSED',
    payment_reference VARCHAR(128) NULL,
    paid_at TIMESTAMP WITH TIME ZONE NULL,
    receipt_number VARCHAR(64) NULL,
    court_case_reference VARCHAR(128) NULL,
    assessed_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);

CREATE INDEX IF NOT EXISTS idx_penalties_mfg ON penalty_assessments(manufacturer_id);
CREATE INDEX IF NOT EXISTS idx_penalties_status ON penalty_assessments(status);
CREATE INDEX IF NOT EXISTS idx_penalties_inspection ON penalty_assessments(inspection_id);

-- 4. Pre-Market Self-Certifications Table (B39)
CREATE TABLE IF NOT EXISTS self_certifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    certificate_number VARCHAR(64) NOT NULL UNIQUE,
    manufacturer_id VARCHAR(128) NOT NULL,
    manufacturer_name VARCHAR(255) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    category VARCHAR(128) NOT NULL,
    sku VARCHAR(128) NOT NULL,
    artwork_image_url TEXT NOT NULL,
    declarations_declared JSONB NOT NULL DEFAULT '{}'::jsonb,
    compliance_score NUMERIC(5, 2) NOT NULL DEFAULT 100.00,
    passed_checks JSONB NOT NULL DEFAULT '[]'::jsonb,
    flagged_defects JSONB NOT NULL DEFAULT '[]'::jsonb,
    status VARCHAR(32) NOT NULL DEFAULT 'VERIFIED_COMPLIANT',
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
    digital_seal_hash VARCHAR(128) NOT NULL,
    certified_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);

CREATE INDEX IF NOT EXISTS idx_certs_mfg ON self_certifications(manufacturer_id);
CREATE INDEX IF NOT EXISTS idx_certs_sku ON self_certifications(sku);
CREATE INDEX IF NOT EXISTS idx_certs_status ON self_certifications(status);

-- 5. Multi-Agency Case Dossiers Table (B40)
CREATE TABLE IF NOT EXISTS case_dossiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dossier_number VARCHAR(64) NOT NULL UNIQUE,
    inspection_id UUID NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
    target_agency VARCHAR(64) NOT NULL,
    case_title VARCHAR(255) NOT NULL,
    manufacturer_id VARCHAR(128) NOT NULL,
    manufacturer_name VARCHAR(255) NOT NULL,
    statutory_offenses JSONB NOT NULL DEFAULT '[]'::jsonb,
    summary_of_evidence JSONB NOT NULL,
    payload_checksum VARCHAR(128) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'GENERATED',
    transmission_timestamp TIMESTAMP WITH TIME ZONE NULL,
    external_acknowledgment_ref VARCHAR(128) NULL,
    compiled_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);

CREATE INDEX IF NOT EXISTS idx_dossiers_target ON case_dossiers(target_agency);
CREATE INDEX IF NOT EXISTS idx_dossiers_inspection ON case_dossiers(inspection_id);
CREATE INDEX IF NOT EXISTS idx_dossiers_mfg ON case_dossiers(manufacturer_id);
