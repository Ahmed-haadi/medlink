create or replace function private.is_current_user_pending_doctor()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select (select auth.uid()) is not null
    and exists (
      select 1
      from public.profiles
      where id = (select auth.uid())
        and role = 'doctor'
        and status = 'pending'
    );
$$;

revoke all on function private.is_current_user_pending_doctor() from public;
revoke all on function private.is_current_user_pending_doctor() from anon;
grant execute on function private.is_current_user_pending_doctor() to authenticated;

drop policy if exists verification_insert_own_pending_doctor
on public.doctor_verifications;

create policy verification_insert_own_pending_doctor
on public.doctor_verifications
for insert
to authenticated
with check (
  doctor_id = (select auth.uid())
  and (select private.is_current_user_pending_doctor())
);

drop policy if exists certificates_delete_own_folder on storage.objects;

create policy certificates_delete_own_folder
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'certificates'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
