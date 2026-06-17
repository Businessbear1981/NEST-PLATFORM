-- ═══════════════════════════════════════════════════════════════
-- NEST PLATFORM — EXTENDED SCHEMA (tables 19-41)
-- Run AFTER 005_complete_platform_schema.sql
-- Project: tquotedgiapmivitjipn
-- Safe to re-run: all statements are idempotent
-- ═══════════════════════════════════════════════════════════════

-- ── 19. USERS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  full_name text,
  role text NOT NULL DEFAULT 'analyst',
  org_id uuid,
  avatar_url text,
  last_login_at timestamptz,
  is_active boolean DEFAULT true,
  jwt_sub text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS users_open ON users;
CREATE POLICY users_open ON users FOR ALL USING (true) WITH CHECK (true);

-- ── 20. ORGANIZATIONS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  org_type text DEFAULT 'bd_firm',
  license_track text DEFAULT 'track_1',
  contact_name text,
  contact_email text,
  contact_phone text,
  address text,
  finra_crd text,
  sec_number text,
  is_active boolean DEFAULT true,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
INSERT INTO organizations (name, org_type, license_track, contact_name, contact_email)
VALUES ('Arden Edge Capital','principal','track_3','Sean Gilmore','sean.gilmore@ardanedgecapital.com')
ON CONFLICT DO NOTHING;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS org_open ON organizations;
CREATE POLICY org_open ON organizations FOR ALL USING (true) WITH CHECK (true);

-- add FK now that both tables exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES organizations(id) ON DELETE SET NULL;

-- ── 21. ORG_DEALS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS org_deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  deal_id uuid NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  access_level text DEFAULT 'view',
  granted_at timestamptz DEFAULT now(),
  granted_by uuid REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE(org_id, deal_id)
);
ALTER TABLE org_deals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS od_open ON org_deals;
CREATE POLICY od_open ON org_deals FOR ALL USING (true) WITH CHECK (true);

-- ── 22. CONTACTS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  contact_type text DEFAULT 'general',
  org_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  deal_id uuid REFERENCES deals(id) ON DELETE SET NULL,
  email text,
  phone text,
  title text,
  company text,
  linkedin_url text,
  notes text,
  tags text[] DEFAULT '{}',
  last_contacted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS con_open ON contacts;
CREATE POLICY con_open ON contacts FOR ALL USING (true) WITH CHECK (true);

-- ── 23. PROSPECTS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS prospects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  entity_type text,
  sector text,
  naics_code text,
  location_state text,
  location_city text,
  estimated_value numeric,
  signal_score numeric,
  source text,
  source_data jsonb DEFAULT '{}',
  status text DEFAULT 'new',
  promoted_to_deal_id uuid REFERENCES deals(id) ON DELETE SET NULL,
  promoted_at timestamptz,
  dismissed_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS pro_open ON prospects;
CREATE POLICY pro_open ON prospects FOR ALL USING (true) WITH CHECK (true);

-- ── 24. SCOUTS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  scout_type text DEFAULT 'eagleeye',
  config jsonb NOT NULL DEFAULT '{}',
  target_states text[] DEFAULT '{}',
  target_sectors text[] DEFAULT '{}',
  min_deal_size numeric,
  max_deal_size numeric,
  is_active boolean DEFAULT true,
  last_run_at timestamptz,
  run_count integer DEFAULT 0,
  signals_generated integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE scouts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS scout_open ON scouts;
CREATE POLICY scout_open ON scouts FOR ALL USING (true) WITH CHECK (true);

-- ── 25. CORRESPONDENCE ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS correspondence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid REFERENCES deals(id) ON DELETE SET NULL,
  contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  corr_type text DEFAULT 'email',
  direction text DEFAULT 'outbound',
  subject text,
  body text,
  status text DEFAULT 'draft',
  sent_at timestamptz,
  opened_at timestamptz,
  replied_at timestamptz,
  sequence_step integer DEFAULT 1,
  agent_name text DEFAULT 'Aria',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE correspondence ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS corr_open ON correspondence;
CREATE POLICY corr_open ON correspondence FOR ALL USING (true) WITH CHECK (true);

-- ── 26. MEMOS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS memos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid REFERENCES deals(id) ON DELETE CASCADE,
  memo_type text NOT NULL DEFAULT 'credit_memo',
  title text NOT NULL,
  body text NOT NULL,
  version integer DEFAULT 1,
  status text DEFAULT 'draft',
  word_count integer,
  tone text DEFAULT 'jimmy_lee',
  generated_by text DEFAULT 'Morgan',
  approved_by uuid REFERENCES users(id) ON DELETE SET NULL,
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE memos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS memo_open ON memos;
CREATE POLICY memo_open ON memos FOR ALL USING (true) WITH CHECK (true);

-- ── 27. MARKET_DATA_CACHE ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS market_data_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_key text NOT NULL UNIQUE,
  signal_type text NOT NULL,
  source text NOT NULL,
  value numeric,
  value_text text,
  metadata jsonb DEFAULT '{}',
  fetched_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  is_stale boolean DEFAULT false
);
ALTER TABLE market_data_cache ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS mdc_open ON market_data_cache;
CREATE POLICY mdc_open ON market_data_cache FOR ALL USING (true) WITH CHECK (true);

-- ── 28. HFT_POSITIONS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hft_positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instrument text NOT NULL,
  instrument_type text NOT NULL,
  direction text NOT NULL DEFAULT 'long',
  quantity numeric NOT NULL DEFAULT 0,
  entry_price numeric,
  current_price numeric,
  notional_value numeric,
  unrealized_pnl numeric,
  realized_pnl numeric DEFAULT 0,
  strategy text,
  opened_at timestamptz DEFAULT now(),
  closed_at timestamptz,
  status text DEFAULT 'open',
  agent_name text DEFAULT 'Quantum'
);
ALTER TABLE hft_positions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS hft_open ON hft_positions;
CREATE POLICY hft_open ON hft_positions FOR ALL USING (true) WITH CHECK (true);

-- ── 29. CALL_SCHEDULES ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS call_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  bond_structure_id uuid REFERENCES bond_structures(id) ON DELETE CASCADE,
  call_type text NOT NULL DEFAULT 'optional',
  call_date date NOT NULL,
  call_price_pct numeric DEFAULT 100,
  par_amount numeric,
  series_label text,
  trigger_conditions jsonb DEFAULT '{}',
  status text DEFAULT 'pending',
  exercised_at timestamptz,
  agent_recommendation text,
  vector_score numeric,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE call_schedules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS cs_open ON call_schedules;
CREATE POLICY cs_open ON call_schedules FOR ALL USING (true) WITH CHECK (true);

-- ── 30. PLACEMENT_ALLOCATIONS ────────────────────────────────────
CREATE TABLE IF NOT EXISTS placement_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  investor_id uuid REFERENCES investors(id) ON DELETE SET NULL,
  bond_structure_id uuid REFERENCES bond_structures(id) ON DELETE SET NULL,
  series_label text,
  allocated_amount numeric NOT NULL,
  coupon_pct numeric,
  allocation_pct numeric,
  status text DEFAULT 'indicated',
  indication_date date,
  commitment_date date,
  funded_date date,
  aec_token_units numeric,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE placement_allocations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS pa_open ON placement_allocations;
CREATE POLICY pa_open ON placement_allocations FOR ALL USING (true) WITH CHECK (true);

-- ── 31. EXTERNAL_RELATIONSHIPS ───────────────────────────────────
CREATE TABLE IF NOT EXISTS external_relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  entity_type text NOT NULL,
  entity_name text NOT NULL,
  contact_name text,
  contact_email text,
  contact_phone text,
  role text,
  fee_pct numeric,
  fee_amount numeric,
  engagement_status text DEFAULT 'pending',
  signed_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE external_relationships ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS er_open ON external_relationships;
CREATE POLICY er_open ON external_relationships FOR ALL USING (true) WITH CHECK (true);

-- ── 32. SURETY_APPLICATIONS ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS surety_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  surety_provider text DEFAULT 'Hylant',
  bond_amount numeric,
  premium_pct numeric,
  premium_amount numeric,
  indemnitor text,
  status text DEFAULT 'draft',
  submitted_at timestamptz,
  approved_at timestamptz,
  issued_at timestamptz,
  expiry_date date,
  bond_number text,
  underwriter_name text,
  underwriter_email text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE surety_applications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS sa_open ON surety_applications;
CREATE POLICY sa_open ON surety_applications FOR ALL USING (true) WITH CHECK (true);

-- ── 33. DEAL_TEAM_MEMBERS ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS deal_team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  name text,
  role text NOT NULL,
  email text,
  is_lead boolean DEFAULT false,
  added_at timestamptz DEFAULT now()
);
ALTER TABLE deal_team_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS dtm_open ON deal_team_members;
CREATE POLICY dtm_open ON deal_team_members FOR ALL USING (true) WITH CHECK (true);

-- ── 34. SERIES_ALLOCATIONS ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS series_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bond_structure_id uuid NOT NULL REFERENCES bond_structures(id) ON DELETE CASCADE,
  investor_id uuid REFERENCES investors(id) ON DELETE SET NULL,
  series_label text NOT NULL,
  par_allocated numeric NOT NULL,
  coupon_pct numeric,
  yield_to_maturity numeric,
  price numeric DEFAULT 100,
  settlement_date date,
  cusip text,
  status text DEFAULT 'book',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE series_allocations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS sea_open ON series_allocations;
CREATE POLICY sea_open ON series_allocations FOR ALL USING (true) WITH CHECK (true);

-- ── 35. INDUSTRY_SILOS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS industry_silos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  naics_code text NOT NULL UNIQUE,
  naics_title text NOT NULL,
  silo_name text,
  sector text,
  typical_dscr_min numeric,
  typical_dscr_max numeric,
  typical_ltv_max numeric,
  typical_d_ebitda_max numeric,
  rma_spread_available boolean DEFAULT false,
  bond_eligible boolean DEFAULT true,
  notes text
);
ALTER TABLE industry_silos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS is_open ON industry_silos;
CREATE POLICY is_open ON industry_silos FOR ALL USING (true) WITH CHECK (true);

-- ── 36. PERMISSIONS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  resource text NOT NULL,
  action text NOT NULL,
  granted boolean DEFAULT true,
  granted_by uuid REFERENCES users(id) ON DELETE SET NULL,
  granted_at timestamptz DEFAULT now(),
  UNIQUE(user_id, resource, action)
);
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS perm_open ON permissions;
CREATE POLICY perm_open ON permissions FOR ALL USING (true) WITH CHECK (true);

-- ── 37. NOTIFICATIONS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  deal_id uuid REFERENCES deals(id) ON DELETE CASCADE,
  notif_type text NOT NULL,
  title text NOT NULL,
  body text,
  priority text DEFAULT 'normal',
  read boolean DEFAULT false,
  read_at timestamptz,
  action_url text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS notif_open ON notifications;
CREATE POLICY notif_open ON notifications FOR ALL USING (true) WITH CHECK (true);

-- ── 38. AUDIT_LOG ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  deal_id uuid REFERENCES deals(id) ON DELETE SET NULL,
  action text NOT NULL,
  resource text NOT NULL,
  resource_id text,
  old_value jsonb,
  new_value jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS al_open ON audit_log;
CREATE POLICY al_open ON audit_log FOR ALL USING (true) WITH CHECK (true);

-- ── 39. API_CALL_LOG ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS api_call_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  api_name text NOT NULL,
  endpoint text NOT NULL,
  method text DEFAULT 'GET',
  deal_id uuid REFERENCES deals(id) ON DELETE SET NULL,
  agent_name text,
  request_payload jsonb,
  response_status integer,
  response_summary text,
  latency_ms integer,
  success boolean DEFAULT true,
  error_message text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE api_call_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS acl_open ON api_call_log;
CREATE POLICY acl_open ON api_call_log FOR ALL USING (true) WITH CHECK (true);

-- ── 40. DEAL_FINANCIALS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS deal_financials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  fiscal_year integer NOT NULL,
  period_type text DEFAULT 'annual',
  gross_revenue numeric,
  effective_gross_income numeric,
  operating_expenses numeric,
  noi numeric,
  ebitda numeric,
  total_debt numeric,
  debt_service numeric,
  interest_expense numeric,
  total_assets numeric,
  total_equity numeric,
  capex numeric,
  occupancy_pct numeric,
  units_total integer,
  units_occupied integer,
  source text DEFAULT 'submitted',
  version integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE deal_financials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS df_open ON deal_financials;
CREATE POLICY df_open ON deal_financials FOR ALL USING (true) WITH CHECK (true);

-- ── 41. BERNARD_SESSIONS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bernard_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid REFERENCES deals(id) ON DELETE SET NULL,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  session_mode text DEFAULT 'standard',
  messages jsonb NOT NULL DEFAULT '[]',
  tool_calls jsonb NOT NULL DEFAULT '[]',
  actions_taken jsonb NOT NULL DEFAULT '[]',
  tokens_used integer DEFAULT 0,
  started_at timestamptz DEFAULT now(),
  last_message_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  summary text
);
ALTER TABLE bernard_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS bern_open ON bernard_sessions;
CREATE POLICY bern_open ON bernard_sessions FOR ALL USING (true) WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════
-- DONE — tables 19-41 (23 tables)
-- Total platform tables: 41 + outcome_stats view
-- ═══════════════════════════════════════════════════════════════
