-- Initial assessment table
create table if not exists public.initial_assessments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null unique,
  age_range text,
  course text,
  period text,
  motivations text[] not null default '{}',
  other_motivation text,
  symptoms text[] not null default '{}',
  symptom_intensity text,
  symptom_duration text,
  prior_therapy text,
  academic_performance text,
  social_relationships text,
  sleep_quality text,
  preferred_approach text,
  preferred_gender text,
  availability text[] not null default '{}',
  urgency text,
  crisis text,
  additional_notes text,
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.initial_assessments enable row level security;

create policy "Patient reads own assessment" on public.initial_assessments
  for select to authenticated using (patient_id = auth.uid());
create policy "Patient inserts own assessment" on public.initial_assessments
  for insert to authenticated with check (patient_id = auth.uid() and has_role(auth.uid(), 'patient'));
create policy "Patient updates own assessment" on public.initial_assessments
  for update to authenticated using (patient_id = auth.uid()) with check (patient_id = auth.uid());
create policy "Admins read all assessments" on public.initial_assessments
  for select to authenticated using (has_role(auth.uid(), 'admin'));
create policy "Psychologists read assigned patient assessments" on public.initial_assessments
  for select to authenticated using (
    exists (select 1 from public.appointments a where a.patient_id = initial_assessments.patient_id and a.psychologist_id = auth.uid())
  );

create trigger initial_assessments_touch
  before update on public.initial_assessments
  for each row execute function public.touch_updated_at();

-- Seed default admin user
do $$
declare
  v_uid uuid;
begin
  select id into v_uid from auth.users where email = 'admin@openmind.com';
  if v_uid is null then
    v_uid := gen_random_uuid();
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000', v_uid, 'authenticated', 'authenticated',
      'admin@openmind.com', extensions.crypt('Admin@123', extensions.gen_salt('bf')),
      now(), '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Administrador OpenMind"}'::jsonb,
      now(), now(), '', '', '', ''
    );
    insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), v_uid, jsonb_build_object('sub', v_uid::text, 'email', 'admin@openmind.com'), 'email', v_uid::text, now(), now(), now());
    insert into public.profiles (id, full_name, email) values (v_uid, 'Administrador OpenMind', 'admin@openmind.com')
      on conflict (id) do nothing;
  end if;
  delete from public.user_roles where user_id = v_uid and role <> 'admin';
  insert into public.user_roles (user_id, role) values (v_uid, 'admin')
    on conflict (user_id, role) do nothing;
end $$;