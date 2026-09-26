-- ============================================================
-- FIX DEFINITIVO: RLS, PERFIL Y REGISTRO EN SUPABASE
-- Ejecuta este script en Supabase -> SQL Editor -> Run
-- ============================================================

-- 1. Eliminar la recursión infinita en public.instructors
-- (Esta era la causa de que los UPDATE y SELECT fallaran con error 42P17)
alter table if exists public.instructors disable row level security;
drop policy if exists "instructors: manage instructors" on public.instructors;
drop policy if exists "instructors: read authenticated" on public.instructors;

-- 2. Asegurar que la tabla public.instructors exista y tenga a laconeo@gmail.com
create table if not exists public.instructors (
  user_id  uuid primary key references auth.users(id) on delete cascade,
  added_at timestamptz not null default now()
);

insert into public.instructors (user_id)
select id from auth.users where lower(email) = 'laconeo@gmail.com'
on conflict do nothing;

-- 3. Crear función de registro / auto-reparación en auth.users
create or replace function public.handle_new_user()
returns trigger as $$
declare
  v_first_name text;
  v_last_name  text;
  v_ward       text;
  v_class      text;
  v_role       text;
begin
  v_first_name := coalesce(
    nullif(trim(new.raw_user_meta_data->>'first_name'), ''),
    nullif(trim(split_part(coalesce(new.raw_user_meta_data->>'name', new.email), ' ', 1)), ''),
    split_part(new.email, '@', 1)
  );

  v_last_name := coalesce(
    nullif(trim(new.raw_user_meta_data->>'last_name'), ''),
    'Seminario'
  );

  v_ward := coalesce(new.raw_user_meta_data->>'ward', '');
  v_class := coalesce(new.raw_user_meta_data->>'seminary_class', 'Seminario - Antiguo Testamento');

  v_role := case
    when lower(new.email) = 'laconeo@gmail.com' then 'instructor'
    when new.raw_user_meta_data->>'role' = 'instructor' then 'instructor'
    else 'alumno'
  end;

  -- Insertar o actualizar en public.students (incluyendo barrio y clase)
  insert into public.students (
    id, email, first_name, last_name, role, ward, seminary_class, avatar_seed
  ) values (
    new.id,
    lower(new.email),
    v_first_name,
    v_last_name,
    v_role,
    v_ward,
    v_class,
    v_first_name
  )
  on conflict (id) do update set
    email = excluded.email,
    first_name = coalesce(nullif(excluded.first_name, ''), public.students.first_name),
    last_name = coalesce(nullif(excluded.last_name, ''), public.students.last_name),
    ward = coalesce(nullif(excluded.ward, ''), public.students.ward),
    seminary_class = coalesce(nullif(excluded.seminary_class, ''), public.students.seminary_class),
    role = case when lower(new.email) = 'laconeo@gmail.com' then 'instructor' else excluded.role end;

  if v_role = 'instructor' then
    insert into public.instructors (user_id)
    values (new.id)
    on conflict do nothing;
  end if;

  return new;
exception
  when others then
    raise warning 'handle_new_user error: %', sqlerrm;
    return new;
end;
$$ language plpgsql security definer;

-- 4. Asegurar el trigger en auth.users
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 5. Habilitar políticas RLS limpias y sin recursión en public.students
alter table public.students enable row level security;

drop policy if exists "students: insert profile" on public.students;
create policy "students: insert profile"
  on public.students for insert
  to authenticated, anon
  with check (true);

drop policy if exists "students: own read" on public.students;
drop policy if exists "students: instructor read all" on public.students;
drop policy if exists "students: read" on public.students;

create policy "students: read"
  on public.students for select
  to authenticated, anon
  using (
    auth.uid() = id
    or exists (select 1 from public.instructors where instructors.user_id = auth.uid())
    or auth.jwt()->>'email' = 'laconeo@gmail.com'
  );

drop policy if exists "students: own update" on public.students;
drop policy if exists "students: instructor update" on public.students;
drop policy if exists "students: update" on public.students;

create policy "students: update"
  on public.students for update
  to authenticated, anon
  using (
    auth.uid() = id
    or exists (select 1 from public.instructors where instructors.user_id = auth.uid())
    or auth.jwt()->>'email' = 'laconeo@gmail.com'
  )
  with check (
    auth.uid() = id
    or exists (select 1 from public.instructors where instructors.user_id = auth.uid())
    or auth.jwt()->>'email' = 'laconeo@gmail.com'
  );

-- 6. Asegurar que laconeo@gmail.com tenga el rol de instructor si ya existe
update public.students
set role = 'instructor'
where lower(email) = 'laconeo@gmail.com';
