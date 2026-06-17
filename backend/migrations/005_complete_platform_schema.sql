-- ═══════════════════════════════════════════════════════════════
-- NEST PLATFORM — COMPLETE SUPABASE MIGRATION (18 tables + 1 view)
-- Project: tquotedgiapmivitjipn
-- Run at: https://supabase.com/dashboard/project/tquotedgiapmivitjipn/sql/new
-- Safe to re-run: all statements are idempotent (IF NOT EXISTS / ON CONFLICT)
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

-- ── 1. DEALS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL, slug text, deal_type text NOT NULL DEFAULT 'bond',
  status text NOT NULL DEFAULT 'intake', deal_size numeric,
  location_state text, location_city text, sector text, naics_code text,
  sponsor_name text, risk_grade text,
  project jsonb NOT NULL DEFAULT '{}', sponsor jsonb NOT NULL DEFAULT '{}',
  team jsonb NOT NULL DEFAULT '{}', financials jsonb NOT NULL DEFAULT '{}',
  readiness_score integer NOT NULL DEFAULT 0,
  readiness_checklist jsonb NOT NULL DEFAULT '{}',
  module_id integer NOT NULL DEFAULT 0, source_channel text, notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
DROP TRIGGER IF EXISTS deals_updated_at ON deals;
CREATE TRIGGER deals_updated_at BEFORE UPDATE ON deals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS deals_open ON deals;
CREATE POLICY deals_open ON deals FOR ALL USING (true) WITH CHECK (true);

-- ── 2. BOND_WORKFLOWS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bond_workflows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid REFERENCES deals(id) ON DELETE CASCADE,
  deal_type text NOT NULL DEFAULT 'Development',
  current_phase text DEFAULT 'phase_1',
  overall_readiness_score numeric(5,2) DEFAULT 0,
  ai_evaluation_summary jsonb DEFAULT '{}',
  toggled_off_modules text[] DEFAULT '{}',
  pooled_deal_ids uuid[] DEFAULT '{}',
  tranche_structure jsonb DEFAULT '{}',
  call_put_optionality text, master_trustee_id text,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
ALTER TABLE bond_workflows ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS bw_open ON bond_workflows;
CREATE POLICY bw_open ON bond_workflows FOR ALL USING (true) WITH CHECK (true);

-- ── 3. BOND_WORKFLOW_CHECKLISTS ─────────────────────────────────
CREATE TABLE IF NOT EXISTS bond_workflow_checklists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid REFERENCES bond_workflows(id) ON DELETE CASCADE,
  phase text NOT NULL, module text NOT NULL,
  item_key text NOT NULL, description text NOT NULL,
  required boolean DEFAULT true, completed boolean DEFAULT false,
  completed_at timestamptz, uploaded_doc_url text, notes text
);
ALTER TABLE bond_workflow_checklists ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS bwc_open ON bond_workflow_checklists;
CREATE POLICY bwc_open ON bond_workflow_checklists FOR ALL USING (true) WITH CHECK (true);

-- ── 4. BOND_STRUCTURES ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bond_structures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  par_amount numeric, series jsonb NOT NULL DEFAULT '[]',
  capital_stack jsonb NOT NULL DEFAULT '{}', blended_coupon numeric,
  weighted_avg_life numeric, all_in_tic numeric,
  call_provisions jsonb NOT NULL DEFAULT '{}',
  waterfall jsonb NOT NULL DEFAULT '{}',
  dsrf numeric, capitalized_interest numeric, cost_of_issuance numeric,
  version integer NOT NULL DEFAULT 1, created_at timestamptz DEFAULT now()
);
ALTER TABLE bond_structures ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS bs_open ON bond_structures;
CREATE POLICY bs_open ON bond_structures FOR ALL USING (true) WITH CHECK (true);

-- ── 5. CREDIT_ANALYSES ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS credit_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  noi numeric, ebitda numeric, debt_service numeric, total_debt numeric,
  project_value numeric, equity numeric, interest_expense numeric,
  dscr numeric, ltv numeric, cf_leverage numeric, bs_leverage numeric,
  d_ebitda numeric, icr numeric, debt_yield numeric,
  break_even_occupancy numeric, grade text, score integer,
  score_breakdown jsonb NOT NULL DEFAULT '{}',
  lgd_bare numeric, lgd_surety numeric, lgd_dual_wrap numeric,
  stress_results jsonb NOT NULL DEFAULT '{}',
  version integer NOT NULL DEFAULT 1, run_by text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE credit_analyses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS ca_open ON credit_analyses;
CREATE POLICY ca_open ON credit_analyses FOR ALL USING (true) WITH CHECK (true);

-- ── 6. COVENANTS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS covenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  covenant_type text NOT NULL, description text, threshold_value numeric,
  test_frequency text DEFAULT 'quarterly', in_compliance boolean DEFAULT true,
  last_tested_at timestamptz, breach_date timestamptz, breach_notes text,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
ALTER TABLE covenants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS cov_open ON covenants;
CREATE POLICY cov_open ON covenants FOR ALL USING (true) WITH CHECK (true);

-- ── 7. REFI_CYCLES ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS refi_cycles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  cycle_number integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'pending',
  target_rate numeric, notes text,
  triggered_at timestamptz, completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE refi_cycles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS rc_open ON refi_cycles;
CREATE POLICY rc_open ON refi_cycles FOR ALL USING (true) WITH CHECK (true);

-- ── 8. INVESTORS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS investors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL, entity_type text DEFAULT 'hnwi',
  investor_type text DEFAULT 'hnwi', aum numeric DEFAULT 0,
  tier text DEFAULT 'B', status text DEFAULT 'prospect',
  contact_email text, contact_phone text, notes text,
  allocation_history jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
ALTER TABLE investors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS inv_open ON investors;
CREATE POLICY inv_open ON investors FOR ALL USING (true) WITH CHECK (true);

-- ── 9. LENDERS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lenders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL, lender_type text DEFAULT 'bank',
  min_loan numeric, max_loan numeric, min_ltv numeric,
  max_ltv numeric, min_dscr numeric,
  preferred_sectors text[] DEFAULT '{}',
  preferred_states text[] DEFAULT '{}',
  rate_floor numeric, rate_ceiling numeric, origination_fee_pct numeric,
  contact_name text, contact_email text, notes text,
  active boolean DEFAULT true, created_at timestamptz DEFAULT now()
);
ALTER TABLE lenders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS lnd_open ON lenders;
CREATE POLICY lnd_open ON lenders FOR ALL USING (true) WITH CHECK (true);

-- ── 10. LENDER_MATCHES ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lender_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid REFERENCES deals(id) ON DELETE CASCADE,
  lender_id uuid REFERENCES lenders(id) ON DELETE CASCADE,
  score numeric, match_reasons jsonb DEFAULT '[]',
  proposed_rate numeric, proposed_amount numeric,
  status text DEFAULT 'pending', created_at timestamptz DEFAULT now()
);
ALTER TABLE lender_matches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS lm_open ON lender_matches;
CREATE POLICY lm_open ON lender_matches FOR ALL USING (true) WITH CHECK (true);

-- ── 11. AGENTS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE, status text DEFAULT 'idle',
  last_run_at timestamptz, run_count integer DEFAULT 0,
  error_log text, created_at timestamptz DEFAULT now()
);
INSERT INTO agents (name, status) VALUES
  ('Vector','idle'),('Apex','idle'),('Chain','idle'),('Atlas','idle'),
  ('Morgan','idle'),('Sterling','idle'),('Bridge','idle'),('Quantum','idle'),
  ('Maxwell','idle'),('Aria','idle'),('Merlin','idle'),('LenderScout','idle'),
  ('Prometheus','idle'),('Sentinel','idle'),('Blaze','idle')
ON CONFLICT (name) DO NOTHING;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS ag_open ON agents;
CREATE POLICY ag_open ON agents FOR ALL USING (true) WITH CHECK (true);

-- ── 12. RISK_SCORES ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS risk_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid REFERENCES deals(id) ON DELETE CASCADE,
  overall_score numeric, credit_risk numeric, market_risk numeric,
  construction_risk numeric, legal_risk numeric, operational_risk numeric,
  environmental_risk numeric, political_risk numeric, grade text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE risk_scores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS rs_open ON risk_scores;
CREATE POLICY rs_open ON risk_scores FOR ALL USING (true) WITH CHECK (true);

-- ── 13. RISK_ALERTS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS risk_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid REFERENCES deals(id) ON DELETE CASCADE,
  risk_score_id uuid REFERENCES risk_scores(id) ON DELETE SET NULL,
  severity text NOT NULL, category text NOT NULL,
  title text NOT NULL, description text,
  resolved boolean DEFAULT false, resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE risk_alerts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS ra_open ON risk_alerts;
CREATE POLICY ra_open ON risk_alerts FOR ALL USING (true) WITH CHECK (true);

-- ── 14. MODELING_RESULTS ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS modeling_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid REFERENCES deals(id) ON DELETE CASCADE,
  model_type text NOT NULL, version integer NOT NULL DEFAULT 1,
  inputs jsonb NOT NULL DEFAULT '{}', outputs jsonb NOT NULL DEFAULT '{}',
  irr numeric, npv numeric, dscr_min numeric, dscr_avg numeric,
  is_feasible boolean DEFAULT false, run_by text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE modeling_results ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS mr_open ON modeling_results;
CREATE POLICY mr_open ON modeling_results FOR ALL USING (true) WITH CHECK (true);

-- ── 15. MODEL_WEIGHTS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS model_weights (
  key text PRIMARY KEY, value jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);
INSERT INTO model_weights (key, value)
VALUES ('opba_v1','{"dscr":0.40,"leverage":0.30,"liquidity":0.30,"version":1,"updates":0}')
ON CONFLICT (key) DO NOTHING;
ALTER TABLE model_weights ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS mw_open ON model_weights;
CREATE POLICY mw_open ON model_weights FOR ALL USING (true) WITH CHECK (true);

-- ── 16. SIGNALS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_type text NOT NULL, source text NOT NULL,
  entity_name text, entity_type text,
  location_state text, location_city text, sector text, naics_code text,
  data jsonb NOT NULL DEFAULT '{}', node_count integer NOT NULL DEFAULT 0,
  score numeric, status text NOT NULL DEFAULT 'raw',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE signals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS sig_open ON signals;
CREATE POLICY sig_open ON signals FOR ALL USING (true) WITH CHECK (true);

-- ── 17. DOCUMENTS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid REFERENCES deals(id) ON DELETE CASCADE,
  doc_type text NOT NULL, filename text NOT NULL,
  storage_path text, parsed_data jsonb DEFAULT '{}',
  status text DEFAULT 'uploaded', uploaded_by text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS doc_open ON documents;
CREATE POLICY doc_open ON documents FOR ALL USING (true) WITH CHECK (true);

-- ── 18. DEAL_OUTCOMES ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS deal_outcomes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid REFERENCES deals(id) ON DELETE SET NULL,
  workflow_id uuid REFERENCES bond_workflows(id) ON DELETE SET NULL,
  moodys_rating text, sp_rating text, fitch_rating text,
  spread_bps_achieved numeric(7,2), coupon_pct_achieved numeric(6,4),
  total_principal_usd numeric(15,2), intake_date date, close_date date,
  surety_success boolean DEFAULT false, lc_required boolean DEFAULT false,
  green_bond boolean DEFAULT false, green_cert_body text,
  series_count integer DEFAULT 1, ltv_pct numeric(6,3),
  dscr_achieved numeric(6,3), ltc_pct numeric(6,3),
  learning_signals jsonb DEFAULT '[]', notes text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE deal_outcomes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS do_open ON deal_outcomes;
CREATE POLICY do_open ON deal_outcomes FOR ALL USING (true) WITH CHECK (true);

-- ── VIEW: OUTCOME_STATS ─────────────────────────────────────────
CREATE OR REPLACE VIEW outcome_stats AS
SELECT moodys_rating, COUNT(*) AS deal_count,
  ROUND(AVG(spread_bps_achieved),1) AS avg_spread_bps,
  ROUND(AVG(dscr_achieved),3) AS avg_dscr,
  ROUND(AVG(ltv_pct),2) AS avg_ltv
FROM deal_outcomes WHERE moodys_rating IS NOT NULL
GROUP BY moodys_rating ORDER BY moodys_rating;

-- ═══════════════════════════════════════════════════════════════
-- DONE — 18 tables + 1 view
-- ═══════════════════════════════════════════════════════════════
