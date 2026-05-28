create table if not exists deals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  deal_type text not null default 'bond' check (deal_type in ('bond', 'sparrow')),
  status text not null default 'intake' check (status in (
    'intake', 'document_ingestion', 'sponsor_diligence', 'underwriting',
    'structuring', 'engagement', 'document_drafting', 'marketing',
    'working_group', 'approvals', 'rating_committee', 'pricing',
    'closing', 'post_close', 'surveillance'
  )),
  -- Header fields (shown on pipeline cards regardless of deal type)
  deal_size numeric,
  location_state text,
  location_city text,
  sector text,
  naics_code text,
  sponsor_name text,
  risk_grade text,
  -- Project details (JSONB for flexibility per deal type)
  project jsonb not null default '{}',
  sponsor jsonb not null default '{}',
  team jsonb not null default '{}',
  -- Readiness tracking
  readiness_score integer not null default 0,
  readiness_checklist jsonb not null default '{}',
  -- Financials (populated by credit engine)
  financials jsonb not null default '{}',
  -- Module ID for cross-cutting dispatch
  module_id integer not null default 0,
  -- Metadata
  source_channel text check (source_channel in ('direct', 'merlin_ma', 'eagleeye', 'referral', 'outbound')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger deals_updated_at
  before update on deals
  for each row execute function update_updated_at();

-- Indexes
create index idx_deals_status on deals(status);
create index idx_deals_type on deals(deal_type);
create index idx_deals_sector on deals(sector);
create index idx_deals_sponsor on deals(sponsor_name);
