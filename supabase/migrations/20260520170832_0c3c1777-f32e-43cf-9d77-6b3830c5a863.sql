
-- CONVERSATIONS
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null,
  psychologist_id uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (patient_id, psychologist_id)
);

alter table public.conversations enable row level security;

create policy "Participants see conversations"
  on public.conversations for select to authenticated
  using (patient_id = auth.uid() or psychologist_id = auth.uid());

create policy "Admins see all conversations"
  on public.conversations for select to authenticated
  using (has_role(auth.uid(), 'admin'));

create policy "Patients create conversations"
  on public.conversations for insert to authenticated
  with check (
    patient_id = auth.uid()
    and has_role(auth.uid(), 'patient')
    and has_role(psychologist_id, 'psychologist')
  );

create policy "Psychologists create conversations"
  on public.conversations for insert to authenticated
  with check (
    psychologist_id = auth.uid()
    and has_role(auth.uid(), 'psychologist')
    and has_role(patient_id, 'patient')
  );

create trigger conversations_touch
  before update on public.conversations
  for each row execute function public.touch_updated_at();

-- MESSAGES
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null,
  content text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index messages_conversation_idx on public.messages(conversation_id, created_at);

alter table public.messages enable row level security;

create policy "Participants read messages"
  on public.messages for select to authenticated
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.patient_id = auth.uid() or c.psychologist_id = auth.uid())
    )
  );

create policy "Participants send messages"
  on public.messages for insert to authenticated
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.patient_id = auth.uid() or c.psychologist_id = auth.uid())
    )
  );

create policy "Sender updates own messages"
  on public.messages for update to authenticated
  using (sender_id = auth.uid())
  with check (sender_id = auth.uid());

-- EVALUATIONS
create table public.evaluations (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments(id) on delete cascade,
  patient_id uuid not null,
  psychologist_id uuid not null,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (appointment_id)
);

create index evaluations_psychologist_idx on public.evaluations(psychologist_id);

alter table public.evaluations enable row level security;

create policy "Authenticated read evaluations"
  on public.evaluations for select to authenticated
  using (true);

create policy "Patients create own evaluations"
  on public.evaluations for insert to authenticated
  with check (
    patient_id = auth.uid()
    and exists (
      select 1 from public.appointments a
      where a.id = appointment_id
        and a.patient_id = auth.uid()
        and a.psychologist_id = evaluations.psychologist_id
        and a.status = 'completed'
    )
  );

create policy "Patients update own evaluations"
  on public.evaluations for update to authenticated
  using (patient_id = auth.uid())
  with check (patient_id = auth.uid());

create policy "Patients delete own evaluations"
  on public.evaluations for delete to authenticated
  using (patient_id = auth.uid());

create policy "Admins manage evaluations"
  on public.evaluations for all to authenticated
  using (has_role(auth.uid(), 'admin'))
  with check (has_role(auth.uid(), 'admin'));

create trigger evaluations_touch
  before update on public.evaluations
  for each row execute function public.touch_updated_at();

-- Realtime
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.conversations;
