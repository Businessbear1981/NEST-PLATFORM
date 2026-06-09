-- 007_investors_placement.sql

-- Investor universe — seeded from hawkeye_placement.py INVESTOR_DATABASE
create table if not exists investors (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  category text not null check (category in ('family_offices','pe_firms','muni_bond_buyers','bridge_lenders','other')),
  aum_usd bigint,
  min_check bigint,
  max_check bigint,
  sectors text[] not null default '{}',
  preferences text[] not null default '{}',
  geography text not null default 'national',
  contact_approach text not null default 'direct',
  rates text,
  note text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger investors_updated_at
  before update on investors
  for each row execute function update_updated_at();

create index idx_investors_category on investors(category);
create index idx_investors_active on investors(active);

-- Placement pipeline — replaces in-memory _pipeline dict
create table if not exists placement_pipeline (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid references deals(id),
  status text not null default 'not_started' check (status in ('not_started','marketing','due_diligence','indications','committed','closed','withdrawn')),
  deal_size numeric,
  channel text,
  investors_contacted jsonb not null default '[]',
  ndas_executed jsonb not null default '[]',
  iois_received jsonb not null default '[]',
  commitments jsonb not null default '[]',
  cim_distributed boolean not null default false,
  mgmt_presentations integer not null default 0,
  pricing_call_scheduled boolean not null default false,
  closing_scheduled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger placement_pipeline_updated_at
  before update on placement_pipeline
  for each row execute function update_updated_at();

create unique index idx_placement_deal on placement_pipeline(deal_id);
