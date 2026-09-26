-- ============================================================
-- DLC – Detente, Lee, Conecta
-- Supabase / PostgreSQL Schema
-- ============================================================

-- ──────────────────────────────────────────────────────────
-- 0. EXTENSIONS
-- ──────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ──────────────────────────────────────────────────────────
-- 1. STUDENTS
--    Core table – one row per registered user.
--    We intentionally do NOT store plain-text passwords here;
--    authentication is handled by Supabase Auth (auth.users).
--    The `id` column is a UUID that MATCHES auth.users.id so
--    you can join them easily.
-- ──────────────────────────────────────────────────────────
create table if not exists public.students (
  id               uuid        primary key default uuid_generate_v4(),
  email            text        not null unique,
  first_name       text        not null,
  last_name        text        not null,
  -- full name kept as a generated column for convenience
  name             text        generated always as (first_name || ' ' || last_name) stored,
  role             text        not null default 'alumno' check (role in ('alumno', 'instructor')),
  ward             text        not null default '',
  seminary_class   text        not null default 'Seminario - Antiguo Testamento',
  avatar_seed      text,
  current_streak   int         not null default 0,
  highest_streak   int         not null default 0,
  last_completed_date date,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

comment on table public.students is
  'One row per Seminary student registered in the DLC challenge.';

comment on column public.students.id is
  'Must match auth.users.id when using Supabase Auth.';

-- ──────────────────────────────────────────────────────────
-- 2. STUDENT_COMPLETED_DAYS
--    Normalized replacement for the completedDays: number[]
--    field.  One row per (student, day) pair.
-- ──────────────────────────────────────────────────────────
create table if not exists public.student_completed_days (
  id          bigserial   primary key,
  student_id  uuid        not null references public.students(id) on delete cascade,
  day         smallint    not null check (day between 1 and 31),
  completed_at timestamptz not null default now(),
  unique (student_id, day)
);

comment on table public.student_completed_days is
  'Tracks which days (1-31) each student has marked as read.';

-- ──────────────────────────────────────────────────────────
-- 3. STUDENT_NOTES
--    Normalized replacement for notes: Record<number, string>
--    One row per (student, day) reflection.
-- ──────────────────────────────────────────────────────────
create table if not exists public.student_notes (
  id          bigserial   primary key,
  student_id  uuid        not null references public.students(id) on delete cascade,
  day         smallint    not null check (day between 1 and 31),
  note        text        not null default '',
  updated_at  timestamptz not null default now(),
  unique (student_id, day)
);

comment on table public.student_notes is
  'Personal daily reflections written by each student.';

-- ──────────────────────────────────────────────────────────
-- 4. STUDENT_UNLOCKED_BADGES
--    Normalized replacement for unlockedBadgeIds: string[]
--    One row per (student, badge) when the badge is earned.
-- ──────────────────────────────────────────────────────────
create table if not exists public.student_unlocked_badges (
  id          bigserial   primary key,
  student_id  uuid        not null references public.students(id) on delete cascade,
  badge_id    text        not null,   -- e.g. 'badge-abraham', 'badge-isaac'
  unlocked_at timestamptz not null default now(),
  unique (student_id, badge_id)
);

comment on table public.student_unlocked_badges is
  'Badges (streak milestone cards) earned by each student.';

-- ──────────────────────────────────────────────────────────
-- 5. AUTO-UPDATE updated_at TRIGGER
-- ──────────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_students_updated_at
  before update on public.students
  for each row execute function public.set_updated_at();

create trigger trg_student_notes_updated_at
  before update on public.student_notes
  for each row execute function public.set_updated_at();

-- ──────────────────────────────────────────────────────────
-- 6. INDEXES
-- ──────────────────────────────────────────────────────────
create index if not exists idx_completed_days_student on public.student_completed_days(student_id);
create index if not exists idx_notes_student          on public.student_notes(student_id);
create index if not exists idx_badges_student         on public.student_unlocked_badges(student_id);
create index if not exists idx_students_email         on public.students(email);

-- ──────────────────────────────────────────────────────────
-- 7. ROW LEVEL SECURITY (RLS)
-- ──────────────────────────────────────────────────────────

-- 7a. students
alter table public.students enable row level security;

-- A student can read their own row
create policy "students: own read"
  on public.students for select
  using (auth.uid() = id);

-- A student can update their own row (streak, ward, etc.)
create policy "students: own update"
  on public.students for update
  using (auth.uid() = id);

-- 7b. student_completed_days
alter table public.student_completed_days enable row level security;

create policy "completed_days: own read"
  on public.student_completed_days for select
  using (auth.uid() = student_id);

create policy "completed_days: own insert"
  on public.student_completed_days for insert
  with check (auth.uid() = student_id);

create policy "completed_days: own delete"
  on public.student_completed_days for delete
  using (auth.uid() = student_id);

-- 7c. student_notes
alter table public.student_notes enable row level security;

create policy "notes: own read"
  on public.student_notes for select
  using (auth.uid() = student_id);

create policy "notes: own upsert"
  on public.student_notes for insert
  with check (auth.uid() = student_id);

create policy "notes: own update"
  on public.student_notes for update
  using (auth.uid() = student_id);

-- 7d. student_unlocked_badges
alter table public.student_unlocked_badges enable row level security;

create policy "badges: own read"
  on public.student_unlocked_badges for select
  using (auth.uid() = student_id);

create policy "badges: own insert"
  on public.student_unlocked_badges for insert
  with check (auth.uid() = student_id);

create policy "badges: own delete"
  on public.student_unlocked_badges for delete
  using (auth.uid() = student_id);

-- ──────────────────────────────────────────────────────────
-- 8. INSTRUCTOR READ-ALL POLICIES
--    Add your instructor emails/UUIDs to the auth.users table
--    and create a simple lookup table to gate access.
-- ──────────────────────────────────────────────────────────

create table if not exists public.instructors (
  user_id  uuid primary key references auth.users(id) on delete cascade,
  added_at timestamptz not null default now()
);

comment on table public.instructors is
  'Whitelist of users allowed to read all student data (Seminary teachers).';

-- Instructors can read ALL students
create policy "students: instructor read all"
  on public.students for select
  using (
    exists (
      select 1 from public.instructors
      where instructors.user_id = auth.uid()
    )
  );

-- Instructors can update student profiles / roles
create policy "students: instructor update"
  on public.students for update
  using (
    exists (
      select 1 from public.instructors
      where instructors.user_id = auth.uid()
    )
  );

create policy "completed_days: instructor read all"
  on public.student_completed_days for select
  using (
    exists (
      select 1 from public.instructors
      where instructors.user_id = auth.uid()
    )
  );

create policy "notes: instructor read all"
  on public.student_notes for select
  using (
    exists (
      select 1 from public.instructors
      where instructors.user_id = auth.uid()
    )
  );

create policy "badges: instructor read all"
  on public.student_unlocked_badges for select
  using (
    exists (
      select 1 from public.instructors
      where instructors.user_id = auth.uid()
    )
  );

-- Instructors table RLS
alter table public.instructors enable row level security;

create policy "instructors: read authenticated"
  on public.instructors for select
  to authenticated
  using (true);

create policy "instructors: manage instructors"
  on public.instructors for all
  to authenticated
  using (
    exists (
      select 1 from public.instructors
      where instructors.user_id = auth.uid()
    )
  );

-- ──────────────────────────────────────────────────────────
-- 9. INSTRUCTOR STATS VIEW
--    Mirrors the InstructorStats interface from types.ts
-- ──────────────────────────────────────────────────────────
create or replace view public.instructor_stats as
select
  count(distinct s.id)                                              as total_students,
  count(distinct cd.student_id) filter (where cd.day is not null)  as active_any_day,
  round(avg(s.current_streak)::numeric, 1)                         as average_streak,
  count(distinct s.id) filter (
    where (
      select count(*) from public.student_completed_days
      where student_id = s.id
    ) >= 30
  )                                                                 as completed_30_days_count,
  (select count(*) from public.student_completed_days)             as total_days_read
from public.students s
left join public.student_completed_days cd on cd.student_id = s.id;

comment on view public.instructor_stats is
  'Aggregated stats for the Seminary instructor dashboard.';

-- ──────────────────────────────────────────────────────────
-- 10. FULL STUDENT VIEW (convenience for the API)
--     Returns one row per student with arrays aggregated back
--     so your TypeScript API can map it directly to Student.
-- ──────────────────────────────────────────────────────────
create or replace view public.students_full as
select
  s.id,
  s.email,
  s.first_name,
  s.last_name,
  s.name,
  s.role,
  s.ward,
  s.seminary_class,
  s.avatar_seed,
  s.current_streak,
  s.highest_streak,
  s.last_completed_date,
  s.created_at,
  s.updated_at,
  coalesce(
    array_agg(distinct cd.day order by cd.day) filter (where cd.day is not null),
    '{}'
  )::smallint[]                                    as completed_days,
  coalesce(
    jsonb_object_agg(sn.day::text, sn.note) filter (where sn.day is not null),
    '{}'::jsonb
  )                                                as notes,
  coalesce(
    array_agg(distinct ub.badge_id) filter (where ub.badge_id is not null),
    '{}'
  )::text[]                                        as unlocked_badge_ids
from public.students s
left join public.student_completed_days cd  on cd.student_id = s.id
left join public.student_notes sn           on sn.student_id = s.id
left join public.student_unlocked_badges ub on ub.student_id = s.id
group by s.id;

comment on view public.students_full is
  'Denormalized view that re-assembles arrays for direct mapping to the TypeScript Student interface.';

-- ──────────────────────────────────────────────────────────
-- 11. RECALCULATE STATS FUNCTION
--     Call this from your Edge Function / API after toggling
--     a day.  Mirrors recalculateStudentStats() in api-router.ts
-- ──────────────────────────────────────────────────────────
create or replace function public.recalculate_student_stats(p_student_id uuid)
returns void language plpgsql security definer as $$
declare
  v_completed  smallint[];
  v_streak     int := 0;
  v_day        int;
  v_highest    int;
begin
  -- Sorted completed days
  select array_agg(day order by day)
  into   v_completed
  from   public.student_completed_days
  where  student_id = p_student_id;

  v_completed := coalesce(v_completed, '{}');

  -- Consecutive streak from day 1
  for v_day in 1..31 loop
    if v_day = any(v_completed) then
      v_streak := v_streak + 1;
    else
      exit;
    end if;
  end loop;

  -- Preserve highest streak
  select highest_streak into v_highest
  from   public.students
  where  id = p_student_id;

  update public.students set
    current_streak = v_streak,
    highest_streak = greatest(v_highest, v_streak),
    updated_at     = now()
  where id = p_student_id;

  -- Recalculate badges (delete and re-insert)
  delete from public.student_unlocked_badges where student_id = p_student_id;

  -- Week 1: Abraham (days 1-7)
  if (select bool_and(d = any(v_completed))
      from unnest(array[1,2,3,4,5,6,7]::smallint[]) d) then
    insert into public.student_unlocked_badges (student_id, badge_id)
    values (p_student_id, 'badge-abraham') on conflict do nothing;
  end if;

  -- Week 2: Isaac (days 1-14)
  if (select bool_and(d = any(v_completed))
      from unnest(array[1,2,3,4,5,6,7,8,9,10,11,12,13,14]::smallint[]) d) then
    insert into public.student_unlocked_badges (student_id, badge_id)
    values (p_student_id, 'badge-isaac') on conflict do nothing;
  end if;

  -- Week 3: Jacob (days 1-21)
  if (select bool_and(d = any(v_completed))
      from unnest((select array_agg(g)::smallint[] from generate_series(1,21) g)) d) then
    insert into public.student_unlocked_badges (student_id, badge_id)
    values (p_student_id, 'badge-jacob') on conflict do nothing;
  end if;

  -- Final: Jesucristo (days 1-30 complete OR day 31)
  if (
    (select bool_and(d = any(v_completed))
     from unnest((select array_agg(g)::smallint[] from generate_series(1,30) g)) d)
    or (31 = any(v_completed))
  ) then
    insert into public.student_unlocked_badges (student_id, badge_id)
    values (p_student_id, 'badge-jesucristo') on conflict do nothing;
  end if;
end;
$$;

comment on function public.recalculate_student_stats is
  'Recalculates streak + badges for a student after toggling a day. Call from your API.';

-- ──────────────────────────────────────────────────────────
-- 12. SEED DATA
--     Demo students for development/staging.
--     Uses fixed UUIDs so the day/badge rows link correctly.
--     WARNING: do NOT run in production.
-- ──────────────────────────────────────────────────────────
insert into public.students
  (id, email, first_name, last_name, ward, seminary_class, avatar_seed,
   current_streak, highest_streak, last_completed_date, created_at, updated_at)
values
  ('11111111-0000-0000-0000-000000000001','lucas.romero@seminario.org',    'Lucas',    'Romero',  '','Clase Matutina - Barrio Central', 'Lucas',    14,14,'2026-10-11','2026-09-28 07:15:00+00','2026-10-11 20:30:00+00'),
  ('11111111-0000-0000-0000-000000000002','valentina.silva@seminario.org', 'Valentina','Silva',   '','Clase Vespertina - Estaca Sur',   'Valentina',21,21,'2026-10-18','2026-09-28 08:00:00+00','2026-10-18 19:45:00+00'),
  ('11111111-0000-0000-0000-000000000003','mateo.gomez@seminario.org',     'Mateo',    'Gómez',   '','Clase Matutina - Barrio Central', 'Mateo',     7, 7,'2026-10-04','2026-09-28 09:20:00+00','2026-10-04 18:10:00+00'),
  ('11111111-0000-0000-0000-000000000004','sofia.morales@seminario.org',   'Sofía',    'Morales', '','Clase Temprana - Barrio Norte',   'Sofia',     5, 5,'2026-10-02','2026-09-28 10:00:00+00','2026-10-02 21:00:00+00'),
  ('11111111-0000-0000-0000-000000000005','benjamin.castro@seminario.org', 'Benjamín', 'Castro',  '','Clase Vespertina - Estaca Sur',   'Benjamin',  3, 3,'2026-09-30','2026-09-28 11:00:00+00','2026-09-30 17:30:00+00')
on conflict (id) do nothing;

-- Completed days
insert into public.student_completed_days (student_id, day)
select '11111111-0000-0000-0000-000000000001', generate_series(1,14) on conflict do nothing;

insert into public.student_completed_days (student_id, day)
select '11111111-0000-0000-0000-000000000002', generate_series(1,21) on conflict do nothing;

insert into public.student_completed_days (student_id, day)
select '11111111-0000-0000-0000-000000000003', generate_series(1,7)  on conflict do nothing;

insert into public.student_completed_days (student_id, day)
select '11111111-0000-0000-0000-000000000004', generate_series(1,5)  on conflict do nothing;

insert into public.student_completed_days (student_id, day)
select '11111111-0000-0000-0000-000000000005', generate_series(1,3)  on conflict do nothing;

-- Notes
insert into public.student_notes (student_id, day, note) values
  ('11111111-0000-0000-0000-000000000001', 1,  'Sentí mucho valor al leer Josué 1.'),
  ('11111111-0000-0000-0000-000000000001', 7,  'Hermosa experiencia con la oración de Ana.'),
  ('11111111-0000-0000-0000-000000000002', 18, 'Ester me inspiró a ser más valiente en el colegio.')
on conflict do nothing;

-- Badges
insert into public.student_unlocked_badges (student_id, badge_id) values
  ('11111111-0000-0000-0000-000000000001', 'badge-abraham'),
  ('11111111-0000-0000-0000-000000000001', 'badge-isaac'),
  ('11111111-0000-0000-0000-000000000002', 'badge-abraham'),
  ('11111111-0000-0000-0000-000000000002', 'badge-isaac'),
  ('11111111-0000-0000-0000-000000000002', 'badge-jacob'),
  ('11111111-0000-0000-0000-000000000003', 'badge-abraham')
on conflict do nothing;
