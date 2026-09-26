-- ============================================================
-- MIGRACIÓN: ROLES (ALUMNO / INSTRUCTOR / SUPERADMIN)
-- Ejecuta este script en Supabase -> SQL Editor -> Run
-- ============================================================

-- 1. Agregar columna 'role' a la tabla students si no existe
alter table public.students
  add column if not exists role text not null default 'alumno'
  check (role in ('alumno', 'instructor'));

comment on column public.students.role is
  'Rol del usuario: alumno (default) o instructor.';

-- 2. Asegurar que el usuario laconeo@gmail.com tenga rol instructor
update public.students
set role = 'instructor'
where lower(email) = 'laconeo@gmail.com';

-- 3. Asegurar que la tabla public.instructors exista y tenga a laconeo@gmail.com
create table if not exists public.instructors (
  user_id  uuid primary key references auth.users(id) on delete cascade,
  added_at timestamptz not null default now()
);

-- Si el usuario ya existe en auth.users, agregarlo a la tabla instructors
insert into public.instructors (user_id)
select id from auth.users where lower(email) = 'laconeo@gmail.com'
on conflict do nothing;

-- 4. Actualizar la vista students_full para incluir la columna role
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

-- 5. Políticas RLS para permitir a los instructores actualizar roles
drop policy if exists "students: instructor update" on public.students;
create policy "students: instructor update"
  on public.students for update
  using (
    exists (
      select 1 from public.instructors
      where instructors.user_id = auth.uid()
    )
  );

-- Habilitar RLS en public.instructors y permitir a instructores gestionarlo
alter table public.instructors enable row level security;

drop policy if exists "instructors: read authenticated" on public.instructors;
create policy "instructors: read authenticated"
  on public.instructors for select
  to authenticated
  using (true);

drop policy if exists "instructors: manage instructors" on public.instructors;
create policy "instructors: manage instructors"
  on public.instructors for all
  to authenticated
  using (
    exists (
      select 1 from public.instructors
      where instructors.user_id = auth.uid()
    )
  );
