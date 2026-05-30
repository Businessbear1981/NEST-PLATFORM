-- ============================================================
-- 005_study_progress.sql
-- Series 50 / 54 / 7 / 24/63 study progress per ADR-0001.
--
-- Sean studies while running deals. Per ADR-0001 the Series
-- 50/54 (Track 2, MSRB Municipal Advisor) and Series 7/24/63
-- (Track 1, Britehorn-sponsored registered rep) study modules
-- are both v1 platform surfaces.
-- ============================================================

-- ─── helper: updated_at trigger (reused) ───
create or replace function nest_set_updated_at_v3()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ============================================================
-- study_progress — per-user, per-exam, per-section progress
-- ============================================================
create table if not exists study_progress (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null,
  exam                 text not null
                       check (exam in (
                         'series_50','series_54','series_7','series_24_63'
                       )),
  section_id           text not null,
  status               text not null default 'not_started'
                       check (status in (
                         'not_started','in_progress','completed'
                       )),
  completed_at         timestamptz,
  score                numeric,
  time_spent_minutes   integer not null default 0,
  notes                text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create unique index if not exists idx_study_progress_user_exam_section
  on study_progress (user_id, exam, section_id);

create index if not exists idx_study_progress_user_exam
  on study_progress (user_id, exam);

drop trigger if exists study_progress_updated_at on study_progress;
create trigger study_progress_updated_at
  before update on study_progress
  for each row execute function nest_set_updated_at_v3();

-- ============================================================
-- Row-level security — a user sees only their own progress
-- ============================================================
alter table study_progress enable row level security;

drop policy if exists study_progress_self_select on study_progress;
create policy study_progress_self_select
  on study_progress
  for select
  using (user_id = auth.uid());

drop policy if exists study_progress_self_insert on study_progress;
create policy study_progress_self_insert
  on study_progress
  for insert
  with check (user_id = auth.uid());

drop policy if exists study_progress_self_update on study_progress;
create policy study_progress_self_update
  on study_progress
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists study_progress_self_delete on study_progress;
create policy study_progress_self_delete
  on study_progress
  for delete
  using (user_id = auth.uid());

-- Service role bypass policy (NEST backend uses the service key)
drop policy if exists study_progress_service_all on study_progress;
create policy study_progress_service_all
  on study_progress
  for all
  to service_role
  using (true)
  with check (true);
