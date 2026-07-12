insert into public.conversations(patient_id,doctor_id,status)
select distinct patient_id,doctor_id,'open' from public.appointments
on conflict(patient_id,doctor_id) do update set status='open',updated_at=timezone('utc',now());
