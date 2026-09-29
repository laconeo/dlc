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
