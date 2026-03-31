-- =============================================================
-- Taisa – Migration 003: Polymorphic attachments
-- Run in Supabase SQL Editor after 001 and 002
-- =============================================================

-- ── ATTACHMENTS ───────────────────────────────────────────────
-- One table covers all entity types.
-- entity_type: 'general' | 'company' | 'renovation' |
--              'maintenance_plan' | 'maintenance_request' | 'announcement'
-- entity_id:   UUID of the related row (NULL for entity_type='company'
--              since company_info is a singleton).
-- storage_path: path inside the "documents" bucket, used for deletion.

create table if not exists attachments (
  id           uuid primary key default gen_random_uuid(),
  entity_type  text not null default 'general'
               check (entity_type in (
                 'general',
                 'company',
                 'renovation',
                 'maintenance_plan',
                 'maintenance_request',
                 'announcement'
               )),
  entity_id    uuid,          -- NULL for singleton entities (company)
  name         text not null, -- original file name shown in UI
  file_url     text not null, -- public URL
  storage_path text not null, -- bucket path for deletion
  file_size    bigint,        -- bytes (optional, for display)
  mime_type    text default '',
  uploaded_by  text default '',
  created_at   timestamptz default now()
);

-- Index for fast entity lookups
create index if not exists attachments_entity_idx
  on attachments (entity_type, entity_id);

alter table attachments enable row level security;

create policy "attachments: authenticated read"
  on attachments for select
  using (auth.uid() is not null);

create policy "attachments: authenticated insert"
  on attachments for insert
  with check (auth.uid() is not null);

create policy "attachments: authenticated delete"
  on attachments for delete
  using (auth.uid() is not null);


-- ── STORAGE: folder strategy ──────────────────────────────────
-- Files are stored under entity-scoped folders:
--   general/           → /documents general area
--   company/           → yhtiön perustiedot
--   renovation/<id>/   → remontin dokumentit
--   maintenance_plan/<id>/
--   maintenance_request/<id>/
--   announcement/<id>/
--
-- The existing "documents" bucket is reused.
-- No additional bucket setup needed.
