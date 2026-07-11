revoke execute on function public.admin_update_account_status(uuid, public.account_status) from public, anon, authenticated;
revoke execute on function public.admin_review_doctor_verification(uuid, boolean, text) from public, anon, authenticated;
grant execute on function public.admin_update_account_status(uuid, public.account_status) to authenticated;
grant execute on function public.admin_review_doctor_verification(uuid, boolean, text) to authenticated;
