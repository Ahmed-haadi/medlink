create or replace function public.protect_profile_authorization_fields()
returns trigger language plpgsql set search_path = '' as $$
begin
  if (new.role is distinct from old.role or new.status is distinct from old.status)
     and auth.role() <> 'service_role'
     and not private.is_admin() then
    raise exception 'Only an administrator can change account role or status';
  end if;
  return new;
end;
$$;
