-- =========================================================
-- TruthBot CockroachDB Schema (Distributed Vector Architecture)
-- =========================================================

-- 1. Users & Passwordless Auth
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email STRING UNIQUE NOT NULL,
    name STRING,
    push_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT clock_timestamp(),
    last_login_at TIMESTAMPTZ DEFAULT clock_timestamp()
);

CREATE TABLE IF NOT EXISTS auth_otps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email STRING NOT NULL,
    code STRING NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT clock_timestamp()
);

-- 2. Predatory Legal Knowledge Base (Vector Index)
CREATE TABLE IF NOT EXISTS predatory_knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category STRING NOT NULL, -- e.g., 'ARBITRATION', 'DATA_SELLING', 'UNILATERAL_MODS', 'AI_TRAINING', 'LIABILITY_WAIVER'
    severity STRING NOT NULL, -- 'CRITICAL', 'HIGH_RISK', 'RISK', 'SAFE'
    title STRING NOT NULL,
    pattern_description STRING NOT NULL,
    sample_clause STRING NOT NULL,
    plain_english STRING NOT NULL,
    remedy STRING NOT NULL,
    embedding VECTOR(1536),
    created_at TIMESTAMPTZ DEFAULT clock_timestamp()
);

-- 3. Monitored Agreements (Ledger for Autonomous Sentinel)
CREATE TABLE IF NOT EXISTS monitored_agreements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    service_name STRING NOT NULL,
    url STRING NOT NULL,
    content_hash STRING,
    summary STRING,
    critical_actions JSONB DEFAULT '[]'::jsonb,
    is_sentinel_active BOOLEAN DEFAULT true,
    last_checked_at TIMESTAMPTZ DEFAULT clock_timestamp(),
    created_at TIMESTAMPTZ DEFAULT clock_timestamp()
);

-- 4. Analyzed Agreement Clauses (Hybrid Relational + Vector)
CREATE TABLE IF NOT EXISTS agreement_clauses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agreement_id UUID REFERENCES monitored_agreements(id) ON DELETE CASCADE,
    clause_title STRING NOT NULL,
    clause_text STRING NOT NULL,
    severity STRING NOT NULL, -- 'Risk', 'High Risk'
    category STRING NOT NULL,
    plain_english STRING NOT NULL,
    risk_explanation STRING NOT NULL,
    remedy STRING,
    embedding VECTOR(1536),
    created_at TIMESTAMPTZ DEFAULT clock_timestamp()
);

-- 5. Agreement Diffs (Audit Trail for Stealth Updates)
CREATE TABLE IF NOT EXISTS agreement_diffs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agreement_id UUID REFERENCES monitored_agreements(id) ON DELETE CASCADE,
    service_name STRING NOT NULL,
    detected_at TIMESTAMPTZ DEFAULT clock_timestamp(),
    update_type STRING, -- 'UPDATE' (new terms) or 'CHANGE' (twisted existing terms)
    changes_summary STRING NOT NULL,
    diff_clauses JSONB DEFAULT '[]'::jsonb,
    notification_dispatched BOOLEAN DEFAULT false
);

-- 6. Autonomous Sentinel Audit Log
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type STRING NOT NULL,
    service_name STRING,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT clock_timestamp()
);
