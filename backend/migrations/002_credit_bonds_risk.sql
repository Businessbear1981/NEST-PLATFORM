-- 002_credit_bonds_risk.sql

-- Credit analysis results (Maxwell output)
create table if not exists credit_analyses (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references deals(id) on delete cascade,
  noi numeric, ebitda numeric, debt_service numeric, total_debt numeric,
  project_value numeric, equity numeric, interest_expense numeric,
  dscr numeric, ltv numeric, cf_leverage numeric, bs_leverage numeric,
  d_ebitda numeric, icr numeric, debt_yield numeric, break_even_occupancy numeric,
  grade text, score integer, score_breakdown jsonb not null default '{}',
  lgd_bare numeric, lgd_surety numeric, lgd_dual_wrap numeric,
  stress_results jsonb not null default '{}',
  version integer not null default 1, run_by text,
  created_at timestamptz not null default now()
);
create index idx_credit_deal on credit_analyses(deal_id);

-- Bond structure
create table if not exists bond_structures (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references deals(id) on delete cascade,
  par_amount numeric,
  series jsonb not null default '[]',
  capital_stack jsonb not null default '{}',
  blended_coupon numeric, weighted_avg_life numeric, all_in_tic numeric,
  call_provisions jsonb not null default '{}',
  waterfall jsonb not null default '{}',
  dsrf numeric, capitalized_interest numeric, cost_of_issuance numeric,
  version integer not null default 1,
  created_at timestamptz not null default now()
);
create index idx_bonds_deal on bond_structures(deal_id);

-- Risk scores (Sentinel output)
create table if not exists risk_scores (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references deals(id) on delete cascade,
  overall_score integer, credit_risk integer, market_risk integer,
  construction_risk integer, legal_risk integer, operational_risk integer,
  environmental_risk integer, political_risk integer,
  grade text, alerts jsonb not null default '[]',
  created_at timestamptz not null default now()
);
create index idx_risk_deal on risk_scores(deal_id);

-- Modeling results (Prometheus output)
create table if not exists modeling_results (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references deals(id),
  model_type text not null,
  version integer not null default 1,
  inputs jsonb not null default '{}', outputs jsonb not null default '{}',
  irr numeric, npv numeric, dscr_min numeric, dscr_avg numeric,
  is_feasible boolean default false, run_by text,
  created_at timestamptz not null default now()
);
create index idx_modeling_deal on modeling_results(deal_id);

-- EagleEye signals
create table if not exists signals (
  id uuid primary key default gen_random_uuid(),
  scout_id uuid,
  signal_type text not null,
  source text not null,
  entity_name text, entity_type text,
  location_state text, location_city text, sector text, naics_code text,
  data jsonb not null default '{}',
  node_count integer not null default 0,
  score numeric,
  status text not null default 'raw' check (status in ('raw', 'scored', 'prospect', 'dismissed')),
  promoted_to_prospect_at timestamptz, dismissed_at timestamptz,
  created_at timestamptz not null default now()
);
create index idx_signals_status on signals(status);
create index idx_signals_score on signals(score desc);

-- EagleEye scouts
create table if not exists scouts (
  id uuid primary key default gen_random_uuid(),
  name text not null, description text,
  criteria jsonb not null default '{}',
  sources text[] not null default '{}',
  source_deal_id uuid references deals(id),
  is_active boolean not null default true,
  last_run_at timestamptz, total_signals_found integer not null default 0,
  created_at timestamptz not null default now()
);

-- Prospects
create table if not exists prospects (
  id uuid primary key default gen_random_uuid(),
  signal_id uuid references signals(id),
  entity_name text not null, sector text, location text,
  estimated_deal_size numeric,
  contact_name text, contact_email text, contact_phone text, contact_linkedin text,
  stage text not null default 'new' check (stage in (
    'new', 'marketing_engaged', 'responded', 'meeting_scheduled',
    'meeting_held', 'proposal_sent', 'engaged', 'client'
  )),
  marketing_sequence_started_at timestamptz,
  touch_count integer not null default 0, last_touch_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_prospects_stage on prospects(stage);

-- Documents (Roots)
create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references deals(id) on delete cascade,
  doc_type text not null, filename text not null,
  storage_path text, file_size integer,
  status text not null default 'uploaded' check (status in ('uploaded', 'processing', 'parsed', 'reviewed', 'error')),
  parsed_data jsonb,
  uploaded_by text,
  created_at timestamptz not null default now()
);
create index idx_docs_deal on documents(deal_id);

-- Deal correspondence
create table if not exists correspondence (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references deals(id) on delete cascade,
  direction text not null check (direction in ('inbound', 'outbound')),
  channel text not null default 'email' check (channel in ('email', 'phone', 'meeting', 'portal')),
  from_name text, from_email text, to_name text, to_email text,
  subject text, body text,
  ai_summary text, ai_action_items jsonb default '[]', ai_category text,
  is_read boolean default false, requires_action boolean default false,
  action_completed boolean default false,
  created_at timestamptz not null default now()
);
create index idx_correspondence_deal on correspondence(deal_id);

-- Sub-industry silos
create table if not exists industry_silos (
  id uuid primary key default gen_random_uuid(),
  naics_code text not null, naics_label text not null,
  deal_count integer not null default 0, signal_count integer not null default 0,
  is_active boolean not null default false,
  intelligence jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
