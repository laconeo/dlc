-- ============================================================
-- FIX: REPARACIÓN DE REGISTRO DE USUARIOS EN SUPABASE AUTH
-- Ejecuta este script en Supabase -> SQL Editor -> Run
-- ============================================================

-- 1. Crear función que maneje nuevos usuarios de auth.users con valores por defecto a prueba de fallos
create or replace function public.handle_new_user()
returns trigger as $$
declare
  v_first_name text;
  v_last_name  text;
  v_ward       text;
  v_class      text;
  v_role       text;
begin
  -- Extraer metadatos con fallbacks para que NUNCA falle por NULL
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

  -- Insertar o actualizar en public.students
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
    role = case when lower(new.email) = 'laconeo@gmail.com' then 'instructor' else excluded.role end;

  -- Si es instructor (o superadmin), asegurar en public.instructors
  if v_role = 'instructor' then
    insert into public.instructors (user_id)
    values (new.id)
    on conflict do nothing;
  end if;

  return new;
exception
  when others then
    -- Registrar advertencia en logs pero NUNCA tumbar la creación del usuario en auth.users
    raise warning 'handle_new_user error: %', sqlerrm;
    return new;
end;
$$ language plpgsql security definer;

-- 2. Asegurar el trigger en auth.users
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3. Habilitar políticas RLS para INSERT y UPDATE en public.students
drop policy if exists "students: insert profile" on public.students;
create policy "students: insert profile"
  on public.students for insert
  to authenticated, anon
  with check (true);

drop policy if exists "students: own read" on public.students;
create policy "students: own read"
  on public.students for select
  using (auth.uid() = id or exists (select 1 from public.instructors where user_id = auth.uid()));

drop policy if exists "students: own update" on public.students;
create policy "students: own update"
  on public.students for update
  using (auth.uid() = id or exists (select 1 from public.instructors where user_id = auth.uid()));

-- 4. Asegurar que laconeo@gmail.com tenga el rol de instructor si ya existe
update public.students
set role = 'instructor'
where lower(email) = 'laconeo@gmail.com';
