-- 006_phoenix_treasury.sql

-- Phoenix distressed CRE deals (separate from main deals — different LOB, different fields)
create table if not exists phoenix_deals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  asset_type text not null check (asset_type in ('Office','Industrial','Retail','Mixed-Use','Multifamily','Hotel','Land')),
  track text not null default 'rent_shortfall' check (track in ('rent_shortfall','environmental','both')),
  stage text not null default 'sourced' check (stage in ('sourced','underwriting','loi','due_diligence','bond_structuring','closed')),
  market_value numeric,
  purchase_price numeric,
  current_noi numeric default 0,
  target_noi numeric default 0,
  current_occupancy integer default 0,
  target_occupancy integer default 0,
  current_dscr numeric default 0,
  stabilized_dscr numeric default 0,
  no_pi_months integer default 0,
  remediation_cost numeric,
  phase_status text,
  contamination text,
  source text,
  source_contact text,
  msa text,
  notes text,
  financials jsonb not null default '{}',
  milestones jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger phoenix_updated_at
  before update on phoenix_deals
  for each row execute function update_updated_at();

create index idx_phoenix_stage on phoenix_deals(stage);
create index idx_phoenix_track on phoenix_deals(track);
create index idx_phoenix_asset_type on phoenix_deals(asset_type);

-- Treasury spend records (Ramp virtual card transactions)
create table if not exists treasury_transactions (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid references deals(id),
  phoenix_deal_id uuid references phoenix_deals(id),
  vendor_name text not null,
  category text not null,
  mcc text,
  amount numeric not null,
  currency text not null default 'USD',
  transaction_date date not null,
  card_id text,
  merchant_city text,
  merchant_state text,
  status text not null default 'settled' check (status in ('pending','settled','declined','reversed')),
  covenant_compliant boolean default true,
  notes text,
  created_at timestamptz not null default now()
);

create index idx_treasury_deal on treasury_transactions(deal_id);
create index idx_treasury_phoenix on treasury_transactions(phoenix_deal_id);
create index idx_treasury_date on treasury_transactions(transaction_date);

-- Treasury budgets per deal
create table if not exists treasury_budgets (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid references deals(id),
  phoenix_deal_id uuid references phoenix_deals(id),
  category text not null,
  budgeted_amount numeric not null,
  spent_amount numeric not null default 0,
  card_id text,
  mcc_restrictions text[],
  active boolean not null default true,
  created_at timestamptz not null default now()
);
