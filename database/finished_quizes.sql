create table finished_quizes(
  user_id uuid not null unique references auth.users(id) on update cascade on delete cascade
);

create policy "finished_quizes - no one can insert"
on public.finished_quizes
as permissive
for insert
to public, authenticated, anon
with check (false);

create policy "finished_quizes - user can select"
on public.finished_quizes
as permissive
for select
to authenticated
using (user_id = auth.uid());

create policy "finished_quizes - no one can delete"
on public.finished_quizes
as permissive
for delete
to authenticated
using (false);

create policy "finished_quizes - no one can update"
on public.finished_quizes
as permissive
for update
to public, authenticated, anon
using (false)
with check (false);