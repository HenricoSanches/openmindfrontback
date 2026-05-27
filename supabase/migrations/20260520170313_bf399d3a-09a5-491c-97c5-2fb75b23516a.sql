
-- Enum de papéis
create type public.app_role as enum ('patient', 'psychologist', 'admin');

create type public.appointment_status as enum ('scheduled', 'completed', 'cancelled');

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  cpf text,
  university text,
  -- psicólogo
  crp text,
  crp_region text,
  specialty text,
  approach text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- user_roles
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

-- has_role security definer
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

-- get primary role
create or replace function public.get_primary_role(_user_id uuid)
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.user_roles
  where user_id = _user_id
  order by case role when 'admin' then 1 when 'psychologist' then 2 else 3 end
  limit 1
$$;

-- Trigger updated_at
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch
before update on public.profiles
for each row execute function public.touch_updated_at();

-- Auto-create profile on signup using metadata
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role public.app_role;
begin
  insert into public.profiles (id, full_name, email, phone, cpf, university, crp, crp_region, specialty, approach, bio)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.email,
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'cpf',
    new.raw_user_meta_data->>'university',
    new.raw_user_meta_data->>'crp',
    new.raw_user_meta_data->>'crp_region',
    new.raw_user_meta_data->>'specialty',
    new.raw_user_meta_data->>'approach',
    new.raw_user_meta_data->>'bio'
  );

  v_role := coalesce((new.raw_user_meta_data->>'role')::public.app_role, 'patient');
  -- never auto-grant admin
  if v_role = 'admin' then v_role := 'patient'; end if;
  insert into public.user_roles (user_id, role) values (new.id, v_role);

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Appointments
create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references auth.users(id) on delete cascade,
  psychologist_id uuid not null references auth.users(id) on delete cascade,
  scheduled_at timestamptz not null,
  status public.appointment_status not null default 'scheduled',
  reminder_enabled boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on public.appointments (patient_id, scheduled_at desc);
create index on public.appointments (psychologist_id, scheduled_at desc);

alter table public.appointments enable row level security;

create trigger appointments_touch
before update on public.appointments
for each row execute function public.touch_updated_at();

-- RLS: profiles
create policy "Users can view own profile"
on public.profiles for select
to authenticated
using (id = auth.uid());

create policy "Authenticated can view psychologist profiles"
on public.profiles for select
to authenticated
using (public.has_role(id, 'psychologist'));

create policy "Admins can view all profiles"
on public.profiles for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Users can update own profile"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "Admins can update any profile"
on public.profiles for update
to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- RLS: user_roles
create policy "Users can view own roles"
on public.user_roles for select
to authenticated
using (user_id = auth.uid());

create policy "Admins can view all roles"
on public.user_roles for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can manage roles"
on public.user_roles for all
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

-- RLS: appointments
create policy "Patients see own appointments"
on public.appointments for select
to authenticated
using (patient_id = auth.uid());

create policy "Psychologists see own appointments"
on public.appointments for select
to authenticated
using (psychologist_id = auth.uid());

create policy "Admins see all appointments"
on public.appointments for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Patients create own appointments"
on public.appointments for insert
to authenticated
with check (
  patient_id = auth.uid()
  and public.has_role(auth.uid(), 'patient')
  and public.has_role(psychologist_id, 'psychologist')
);

create policy "Patients update own appointments"
on public.appointments for update
to authenticated
using (patient_id = auth.uid())
with check (patient_id = auth.uid());

create policy "Psychologists update own appointments"
on public.appointments for update
to authenticated
using (psychologist_id = auth.uid())
with check (psychologist_id = auth.uid());

create policy "Admins manage appointments"
on public.appointments for all
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create policy "Patients delete own scheduled appointments"
on public.appointments for delete
to authenticated
using (patient_id = auth.uid() and status = 'scheduled');
