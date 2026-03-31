-- =============================================================
-- Taisa – Migration 006: Fix attachments entity_type CHECK
-- Adds 'certificate' to the allowed entity_type values.
-- Run in Supabase SQL Editor after 003.
-- =============================================================

-- Drop the old constraint and replace with an updated one that
-- includes 'certificate'.
alter table attachments
  drop constraint if exists attachments_entity_type_check;

alter table attachments
  add constraint attachments_entity_type_check
  check (entity_type in (
    'general',
    'company',
    'renovation',
    'maintenance_plan',
    'maintenance_request',
    'announcement',
    'certificate'
  ));
