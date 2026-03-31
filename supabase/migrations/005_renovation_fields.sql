-- =============================================================
-- Taisa – Migration 005: Remonttikenttien laajennus
-- Lisää tilikausi/vuosi-kentän sekä kategoriakentän
-- Run in Supabase SQL Editor after migrations 001–004
-- =============================================================

alter table renovations
  -- Tilikausi / suoritusvuosi (vaihtoehto tarkalle päivämäärälle)
  -- Derivoidaan automaattisesti end_date:sta jos jätetään tyhjäksi
  add column if not exists fiscal_year         int,
  -- Vapaa kategoriaryhmittely (esim. "Katto", "LVIS", "Julkisivu")
  add column if not exists renovation_category text default '';

-- Index for grouping queries
create index if not exists renovations_fiscal_year_idx
  on renovations (fiscal_year desc nulls last);

create index if not exists renovations_category_idx
  on renovations (renovation_category);
