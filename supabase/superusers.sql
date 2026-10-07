-- ============================================================
-- DLC – TABLA DE SUPERUSUARIOS (SUPERUSERS)
-- Permite que los Superadministradores promuevan a Maestros
-- para que tengan acceso total a todos los barrios y funciones.
-- Ejecutar en Supabase: Dashboard → SQL Editor → New query
-- ============================================================

-- 1. Crear tabla de superusuarios si no existe
create table if not exists public.superusers (
  user_id    uuid primary key references public.students(id) on delete cascade,
  email      text not null unique,
  created_at timestamptz not null default now()
);

comment on table public.superusers is
  'Lista de usuarios con permisos de Superuser (pueden ver todos los barrios y nombrar otros superusuarios).';

-- 2. Asegurar que el superadministrador principal esté registrado
insert into public.superusers (user_id, email)
select id, email from public.students
where lower(email) = 'laconeo@gmail.com'
on conflict (user_id) do nothing;

-- 3. Habilitar RLS
alter table public.superusers enable row level security;

-- Permitir a usuarios autenticados leer la lista de superusuarios
create policy "superusers: select authenticated"
  on public.superusers for select
  to authenticated
  using (true);

-- Permitir insertar o borrar superusuarios a usuarios autenticados
create policy "superusers: manage authenticated"
  on public.superusers for all
  to authenticated
  using (true)
  with check (true);

-- 4. Actualizar la vista students_full para incluir la columna is_superuser
drop view if exists public.students_full cascade;

create view public.students_full as
select
  s.id,
  s.email,
  s.first_name,
  s.last_name,
  s.name,
  s.role,
  coalesce(su.user_id is not null or lower(s.email) = 'laconeo@gmail.com', false) as is_superuser,
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
left join public.superusers su              on su.user_id = s.id
left join public.student_completed_days cd  on cd.student_id = s.id
left join public.student_notes sn           on sn.student_id = s.id
left join public.student_unlocked_badges ub on ub.student_id = s.id
group by s.id, su.user_id;

comment on view public.students_full is
  'Vista consolidada de perfil de estudiantes, incluyendo días leídos, insignias, notas y rol de superusuario.';

