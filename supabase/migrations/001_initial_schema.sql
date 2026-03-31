-- =============================================================
-- Taisa – Supabase database setup
-- Run this in the Supabase SQL Editor (Database → SQL Editor)
-- =============================================================

-- ── 1. ANNOUNCEMENTS ─────────────────────────────────────────

create table if not exists announcements (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  content    text not null,
  created_at timestamptz default now()
);

alter table announcements enable row level security;

-- Drop any old catch-all policy first
drop policy if exists "auth users only" on announcements;

create policy "announcements: authenticated read"
  on announcements for select
  using (auth.uid() is not null);

create policy "announcements: authenticated insert"
  on announcements for insert
  with check (auth.uid() is not null);

create policy "announcements: authenticated update"
  on announcements for update
  using  (auth.uid() is not null)
  with check (auth.uid() is not null);

create policy "announcements: authenticated delete"
  on announcements for delete
  using (auth.uid() is not null);


-- ── 2. DOCUMENTS ─────────────────────────────────────────────

create table if not exists documents (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  file_url   text not null,
  created_at timestamptz default now()
);

alter table documents enable row level security;

drop policy if exists "auth users only" on documents;

create policy "documents: authenticated read"
  on documents for select
  using (auth.uid() is not null);

-- INSERT requires WITH CHECK (not USING) — this is the common mistake
create policy "documents: authenticated insert"
  on documents for insert
  with check (auth.uid() is not null);

create policy "documents: authenticated update"
  on documents for update
  using  (auth.uid() is not null)
  with check (auth.uid() is not null);

create policy "documents: authenticated delete"
  on documents for delete
  using (auth.uid() is not null);


-- ── 3. MAINTENANCE REQUESTS ──────────────────────────────────

create table if not exists maintenance_requests (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text not null,
  status      text not null default 'open',
  created_at  timestamptz default now()
);

alter table maintenance_requests enable row level security;

drop policy if exists "auth users only" on maintenance_requests;

create policy "maintenance: authenticated read"
  on maintenance_requests for select
  using (auth.uid() is not null);

create policy "maintenance: authenticated insert"
  on maintenance_requests for insert
  with check (auth.uid() is not null);

create policy "maintenance: authenticated update"
  on maintenance_requests for update
  using  (auth.uid() is not null)
  with check (auth.uid() is not null);

create policy "maintenance: authenticated delete"
  on maintenance_requests for delete
  using (auth.uid() is not null);


-- ── 4. STORAGE: documents bucket ─────────────────────────────
-- Create the bucket in the Supabase dashboard:
--   Storage → New bucket → name: "documents" → Public: ON
--
-- Then run these storage policies:

insert into storage.buckets (id, name, public)
values ('documents', 'documents', true)
on conflict (id) do update set public = true;

-- Drop old policies if they exist
drop policy if exists "documents storage: authenticated upload"  on storage.objects;
drop policy if exists "documents storage: public read"          on storage.objects;
drop policy if exists "documents storage: authenticated delete" on storage.objects;

create policy "documents storage: public read"
  on storage.objects for select
  using (bucket_id = 'documents');

create policy "documents storage: authenticated upload"
  on storage.objects for insert
  with check (
    bucket_id = 'documents'
    and auth.uid() is not null
  );

create policy "documents storage: authenticated delete"
  on storage.objects for delete
  using (
    bucket_id = 'documents'
    and auth.uid() is not null
  );
