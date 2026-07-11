begin;

create type public.user_role as enum ('patient', 'doctor', 'admin');
create type public.account_status as enum ('active', 'pending', 'suspended', 'rejected');
create type public.verification_status as enum ('pending', 'approved', 'rejected');
create type public.message_type as enum ('text', 'voice', 'file', 'video_call');

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null default 'patient',
  status public.account_status not null default 'active',
  full_name text not null,
  date_of_birth date,
  gender text,
  phone text,
  avatar_path text,
  preferred_language text not null default 'en',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.doctor_verifications (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null unique references public.profiles(id) on delete cascade,
  certificate_path text not null,
  university text not null,
  license_number text,
  specialization text not null,
  status public.verification_status not null default 'pending',
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(id) on delete restrict,
  doctor_id uuid not null references public.profiles(id) on delete restrict,
  status text not null default 'open' check (status in ('open', 'closed', 'archived')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (patient_id, doctor_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete restrict,
  type public.message_type not null default 'text',
  body text,
  attachment_path text,
  sent_at timestamptz not null default timezone('utc', now()),
  read_at timestamptz,
  constraint message_has_content check (body is not null or attachment_path is not null)
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(id) on delete restrict,
  doctor_id uuid references public.profiles(id) on delete set null,
  conversation_id uuid references public.conversations(id) on delete set null,
  title text not null,
  summary text,
  report_path text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.discussion_threads (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete restrict,
  title text not null,
  body text not null,
  specialty text,
  is_anonymized boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.discussion_comments (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.discussion_threads(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete restrict,
  body text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index conversations_patient_id_idx on public.conversations(patient_id);
create index conversations_doctor_id_idx on public.conversations(doctor_id);
create index messages_conversation_sent_at_idx on public.messages(conversation_id, sent_at);
create index reports_patient_created_at_idx on public.reports(patient_id, created_at desc);
create index discussion_threads_specialty_created_at_idx on public.discussion_threads(specialty, created_at desc);
create index discussion_comments_thread_created_at_idx on public.discussion_comments(thread_id, created_at);

create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger doctor_verifications_set_updated_at before update on public.doctor_verifications for each row execute function public.set_updated_at();
create trigger conversations_set_updated_at before update on public.conversations for each row execute function public.set_updated_at();
create trigger reports_set_updated_at before update on public.reports for each row execute function public.set_updated_at();
create trigger discussion_threads_set_updated_at before update on public.discussion_threads for each row execute function public.set_updated_at();
create trigger discussion_comments_set_updated_at before update on public.discussion_comments for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.doctor_verifications enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.reports enable row level security;
alter table public.discussion_threads enable row level security;
alter table public.discussion_comments enable row level security;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('certificates', 'certificates', false, 10485760, array['application/pdf', 'image/jpeg', 'image/png']),
  ('chat-files', 'chat-files', false, 26214400, array['application/pdf', 'image/jpeg', 'image/png', 'audio/mpeg', 'audio/webm']),
  ('reports', 'reports', false, 10485760, array['application/pdf'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

commit;
