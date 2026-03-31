-- =============================================================
-- Taisa – Migration 007: Kunnossapitosuunnitelma – lisäkentät
-- Lisää käyttöikä ja huoltoväli -kentät maintenance_plan-tauluun
-- Run in Supabase SQL Editor after migrations 001–006
-- =============================================================

alter table maintenance_plan
  -- Käyttöikä vuosina (esim. 40 vuotta)
  add column if not exists service_life_years        int,
  -- Huoltoväli vuosina (esim. 10 vuotta)
  add column if not exists maintenance_interval_years int,
  -- Priorisoinnin vapaa kuvaus (esim. "Kiireellinen", "Suositeltava", "Seurattava")
  add column if not exists priority_category         text default '';

-- Index for timeline queries
create index if not exists maintenance_plan_planned_year_idx
  on maintenance_plan (planned_year asc nulls last);
