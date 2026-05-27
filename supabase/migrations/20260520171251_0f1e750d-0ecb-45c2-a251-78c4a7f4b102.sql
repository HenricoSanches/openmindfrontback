
create table public.medical_records (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid references public.appointments(id) on delete set null,
  patient_id uuid not null,
  psychologist_id uuid not null,
  session_date timestamptz not null default now(),
  content text not null,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index medical_records_patient_idx on public.medical_records(patient_id);
create index medical_records_psy_idx on public.medical_records(psychologist_id);

alter table public.medical_records enable row level security;

create policy "Psychologist manages own records"
  on public.medical_records for all to authenticated
  using (psychologist_id = auth.uid())
  with check (psychologist_id = auth.uid() and has_role(auth.uid(), 'psychologist'));

create policy "Patient reads own records"
  on public.medical_records for select to authenticated
  using (patient_id = auth.uid());

create policy "Admins manage all records"
  on public.medical_records for all to authenticated
  using (has_role(auth.uid(), 'admin'))
  with check (has_role(auth.uid(), 'admin'));

create trigger medical_records_touch
  before update on public.medical_records
  for each row execute function public.touch_updated_at();
