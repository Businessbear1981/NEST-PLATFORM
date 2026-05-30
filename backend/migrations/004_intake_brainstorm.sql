-- ============================================================
-- 004_intake_brainstorm.sql
-- Adds the Intake Brainstorm surface columns to the deals table.
--
-- Lifecycle (ADR-0002):
--   Deal Input (insert into deals) → Intake Brainstorm → Roots (Stage 1).
--
-- The Intake Brainstorm produces a one-page first-look memo plus a
-- targeted gap-filling Q&A. Both the founder's answers and the
-- brainstorm status live on the deal row so the rest of the platform
-- (Bernard, Roots, Maxwell, counterparty assignment) can read them.
--
-- Columns
--   intake_brainstorm_responses jsonb default '{}'  — founder's answers
--                                                     to the gap questions,
--                                                     keyed by question id.
--   intake_brainstorm_status    text default 'pending'
--                                                   — one of:
--                                                     pending  | brainstormed
--                                                     | greenlit | parked.
--   intake_brainstorm_memo      jsonb default '{}'  — cached memo from the
--                                                     last run() so the
--                                                     founder can re-open
--                                                     the page without
--                                                     re-paying for Claude.
--   intake_brainstorm_run_at    timestamptz         — last run timestamp.
-- ============================================================

alter table if exists deals
  add column if not exists intake_brainstorm_responses jsonb not null default '{}'::jsonb,
  add column if not exists intake_brainstorm_status     text  not null default 'pending',
  add column if not exists intake_brainstorm_memo       jsonb not null default '{}'::jsonb,
  add column if not exists intake_brainstorm_run_at     timestamptz;

-- Constrain status to the four lifecycle values.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'deals_intake_brainstorm_status_check'
  ) then
    alter table deals
      add constraint deals_intake_brainstorm_status_check
      check (intake_brainstorm_status in ('pending', 'brainstormed', 'greenlit', 'parked'));
  end if;
end$$;

-- Index for filtering pipeline cards by brainstorm state.
create index if not exists idx_deals_intake_brainstorm_status
  on deals (intake_brainstorm_status);
