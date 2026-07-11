create type public.appointment_status as enum ('requested', 'confirmed', 'cancelled', 'completed');
create table public.appointments (
  id uuid primary key default gen_random_uuid(), patient_id uuid not null references public.profiles(id), doctor_id uuid not null references public.profiles(id), scheduled_at timestamptz not null, reason text,
  status public.appointment_status not null default 'requested', meeting_url text,
  created_at timestamptz not null default timezone('utc', now()), updated_at timestamptz not null default timezone('utc', now())
);
create index appointments_patient_scheduled_idx on public.appointments(patient_id, scheduled_at desc);
create index appointments_doctor_scheduled_idx on public.appointments(doctor_id, scheduled_at desc);
create trigger appointments_set_updated_at before update on public.appointments for each row execute function public.set_updated_at();
alter table public.appointments enable row level security;
create policy "appointments_select_participants_or_admin" on public.appointments for select to authenticated using (patient_id = (select auth.uid()) or doctor_id = (select auth.uid()) or (select private.is_admin()));
create policy "appointments_insert_patient_to_verified_doctor" on public.appointments for insert to authenticated with check (patient_id = (select auth.uid()) and (select private.is_verified_doctor(doctor_id)));
create policy "appointments_update_doctor_or_patient" on public.appointments for update to authenticated using (patient_id = (select auth.uid()) or doctor_id = (select auth.uid()) or (select private.is_admin())) with check (patient_id = (select auth.uid()) or doctor_id = (select auth.uid()) or (select private.is_admin()));

create policy "chat_files_participants_select" on storage.objects for select to authenticated using (bucket_id = 'chat-files' and exists (select 1 from public.conversations c where c.id::text = (storage.foldername(name))[1] and (c.patient_id = (select auth.uid()) or c.doctor_id = (select auth.uid()))));
create policy "chat_files_participants_insert" on storage.objects for insert to authenticated with check (bucket_id = 'chat-files' and exists (select 1 from public.conversations c where c.id::text = (storage.foldername(name))[1] and (c.patient_id = (select auth.uid()) or c.doctor_id = (select auth.uid()))));
create policy "reports_files_select_associated_users" on storage.objects for select to authenticated using (bucket_id = 'reports' and exists (select 1 from public.reports r where r.report_path = name and (r.patient_id = (select auth.uid()) or r.doctor_id = (select auth.uid()))));

create function public.admin_update_account_status(target_user uuid, next_status public.account_status) returns void language plpgsql security definer set search_path = public, private, auth as $$ begin if not private.is_admin() then raise exception 'Administrator access required'; end if; update public.profiles set status = next_status where id = target_user; end; $$;
create function public.admin_review_doctor_verification(verification_uuid uuid, approved boolean, note text default null) returns void language plpgsql security definer set search_path = public, private, auth as $$ declare target_doctor uuid; begin if not private.is_admin() then raise exception 'Administrator access required'; end if; select doctor_id into target_doctor from public.doctor_verifications where id = verification_uuid for update; if target_doctor is null then raise exception 'Verification not found'; end if; update public.doctor_verifications set status = case when approved then 'approved'::public.verification_status else 'rejected'::public.verification_status end, reviewed_by = (select auth.uid()), reviewed_at = timezone('utc', now()), rejection_reason = case when approved then null else note end where id = verification_uuid; update public.profiles set status = case when approved then 'active'::public.account_status else 'rejected'::public.account_status end where id = target_doctor; end; $$;
revoke all on function public.admin_update_account_status(uuid, public.account_status) from public;
revoke all on function public.admin_review_doctor_verification(uuid, boolean, text) from public;
grant execute on function public.admin_update_account_status(uuid, public.account_status) to authenticated;
grant execute on function public.admin_review_doctor_verification(uuid, boolean, text) to authenticated;
