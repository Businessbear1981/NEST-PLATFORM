-- 008_trustee_tasks.sql
-- Per-deal trustee task tracking (replaces in-memory TRUSTEE_TASKS in rating_esg.py)

create table if not exists trustee_tasks (
  id           uuid primary key default gen_random_uuid(),
  deal_id      uuid references deals(id) on delete cascade,
  task_key     text not null,
  task_label   text not null,
  phase        text not null check (phase in ('pre-issuance', 'post-issuance', 'ongoing')),
  status       text not null default 'pending' check (status in ('pending', 'in_progress', 'completed', 'blocked')),
  assignee     text,
  due_date     date,
  completed_at timestamptz,
  notes        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create trigger trustee_tasks_updated_at
  before update on trustee_tasks
  for each row execute function update_updated_at();

create index idx_trustee_tasks_deal_id on trustee_tasks(deal_id);
create index idx_trustee_tasks_phase   on trustee_tasks(phase);
create index idx_trustee_tasks_status  on trustee_tasks(status);
