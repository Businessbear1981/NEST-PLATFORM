-- Migration 009: Construction + Surveillance tables

-- Construction milestones
CREATE TABLE IF NOT EXISTS construction_milestones (
    id TEXT PRIMARY KEY,
    deal_id TEXT NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    task_key TEXT NOT NULL,
    task_label TEXT NOT NULL,
    budget_usd NUMERIC DEFAULT 0,
    spent_usd NUMERIC DEFAULT 0,
    completion_pct INTEGER DEFAULT 0,
    critical BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'pending',
    actual_date DATE,
    planned_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_constr_milestones_deal ON construction_milestones(deal_id);

-- Construction draws
CREATE TABLE IF NOT EXISTS construction_draws (
    id TEXT PRIMARY KEY,
    deal_id TEXT NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    draw_number INTEGER NOT NULL,
    amount_usd NUMERIC NOT NULL,
    status TEXT DEFAULT 'scheduled',
    category TEXT,
    funded_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_constr_draws_deal ON construction_draws(deal_id);

-- Change orders
CREATE TABLE IF NOT EXISTS change_orders (
    id BIGSERIAL PRIMARY KEY,
    deal_id TEXT NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    co_id TEXT,
    description TEXT NOT NULL,
    amount_usd NUMERIC NOT NULL,
    status TEXT DEFAULT 'pending',
    schedule_impact TEXT DEFAULT 'None',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_change_orders_deal ON change_orders(deal_id);

-- Portfolio bonds (Surveillance)
CREATE TABLE IF NOT EXISTS portfolio_bonds (
    id BIGSERIAL PRIMARY KEY,
    deal_id TEXT REFERENCES deals(id),
    issuer_name TEXT NOT NULL,
    cusip TEXT,
    par_amount NUMERIC,
    coupon_rate NUMERIC,
    maturity_date DATE,
    rating TEXT,
    dscr NUMERIC,
    ltv NUMERIC,
    refunding_candidate BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Surveillance alerts
CREATE TABLE IF NOT EXISTS surveillance_alerts (
    id BIGSERIAL PRIMARY KEY,
    deal_id TEXT REFERENCES deals(id),
    bond TEXT NOT NULL,
    type TEXT NOT NULL,
    detail TEXT,
    severity TEXT DEFAULT 'watch',
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_surv_alerts_deal ON surveillance_alerts(deal_id);
CREATE INDEX IF NOT EXISTS idx_surv_alerts_resolved ON surveillance_alerts(resolved);

-- Document extractions (Migration 009b — was planned as 009 in build series)
CREATE TABLE IF NOT EXISTS document_extractions (
    id BIGSERIAL PRIMARY KEY,
    deal_id TEXT NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    document_id TEXT,
    extraction_type TEXT NOT NULL, -- 'financials', 'operating', 'debt_schedule', 'pro_forma'
    extracted_data JSONB DEFAULT '{}',
    confidence NUMERIC DEFAULT 0,
    extracted_at TIMESTAMPTZ DEFAULT NOW(),
    source_filename TEXT
);
CREATE INDEX IF NOT EXISTS idx_doc_extractions_deal ON document_extractions(deal_id);
CREATE INDEX IF NOT EXISTS idx_doc_extractions_type ON document_extractions(extraction_type);
