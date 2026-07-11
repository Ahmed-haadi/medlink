create schema private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create function private.is_admin() returns boolean language sql stable security definer set search_path = public, auth as $$
  select exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin' and status = 'active');
$$;

create function private.is_verified_doctor(doctor_uuid uuid) returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles p join public.doctor_verifications v on v.doctor_id = p.id
    where p.id = doctor_uuid and p.role = 'doctor' and p.status = 'active' and v.status = 'approved'
  );
$$;

create function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public, auth as $$
declare requested_role public.user_role;
begin
  requested_role := case when new.raw_user_meta_data ->> 'account_type' = 'doctor' then 'doctor'::public.user_role else 'patient'::public.user_role end;
  insert into public.profiles (id, role, status, full_name)
  values (new.id, requested_role, case when requested_role = 'doctor' then 'pending'::public.account_status else 'active'::public.account_status end, coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), 'MedLink user'));
  return new;
end;
$$;

create function public.protect_profile_authorization_fields() returns trigger language plpgsql set search_path = '' as $$
begin
  if (new.role is distinct from old.role or new.status is distinct from old.status) and auth.role() <> 'service_role' then
    raise exception 'Only the server can change account role or status';
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
create trigger protect_profile_authorization_fields before update on public.profiles for each row execute function public.protect_profile_authorization_fields();

create policy "profiles_select_own_admin_or_associated_doctor" on public.profiles for select to authenticated using (
  id = (select auth.uid()) or (select private.is_admin()) or ((select private.is_verified_doctor((select auth.uid()))) and exists (select 1 from public.conversations c where c.doctor_id = (select auth.uid()) and c.patient_id = profiles.id))
);
create policy "profiles_update_own" on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "verification_select_own_or_admin" on public.doctor_verifications for select to authenticated using (doctor_id = (select auth.uid()) or (select private.is_admin()));
create policy "verification_insert_own_pending_doctor" on public.doctor_verifications for insert to authenticated with check (doctor_id = (select auth.uid()) and exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'doctor' and status = 'pending'));

create policy "conversations_select_participants_or_admin" on public.conversations for select to authenticated using (patient_id = (select auth.uid()) or doctor_id = (select auth.uid()) or (select private.is_admin()));
create policy "conversations_insert_patient_to_verified_doctor" on public.conversations for insert to authenticated with check (patient_id = (select auth.uid()) and (select private.is_verified_doctor(doctor_id)));
create policy "conversations_update_participants_or_admin" on public.conversations for update to authenticated using (patient_id = (select auth.uid()) or doctor_id = (select auth.uid()) or (select private.is_admin())) with check (patient_id = (select auth.uid()) or doctor_id = (select auth.uid()) or (select private.is_admin()));

create policy "messages_select_conversation_participants_or_admin" on public.messages for select to authenticated using (exists (select 1 from public.conversations c where c.id = messages.conversation_id and (c.patient_id = (select auth.uid()) or c.doctor_id = (select auth.uid()))) or (select private.is_admin()));
create policy "messages_insert_by_conversation_participant" on public.messages for insert to authenticated with check (sender_id = (select auth.uid()) and exists (select 1 from public.conversations c where c.id = messages.conversation_id and (c.patient_id = (select auth.uid()) or c.doctor_id = (select auth.uid()))));

create policy "reports_select_patient_associated_doctor_or_admin" on public.reports for select to authenticated using (patient_id = (select auth.uid()) or doctor_id = (select auth.uid()) or (select private.is_admin()));
create policy "reports_insert_associated_verified_doctor" on public.reports for insert to authenticated with check (doctor_id = (select auth.uid()) and (select private.is_verified_doctor((select auth.uid()))) and exists (select 1 from public.conversations c where c.patient_id = reports.patient_id and c.doctor_id = (select auth.uid())));

create policy "discussion_threads_select_verified_doctors_or_admin" on public.discussion_threads for select to authenticated using ((select private.is_verified_doctor((select auth.uid()))) or (select private.is_admin()));
create policy "discussion_threads_insert_verified_doctors" on public.discussion_threads for insert to authenticated with check (author_id = (select auth.uid()) and (select private.is_verified_doctor((select auth.uid()))));
create policy "discussion_threads_update_author_or_admin" on public.discussion_threads for update to authenticated using (author_id = (select auth.uid()) or (select private.is_admin())) with check (author_id = (select auth.uid()) or (select private.is_admin()));
create policy "discussion_comments_select_verified_doctors_or_admin" on public.discussion_comments for select to authenticated using ((select private.is_verified_doctor((select auth.uid()))) or (select private.is_admin()));
create policy "discussion_comments_insert_verified_doctors" on public.discussion_comments for insert to authenticated with check (author_id = (select auth.uid()) and (select private.is_verified_doctor((select auth.uid()))));
create policy "discussion_comments_update_author_or_admin" on public.discussion_comments for update to authenticated using (author_id = (select auth.uid()) or (select private.is_admin())) with check (author_id = (select auth.uid()) or (select private.is_admin()));

create policy "certificates_insert_own_folder" on storage.objects for insert to authenticated with check (bucket_id = 'certificates' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "certificates_select_owner_or_admin" on storage.objects for select to authenticated using (bucket_id = 'certificates' and ((storage.foldername(name))[1] = (select auth.uid())::text or (select private.is_admin())));
