create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create or replace function nest_set_updated_at_v3()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create table if not exists deals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  deal_type text not null default 'bond' check (deal_type in ('bond', 'sparrow')),
  status text not null default 'intake' check (status in (
    'intake','document_ingestion','sponsor_diligence','underwriting',
    'structuring','engagement','document_drafting','marketing',
    'working_group','approvals','rating_committee','pricing',
    'closing','post_close','surveillance'
  )),
  deal_size numeric,
  location_state text,
  location_city text,
  sector text,
  naics_code text,
  sponsor_name text,
  risk_grade text,
  project jsonb not null default '{}',
  sponsor jsonb not null default '{}',
  team jsonb not null default '{}',
  readiness_score integer not null default 0,
  readiness_checklist jsonb not null default '{}',
  financials jsonb not null default '{}',
  module_id integer not null default 0,
  source_channel text check (source_channel in ('direct','merlin_ma','eagleeye','referral','outbound')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists deals_updated_at on deals;
create trigger deals_updated_at before update on deals
  for each row execute function update_updated_at();
create index if not exists idx_deals_status on deals(status);
create index if not exists idx_deals_type on deals(deal_type);
create index if not exists idx_deals_sector on deals(sector);
create index if not exists idx_deals_sponsor on deals(sponsor_name);

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
create index if not exists idx_credit_deal on credit_analyses(deal_id);

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
create index if not exists idx_bonds_deal on bond_structures(deal_id);

create table if not exists risk_scores (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references deals(id) on delete cascade,
  overall_score integer, credit_risk integer, market_risk integer,
  construction_risk integer, legal_risk integer, operational_risk integer,
  environmental_risk integer, political_risk integer,
  grade text, alerts jsonb not null default '[]',
  created_at timestamptz not null default now()
);
create index if not exists idx_risk_deal on risk_scores(deal_id);

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
create index if not exists idx_modeling_deal on modeling_results(deal_id);

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
  status text not null default 'raw' check (status in ('raw','scored','prospect','dismissed')),
  promoted_to_prospect_at timestamptz, dismissed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_signals_status on signals(status);
create index if not exists idx_signals_score on signals(score desc);

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

create table if not exists prospects (
  id uuid primary key default gen_random_uuid(),
  signal_id uuid references signals(id),
  entity_name text not null, sector text, location text,
  estimated_deal_size numeric,
  contact_name text, contact_email text, contact_phone text, contact_linkedin text,
  stage text not null default 'new' check (stage in (
    'new','marketing_engaged','responded','meeting_scheduled',
    'meeting_held','proposal_sent','engaged','client'
  )),
  marketing_sequence_started_at timestamptz,
  touch_count integer not null default 0, last_touch_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_prospects_stage on prospects(stage);

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references deals(id) on delete cascade,
  doc_type text not null, filename text not null,
  storage_path text, file_size integer,
  status text not null default 'uploaded' check (status in ('uploaded','processing','parsed','reviewed','error')),
  parsed_data jsonb,
  uploaded_by text,
  created_at timestamptz not null default now()
);
create index if not exists idx_docs_deal on documents(deal_id);

create table if not exists correspondence (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references deals(id) on delete cascade,
  direction text not null check (direction in ('inbound','outbound')),
  channel text not null default 'email' check (channel in ('email','phone','meeting','portal')),
  from_name text, from_email text, to_name text, to_email text,
  subject text, body text,
  ai_summary text, ai_action_items jsonb default '[]', ai_category text,
  is_read boolean default false, requires_action boolean default false,
  action_completed boolean default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_correspondence_deal on correspondence(deal_id);

create table if not exists industry_silos (
  id uuid primary key default gen_random_uuid(),
  naics_code text not null, naics_label text not null,
  deal_count integer not null default 0, signal_count integer not null default 0,
  is_active boolean not null default false,
  intelligence jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists contacts (
  id                 uuid primary key default gen_random_uuid(),
  external_id        text unique,
  type               text not null check (type in ('person','firm')),
  name               text not null,
  doing_business_as  text,
  title              text,
  firm_id            uuid references contacts(id) on delete set null,
  firm_type          text,
  email              text,
  phone              text,
  linkedin           text,
  website            text,
  hq_address         text,
  secondary_offices  jsonb not null default '[]'::jsonb,
  finra_bd_number    text,
  msrb_ma_id         text,
  serves_as          text[] not null default '{}',
  osint_dossier_ref  text,
  background_notes   text,
  sector_fit_flag    text,
  tags               text[] not null default '{}',
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index if not exists idx_contacts_type      on contacts(type);
create index if not exists idx_contacts_email     on contacts(email);
create index if not exists idx_contacts_firm_id   on contacts(firm_id);
create index if not exists idx_contacts_serves_as on contacts using gin(serves_as);
create index if not exists idx_contacts_tags      on contacts using gin(tags);
drop trigger if exists contacts_updated_at on contacts;
create trigger contacts_updated_at before update on contacts
  for each row execute function nest_set_updated_at_v3();

create table if not exists counterparty_assignments (
  id                     uuid primary key default gen_random_uuid(),
  deal_id                uuid not null references deals(id) on delete cascade,
  role                   text not null,
  firm_contact_id        uuid references contacts(id) on delete set null,
  rep_contact_id         uuid references contacts(id) on delete set null,
  compliance_contact_id  uuid references contacts(id) on delete set null,
  status                 text not null default 'candidate' check (status in (
    'candidate','pending_response','active','declined','terminated','completed'
  )),
  engagement_basis       text,
  fee_amount_usd         numeric,
  fee_basis              text check (
    fee_basis in ('flat','tiered_flat','bps','pct_of_par','hourly','annual') or fee_basis is null
  ),
  fee_milestones         jsonb not null default '[]'::jsonb,
  engagement_letter_url  text,
  notes                  jsonb not null default '{}'::jsonb,
  sector_fit_flag        text,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);
create index if not exists idx_cpa_deal_id on counterparty_assignments(deal_id);
create index if not exists idx_cpa_role    on counterparty_assignments(role);
create index if not exists idx_cpa_status  on counterparty_assignments(status);
create index if not exists idx_cpa_firm    on counterparty_assignments(firm_contact_id);
drop trigger if exists counterparty_assignments_updated_at on counterparty_assignments;
create trigger counterparty_assignments_updated_at before update on counterparty_assignments
  for each row execute function nest_set_updated_at_v3();

create table if not exists outreach_events (
  id                              uuid primary key default gen_random_uuid(),
  kind                            text not null,
  scheduled_at                    timestamptz,
  sent_at                         timestamptz,
  channel                         text check (channel in ('email','call','meeting','linkedin','event')),
  to_contact_id                   uuid references contacts(id) on delete set null,
  from_contact_name               text,
  subject_line                    text,
  framing_notes                   text,
  attachments                     jsonb not null default '[]'::jsonb,
  deal_ids                        uuid[] not null default '{}',
  expected_response_window_days   integer,
  response_received_at            timestamptz,
  outcome                         text,
  notes                           text,
  created_at                      timestamptz not null default now()
);
create index if not exists idx_outreach_to_contact on outreach_events(to_contact_id);
create index if not exists idx_outreach_sent_at    on outreach_events(sent_at desc);
create index if not exists idx_outreach_kind       on outreach_events(kind);
create index if not exists idx_outreach_deal_ids   on outreach_events using gin(deal_ids);

alter table deals
  add column if not exists intake_brainstorm_responses jsonb not null default '{}'::jsonb,
  add column if not exists intake_brainstorm_status    text  not null default 'pending',
  add column if not exists intake_brainstorm_memo      jsonb not null default '{}'::jsonb,
  add column if not exists intake_brainstorm_run_at    timestamptz;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'deals_intake_brainstorm_status_check') then
    alter table deals
      add constraint deals_intake_brainstorm_status_check
      check (intake_brainstorm_status in ('pending','brainstormed','greenlit','parked'));
  end if;
end$$;
create index if not exists idx_deals_intake_brainstorm_status on deals (intake_brainstorm_status);

create table if not exists study_progress (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null,
  exam                 text not null check (exam in ('series_50','series_54','series_7','series_24_63')),
  section_id           text not null,
  status               text not null default 'not_started' check (status in ('not_started','in_progress','completed')),
  completed_at         timestamptz,
  score                numeric,
  time_spent_minutes   integer not null default 0,
  notes                text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
create unique index if not exists idx_study_progress_user_exam_section on study_progress (user_id, exam, section_id);
create index if not exists idx_study_progress_user_exam on study_progress (user_id, exam);
drop trigger if exists study_progress_updated_at on study_progress;
create trigger study_progress_updated_at before update on study_progress
  for each row execute function nest_set_updated_at_v3();

alter table study_progress enable row level security;
drop policy if exists study_progress_self_select on study_progress;
create policy study_progress_self_select on study_progress for select using (user_id = auth.uid());
drop policy if exists study_progress_self_insert on study_progress;
create policy study_progress_self_insert on study_progress for insert with check (user_id = auth.uid());
drop policy if exists study_progress_self_update on study_progress;
create policy study_progress_self_update on study_progress for update using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists study_progress_self_delete on study_progress;
create policy study_progress_self_delete on study_progress for delete using (user_id = auth.uid());
drop policy if exists study_progress_service_all on study_progress;
create policy study_progress_service_all on study_progress for all to service_role using (true) with check (true);
