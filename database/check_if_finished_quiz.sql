create or replace function check_if_finished_quiz() returns trigger
security definer -- only admin can add flags
set search_path = 'public'
language plpgsql
as $$
begin
perform pg_advisory_xact_lock(hashtext(NEW.user_id::text));

if auth.uid() is not null and auth.uid() <> NEW.user_id then
  raise exception 'Somebody else inserts sb elses answers';
end if;
-- authenticated

if (select count(*) from public.user_answers where user_id=auth.uid()) = (select count(*) from public.questions) and not exists (select 1 from public.finished_quizes where user_id=auth.uid()) then
  -- can assign flag
  INSERT into public.finished_quizes(user_id) values (auth.uid());
end if;

return NEW;
end;
$$;

create or replace trigger trg_assign_finished_quiz_flag after insert on public.user_answers 
for each row execute function check_if_finished_quiz();