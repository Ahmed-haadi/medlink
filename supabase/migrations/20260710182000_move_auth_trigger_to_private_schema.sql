create function private.handle_new_user() returns trigger language plpgsql security definer set search_path = public, auth as $$
declare requested_role public.user_role;
begin
  requested_role := case when new.raw_user_meta_data ->> 'account_type' = 'doctor' then 'doctor'::public.user_role else 'patient'::public.user_role end;
  insert into public.profiles (id, role, status, full_name)
  values (new.id, requested_role, case when requested_role = 'doctor' then 'pending'::public.account_status else 'active'::public.account_status end, coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), 'MedLink user'));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure private.handle_new_user();
drop function public.handle_new_user();
revoke all on function private.handle_new_user() from public;
