create or replace function public.list_verified_doctors()
returns table (
  id uuid,
  full_name text,
  phone text,
  specialization text,
  university text
)
language sql
stable
security definer
set search_path = public, auth
as $$
  select p.id, p.full_name, p.phone, v.specialization, v.university
  from public.profiles p
  join public.doctor_verifications v on v.doctor_id = p.id
  where (select auth.uid()) is not null
    and p.role = 'doctor'
    and p.status = 'active'
    and v.status = 'approved'
  order by p.full_name;
$$;

revoke all on function public.list_verified_doctors() from public;
revoke all on function public.list_verified_doctors() from anon;
grant execute on function public.list_verified_doctors() to authenticated;
