-- ============================================================
-- FIX: Recalculate streak for all real students
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. Recreate the function to ensure it's up to date in production
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
    highest_streak = greatest(coalesce(v_highest, 0), v_streak),
    updated_at     = now()
  where id = p_student_id;

  -- Recalculate badges (delete and re-insert)
  delete from public.student_unlocked_badges where student_id = p_student_id;

  -- Week 1: Abraham (days 1-7)
  if (select count(*) = 7
      from unnest(array[1,2,3,4,5,6,7]::smallint[]) d(n)
      where n = any(v_completed)) then
    insert into public.student_unlocked_badges (student_id, badge_id)
    values (p_student_id, 'badge-abraham') on conflict do nothing;
  end if;

  -- Week 2: Isaac (days 1-14)
  if (select count(*) = 14
      from unnest(array[1,2,3,4,5,6,7,8,9,10,11,12,13,14]::smallint[]) d(n)
      where n = any(v_completed)) then
    insert into public.student_unlocked_badges (student_id, badge_id)
    values (p_student_id, 'badge-isaac') on conflict do nothing;
  end if;

  -- Week 3: Jacob (days 1-21)
  if (select count(*) = 21
      from unnest((select array_agg(g)::smallint[] from generate_series(1,21) g)) d(n)
      where n = any(v_completed)) then
    insert into public.student_unlocked_badges (student_id, badge_id)
    values (p_student_id, 'badge-jacob') on conflict do nothing;
  end if;

  -- Final: Jesucristo (days 1-30 OR day 31)
  if (
    (select count(*) = 30
     from unnest((select array_agg(g)::smallint[] from generate_series(1,30) g)) d(n)
     where n = any(v_completed))
    or (31 = any(v_completed))
  ) then
    insert into public.student_unlocked_badges (student_id, badge_id)
    values (p_student_id, 'badge-jesucristo') on conflict do nothing;
  end if;
end;
$$;

-- 2. Recalculate stats for ALL real students (excluding demo accounts)
do $$
declare
  r record;
begin
  for r in
    select id from public.students
    where email not like '%@seminario.org'
      and id::text not like '11111111%'
  loop
    perform public.recalculate_student_stats(r.id);
  end loop;
end;
$$;

-- 3. Verify results
select
  s.email,
  s.first_name || ' ' || s.last_name as nombre,
  s.current_streak,
  s.highest_streak,
  s.last_completed_date,
  count(cd.day) as total_dias
from public.students s
left join public.student_completed_days cd on cd.student_id = s.id
where s.email not like '%@seminario.org'
  and s.id::text not like '11111111%'
group by s.id, s.email, s.first_name, s.last_name,
         s.current_streak, s.highest_streak, s.last_completed_date
order by s.created_at;

-- 4. CRITICAL: Grant execute permission so the frontend RPC call works
--    Without this, supabase.rpc('recalculate_student_stats') fails silently
GRANT EXECUTE ON FUNCTION public.recalculate_student_stats(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.recalculate_student_stats(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.recalculate_student_stats(uuid) TO service_role;
