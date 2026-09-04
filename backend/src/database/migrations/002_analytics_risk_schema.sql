-- SIH26034 Legal Metrology Compliance Platform
-- Migration: 002_analytics_risk_schema.sql
-- Schema extensions for Modules B31 - B35 (Analytics, Trends, Geo, Risk Scoring, Inspect-Next)

-- 1. Analytics Snapshots Table (B31)
CREATE TABLE IF NOT EXISTS analytics_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    period_type VARCHAR(32) NOT NULL DEFAULT 'MONTHLY',
    period_key VARCHAR(64) NOT NULL,
    metrics_summary JSONB NOT NULL,
    generated_by UUID NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);

CREATE INDEX IF NOT EXISTS idx_analytics_period_key ON analytics_snapshots(period_key);
CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics_snapshots(created_at);

-- 2. Violation Patterns Table (B32)
CREATE TABLE IF NOT EXISTS violation_patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pattern_code VARCHAR(64) NOT NULL UNIQUE,
    pattern_type VARCHAR(64) NOT NULL,
    entity_id VARCHAR(128) NOT NULL,
    entity_type VARCHAR(32) NOT NULL,
    entity_name VARCHAR(255) NOT NULL,
    rule_codes JSONB NOT NULL,
    occurrence_count INT NOT NULL DEFAULT 1,
    severity VARCHAR(32) NOT NULL DEFAULT 'MAJOR',
    confidence NUMERIC(5, 4) NOT NULL DEFAULT 0.9500,
    explanation TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    first_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);

CREATE INDEX IF NOT EXISTS idx_patterns_entity ON violation_patterns(entity_id, entity_type);
CREATE INDEX IF NOT EXISTS idx_patterns_type ON violation_patterns(pattern_type);
CREATE INDEX IF NOT EXISTS idx_patterns_status ON violation_patterns(status);

-- 3. Geographic Zone Metrics Table (B33)
CREATE TABLE IF NOT EXISTS geo_zone_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    state VARCHAR(128) NOT NULL,
    district VARCHAR(128) NULL,
    pin_code VARCHAR(16) NULL,
    coordinates JSONB NULL,
    total_inspections INT NOT NULL DEFAULT 0,
    total_violations INT NOT NULL DEFAULT 0,
    compliance_rate NUMERIC(5, 2) NOT NULL DEFAULT 100.00,
    risk_tier VARCHAR(32) NOT NULL DEFAULT 'LOW',
    is_hotspot BOOLEAN NOT NULL DEFAULT false,
    active_inspectors_count INT NOT NULL DEFAULT 0,
    last_inspected_at TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);

CREATE INDEX IF NOT EXISTS idx_geo_state ON geo_zone_metrics(state);
CREATE INDEX IF NOT EXISTS idx_geo_district ON geo_zone_metrics(district);
CREATE INDEX IF NOT EXISTS idx_geo_pin ON geo_zone_metrics(pin_code);
CREATE INDEX IF NOT EXISTS idx_geo_hotspot ON geo_zone_metrics(is_hotspot);

-- 4. Risk Profiles Table (B34)
CREATE TABLE IF NOT EXISTS risk_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_id VARCHAR(128) NOT NULL,
    entity_type VARCHAR(32) NOT NULL,
    entity_name VARCHAR(255) NOT NULL,
    risk_score NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    risk_tier VARCHAR(32) NOT NULL DEFAULT 'LOW',
    factor_breakdown JSONB NOT NULL,
    explanation TEXT NOT NULL,
    confidence NUMERIC(5, 4) NOT NULL DEFAULT 1.0000,
    historical_inspection_count INT NOT NULL DEFAULT 0,
    historical_violation_count INT NOT NULL DEFAULT 0,
    last_computed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_overridden BOOLEAN NOT NULL DEFAULT false,
    overridden_by UUID NULL,
    override_reason TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    CONSTRAINT uq_risk_entity UNIQUE (entity_id, entity_type)
);

CREATE INDEX IF NOT EXISTS idx_risk_profiles_entity ON risk_profiles(entity_id, entity_type);
CREATE INDEX IF NOT EXISTS idx_risk_profiles_score ON risk_profiles(risk_score);
CREATE INDEX IF NOT EXISTS idx_risk_profiles_tier ON risk_profiles(risk_tier);

-- 5. Inspect-Next Queue Table (B35)
CREATE TABLE IF NOT EXISTS inspect_next_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_id VARCHAR(128) NOT NULL,
    entity_type VARCHAR(32) NOT NULL DEFAULT 'MANUFACTURER',
    target_name VARCHAR(255) NOT NULL,
    category VARCHAR(128) NOT NULL,
    region VARCHAR(255) NOT NULL,
    pin_code VARCHAR(16) NULL,
    priority_score NUMERIC(5, 2) NOT NULL DEFAULT 50.00,
    risk_tier VARCHAR(32) NOT NULL DEFAULT 'MEDIUM',
    risk_profile_id UUID NULL REFERENCES risk_profiles(id) ON DELETE SET NULL,
    recommended_checklist JSONB NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'QUEUED',
    assigned_inspector_id UUID NULL,
    assigned_inspector_name VARCHAR(255) NULL,
    assigned_at TIMESTAMP WITH TIME ZONE NULL,
    deferred_reason TEXT NULL,
    estimated_effort_hours NUMERIC(4, 2) DEFAULT 2.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);

CREATE INDEX IF NOT EXISTS idx_queue_status ON inspect_next_queue(status);
CREATE INDEX IF NOT EXISTS idx_queue_priority ON inspect_next_queue(priority_score);
CREATE INDEX IF NOT EXISTS idx_queue_inspector ON inspect_next_queue(assigned_inspector_id);
CREATE INDEX IF NOT EXISTS idx_queue_region ON inspect_next_queue(region);
