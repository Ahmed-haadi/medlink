revoke all on function public.handle_new_user() from public;
revoke all on function public.protect_profile_authorization_fields() from public;
revoke all on function private.is_admin() from public;
revoke all on function private.is_verified_doctor(uuid) from public;
grant execute on function private.is_admin() to authenticated;
grant execute on function private.is_verified_doctor(uuid) to authenticated;
