-- =============================================================
-- Taisa – Migration 004: Isännöitsijäntodistus v2
-- Laajentaa company_info- ja manager_certificates-tauluja
-- Run in Supabase SQL Editor after migrations 001–003
-- =============================================================


-- ── 1. YHTIÖN PERUSTIEDOT – uudet kentät ─────────────────────

alter table company_info
  add column if not exists trade_register_date     date,         -- Kaupparekisterin merkinnän pvm
  add column if not exists articles_date           date,         -- Voimassa olevan yhtiöjärjestyksen pvm
  add column if not exists plot_type               text default '',  -- "Oma" / "Vuokra"
  add column if not exists plot_lease_end          date,         -- Vuokra-aika päättyy
  add column if not exists plot_landlord           text default '',  -- Vuokranantaja
  add column if not exists building_count          int,          -- Rakennusten lukumäärä
  add column if not exists building_type           text default '',  -- Talotyyppi / kuvaus
  add column if not exists building_material       text default '',  -- Pääasiallinen rakennusaine
  add column if not exists floors                  int,          -- Kerrosluku
  add column if not exists roof_type               text default '',  -- Kattotyyppi (esim. harjakatto)
  add column if not exists roof_material           text default '',  -- Kate (esim. pelti)
  add column if not exists heating_system          text default '',  -- Lämmitysjärjestelmä
  add column if not exists ventilation_system      text default '',  -- Ilmanvaihtojärjestelmä
  add column if not exists antenna_system          text default '',  -- Antennijärjestelmä
  add column if not exists insurance_company       text default '',  -- Vakuutusyhtiö / vakuutustyyppi
  add column if not exists parking_info            text default '',  -- Autopaikkatiedot
  add column if not exists total_shares            int,          -- Osakemäärä yhteensä
  add column if not exists building_rights_unused  text default '';  -- Vapaa rakennusoikeus


-- ── 2. ISÄNNÖITSIJÄNTODISTUKSET – uudet kentät ───────────────

alter table manager_certificates
  add column if not exists apartment_purpose        text default 'asunto',   -- Huoneiston käyttötarkoitus
  add column if not exists ownership_percentage     text default '100 %',    -- Omistusosuus
  add column if not exists overdue_payments         numeric(12,2) default 0, -- Erääntyneet maksut (€)
  add column if not exists maintenance_charge_basis text default '',          -- Hoitovastikkeen peruste
  add column if not exists water_charge             text default '',          -- Vesimaksu / peruste
  add column if not exists restrictions             text default '',          -- Käyttö- ja luovutusrajoitukset
  add column if not exists included_renovations     jsonb default '[]'::jsonb, -- Sisällytetyt remontit
  add column if not exists requester_apartment      text default '';          -- Todistuksen tilaaja (huoneisto)
