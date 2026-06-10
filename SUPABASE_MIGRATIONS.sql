-- ============================================================
-- NEST Advisors — Missing Tables Migration
-- Generated: 2026-06-09
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/gvwstkarllsfykdvblac/sql
--
-- Tables created by this script (in dependency order):
--   1.  contacts
--   2.  signals
--   3.  document_extractions
--   4.  construction_milestones
--   5.  construction_draws
--   6.  change_orders
--   7.  portfolio_bonds
--   8.  surveillance_alerts
--   9.  trustee_tasks
--   10. parsed_bonds
--   11. risk_assessments
-- ============================================================

-- ─── updated_at trigger function (safe: CREATE OR REPLACE) ───
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 1. contacts — universal address book (person OR firm)
-- Source: migrations/003_contacts_counterparties.sql
-- ============================================================
CREATE TABLE IF NOT EXISTS contacts (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id        text UNIQUE,
  type               text NOT NULL CHECK (type IN ('person','firm')),
  name               text NOT NULL,
  doing_business_as  text,
  title              text,
  firm_id            uuid REFERENCES contacts(id) ON DELETE SET NULL,
  firm_type          text,
  email              text,
  phone              text,
  linkedin           text,
  website            text,
  hq_address         text,
  secondary_offices  jsonb NOT NULL DEFAULT '[]'::jsonb,
  finra_bd_number    text,
  msrb_ma_id         text,
  serves_as          text[] NOT NULL DEFAULT '{}',
  osint_dossier_ref  text,
  background_notes   text,
  sector_fit_flag    text,
  tags               text[] NOT NULL DEFAULT '{}',
  created_at         timestamptz NOT NULL DEFAULT NOW(),
  updated_at         timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contacts_type      ON contacts(type);
CREATE INDEX IF NOT EXISTS idx_contacts_email     ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_firm_id   ON contacts(firm_id);
CREATE INDEX IF NOT EXISTS idx_contacts_serves_as ON contacts USING GIN(serves_as);
CREATE INDEX IF NOT EXISTS idx_contacts_tags      ON contacts USING GIN(tags);

DROP TRIGGER IF EXISTS contacts_updated_at ON contacts;
CREATE TRIGGER contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS contacts_admin ON contacts;
CREATE POLICY contacts_admin ON contacts FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 2. signals — EagleEye market signals
-- Source: migrations/002_credit_bonds_risk.sql
-- ============================================================
CREATE TABLE IF NOT EXISTS signals (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scout_id                    uuid,
  signal_type                 text NOT NULL,
  source                      text NOT NULL,
  entity_name                 text,
  entity_type                 text,
  location_state              text,
  location_city               text,
  sector                      text,
  naics_code                  text,
  data                        jsonb NOT NULL DEFAULT '{}',
  node_count                  integer NOT NULL DEFAULT 0,
  score                       numeric,
  status                      text NOT NULL DEFAULT 'raw'
                              CHECK (status IN ('raw','scored','prospect','dismissed')),
  promoted_to_prospect_at     timestamptz,
  dismissed_at                timestamptz,
  created_at                  timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_signals_status ON signals(status);
CREATE INDEX IF NOT EXISTS idx_signals_score  ON signals(score DESC);

ALTER TABLE signals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS signals_admin ON signals;
CREATE POLICY signals_admin ON signals FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 3. document_extractions — Roots parser output per document
-- Source: migrations/009_construction_surveillance.sql
-- ============================================================
CREATE TABLE IF NOT EXISTS document_extractions (
  id               bigserial PRIMARY KEY,
  deal_id          uuid NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  document_id      text,
  extraction_type  text NOT NULL,   -- 'financials','operating','debt_schedule','pro_forma'
  extracted_data   jsonb DEFAULT '{}',
  confidence       numeric DEFAULT 0,
  extracted_at     timestamptz DEFAULT NOW(),
  source_filename  text
);

CREATE INDEX IF NOT EXISTS idx_doc_extractions_deal ON document_extractions(deal_id);
CREATE INDEX IF NOT EXISTS idx_doc_extractions_type ON document_extractions(extraction_type);

ALTER TABLE document_extractions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS document_extractions_admin ON document_extractions;
CREATE POLICY document_extractions_admin ON document_extractions FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 4. construction_milestones — project milestone tracker
-- Source: migrations/009_construction_surveillance.sql
-- ============================================================
CREATE TABLE IF NOT EXISTS construction_milestones (
  id              text PRIMARY KEY,
  deal_id         uuid NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  task_key        text NOT NULL,
  task_label      text NOT NULL,
  budget_usd      numeric DEFAULT 0,
  spent_usd       numeric DEFAULT 0,
  completion_pct  integer DEFAULT 0,
  critical        boolean DEFAULT FALSE,
  status          text DEFAULT 'pending',
  actual_date     date,
  planned_date    date,
  notes           text,
  created_at      timestamptz DEFAULT NOW(),
  updated_at      timestamptz DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_constr_milestones_deal ON construction_milestones(deal_id);

DROP TRIGGER IF EXISTS construction_milestones_updated_at ON construction_milestones;
CREATE TRIGGER construction_milestones_updated_at
  BEFORE UPDATE ON construction_milestones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE construction_milestones ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS construction_milestones_admin ON construction_milestones;
CREATE POLICY construction_milestones_admin ON construction_milestones FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 5. construction_draws — draw request records
-- Source: migrations/009_construction_surveillance.sql
-- ============================================================
CREATE TABLE IF NOT EXISTS construction_draws (
  id           text PRIMARY KEY,
  deal_id      uuid NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  draw_number  integer NOT NULL,
  amount_usd   numeric NOT NULL,
  status       text DEFAULT 'scheduled',
  category     text,
  funded_date  date,
  notes        text,
  created_at   timestamptz DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_constr_draws_deal ON construction_draws(deal_id);

ALTER TABLE construction_draws ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS construction_draws_admin ON construction_draws;
CREATE POLICY construction_draws_admin ON construction_draws FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 6. change_orders — GC change order log
-- Source: migrations/009_construction_surveillance.sql
-- ============================================================
CREATE TABLE IF NOT EXISTS change_orders (
  id               bigserial PRIMARY KEY,
  deal_id          uuid NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  co_id            text,
  description      text NOT NULL,
  amount_usd       numeric NOT NULL,
  status           text DEFAULT 'pending',
  schedule_impact  text DEFAULT 'None',
  created_at       timestamptz DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_change_orders_deal ON change_orders(deal_id);

ALTER TABLE change_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS change_orders_admin ON change_orders;
CREATE POLICY change_orders_admin ON change_orders FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 7. portfolio_bonds — live bond inventory (Surveillance desk)
-- Source: migrations/009_construction_surveillance.sql
-- ============================================================
CREATE TABLE IF NOT EXISTS portfolio_bonds (
  id                   bigserial PRIMARY KEY,
  deal_id              uuid REFERENCES deals(id),
  issuer_name          text NOT NULL,
  cusip                text,
  par_amount           numeric,
  coupon_rate          numeric,
  maturity_date        date,
  rating               text,
  dscr                 numeric,
  ltv                  numeric,
  refunding_candidate  boolean DEFAULT FALSE,
  status               text DEFAULT 'active',
  created_at           timestamptz DEFAULT NOW()
);

ALTER TABLE portfolio_bonds ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS portfolio_bonds_admin ON portfolio_bonds;
CREATE POLICY portfolio_bonds_admin ON portfolio_bonds FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 8. surveillance_alerts — bond surveillance alert queue
-- Source: migrations/009_construction_surveillance.sql
-- ============================================================
CREATE TABLE IF NOT EXISTS surveillance_alerts (
  id           bigserial PRIMARY KEY,
  deal_id      uuid REFERENCES deals(id),
  bond         text NOT NULL,
  type         text NOT NULL,
  detail       text,
  severity     text DEFAULT 'watch',
  resolved     boolean DEFAULT FALSE,
  resolved_at  timestamptz,
  created_at   timestamptz DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_surv_alerts_deal     ON surveillance_alerts(deal_id);
CREATE INDEX IF NOT EXISTS idx_surv_alerts_resolved ON surveillance_alerts(resolved);

ALTER TABLE surveillance_alerts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS surveillance_alerts_admin ON surveillance_alerts;
CREATE POLICY surveillance_alerts_admin ON surveillance_alerts FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 9. trustee_tasks — trustee checklist per deal
-- Source: migrations/008_trustee_tasks.sql
-- ============================================================
CREATE TABLE IF NOT EXISTS trustee_tasks (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id       uuid REFERENCES deals(id) ON DELETE CASCADE,
  task_key      text NOT NULL,
  task_label    text NOT NULL,
  phase         text NOT NULL CHECK (phase IN ('pre-issuance','post-issuance','ongoing')),
  status        text NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending','in_progress','completed','blocked')),
  assignee      text,
  due_date      date,
  completed_at  timestamptz,
  notes         text,
  created_at    timestamptz NOT NULL DEFAULT NOW(),
  updated_at    timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trustee_tasks_deal_id ON trustee_tasks(deal_id);
CREATE INDEX IF NOT EXISTS idx_trustee_tasks_phase   ON trustee_tasks(phase);
CREATE INDEX IF NOT EXISTS idx_trustee_tasks_status  ON trustee_tasks(status);

DROP TRIGGER IF EXISTS trustee_tasks_updated_at ON trustee_tasks;
CREATE TRIGGER trustee_tasks_updated_at
  BEFORE UPDATE ON trustee_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE trustee_tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS trustee_tasks_admin ON trustee_tasks;
CREATE POLICY trustee_tasks_admin ON trustee_tasks FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 10. parsed_bonds — EMMA/CUSIP parsed bond data cache
-- (not in migration files — synthesized from platform context)
-- ============================================================
CREATE TABLE IF NOT EXISTS parsed_bonds (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cusip            text UNIQUE,
  issuer_name      text NOT NULL,
  issue_date       date,
  maturity_date    date,
  par_amount       numeric,
  coupon_rate      numeric,
  coupon_type      text DEFAULT 'fixed' CHECK (coupon_type IN ('fixed','variable','zero')),
  rating_sp        text,
  rating_moodys    text,
  rating_fitch     text,
  state            text,
  sector           text,
  use_of_proceeds  text,
  call_date        date,
  call_price       numeric,
  emma_url         text,
  raw_data         jsonb DEFAULT '{}',
  parsed_at        timestamptz DEFAULT NOW(),
  created_at       timestamptz NOT NULL DEFAULT NOW(),
  updated_at       timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_parsed_bonds_cusip  ON parsed_bonds(cusip);
CREATE INDEX IF NOT EXISTS idx_parsed_bonds_state  ON parsed_bonds(state);
CREATE INDEX IF NOT EXISTS idx_parsed_bonds_sector ON parsed_bonds(sector);

DROP TRIGGER IF EXISTS parsed_bonds_updated_at ON parsed_bonds;
CREATE TRIGGER parsed_bonds_updated_at
  BEFORE UPDATE ON parsed_bonds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE parsed_bonds ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS parsed_bonds_admin ON parsed_bonds;
CREATE POLICY parsed_bonds_admin ON parsed_bonds FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 11. risk_assessments — Sentinel full risk assessment records
-- (not in migration files — synthesized from platform context)
-- ============================================================
CREATE TABLE IF NOT EXISTS risk_assessments (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id             uuid NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  assessment_type     text NOT NULL DEFAULT 'full'
                      CHECK (assessment_type IN ('full','quick','stress','covenant')),
  overall_score       numeric(5,2) DEFAULT 0 CHECK (overall_score BETWEEN 0 AND 100),
  grade               text,
  credit_risk         numeric(5,2) DEFAULT 0,
  market_risk         numeric(5,2) DEFAULT 0,
  construction_risk   numeric(5,2) DEFAULT 0,
  legal_risk          numeric(5,2) DEFAULT 0,
  operational_risk    numeric(5,2) DEFAULT 0,
  environmental_risk  numeric(5,2) DEFAULT 0,
  political_risk      numeric(5,2) DEFAULT 0,
  lgd_bare            numeric(5,2),
  lgd_surety          numeric(5,2),
  lgd_dual_wrap       numeric(5,2),
  stress_results      jsonb NOT NULL DEFAULT '{}',
  alerts              jsonb NOT NULL DEFAULT '[]',
  narrative           text,
  run_by              text DEFAULT 'Sentinel',
  assessed_at         timestamptz NOT NULL DEFAULT NOW(),
  created_at          timestamptz NOT NULL DEFAULT NOW(),
  updated_at          timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_risk_assessments_deal_id  ON risk_assessments(deal_id);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_grade    ON risk_assessments(grade);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_score    ON risk_assessments(overall_score);

DROP TRIGGER IF EXISTS risk_assessments_updated_at ON risk_assessments;
CREATE TRIGGER risk_assessments_updated_at
  BEFORE UPDATE ON risk_assessments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE risk_assessments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS risk_assessments_admin ON risk_assessments;
CREATE POLICY risk_assessments_admin ON risk_assessments FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- DONE — 11 tables created
-- ============================================================
