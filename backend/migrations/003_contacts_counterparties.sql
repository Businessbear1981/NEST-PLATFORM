-- ============================================================
-- 003_contacts_counterparties.sql
-- Universal address book (contacts) + per-Deal role assignments
-- (counterparty_assignments) + outreach event log.
--
-- Resolves CONTEXT.md "Contact" / "Counterparty" sections
-- (2026-05-28) and supports the Brett-launch seed file at
-- docs/seeds/2026-05-29-brett-launch.json.
-- ============================================================

-- ─── helper: updated_at trigger (reused if not already defined) ───
create or replace function nest_set_updated_at_v3()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ============================================================
-- 1. contacts — universal address book (person OR firm)
-- ============================================================
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
create trigger contacts_updated_at
  before update on contacts
  for each row execute function nest_set_updated_at_v3();

-- ============================================================
-- 2. counterparty_assignments — role on a specific Deal
-- ============================================================
create table if not exists counterparty_assignments (
  id                     uuid primary key default gen_random_uuid(),
  deal_id                uuid not null references deals(id) on delete cascade,
  role                   text not null,
  firm_contact_id        uuid references contacts(id) on delete set null,
  rep_contact_id         uuid references contacts(id) on delete set null,
  compliance_contact_id  uuid references contacts(id) on delete set null,
  status                 text not null default 'candidate'
                         check (status in (
                           'candidate','pending_response','active',
                           'declined','terminated','completed'
                         )),
  engagement_basis       text,
  fee_amount_usd         numeric,
  fee_basis              text check (
                           fee_basis in (
                             'flat','tiered_flat','bps','pct_of_par',
                             'hourly','annual'
                           ) or fee_basis is null
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
create trigger counterparty_assignments_updated_at
  before update on counterparty_assignments
  for each row execute function nest_set_updated_at_v3();

-- ============================================================
-- 3. outreach_events — log of touches against contacts / deals
-- ============================================================
create table if not exists outreach_events (
  id                              uuid primary key default gen_random_uuid(),
  kind                            text not null,
  scheduled_at                    timestamptz,
  sent_at                         timestamptz,
  channel                         text check (
                                    channel in (
                                      'email','call','meeting','linkedin','event'
                                    )
                                  ),
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
