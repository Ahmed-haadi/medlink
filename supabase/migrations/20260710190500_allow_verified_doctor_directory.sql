create policy "profiles_select_verified_doctors" on public.profiles for select to authenticated using (
  role = 'doctor' and status = 'active' and exists (
    select 1 from public.doctor_verifications v where v.doctor_id = profiles.id and v.status = 'approved'
  )
);

