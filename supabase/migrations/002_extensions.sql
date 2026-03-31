-- =============================================================
-- Taisa – Migration 002: Isännöitsijälaajennukset
-- Run this in the Supabase SQL Editor after 001_initial_schema.sql
-- =============================================================


-- ── 1. YHTIÖN PERUSTIEDOT ─────────────────────────────────────
-- Yksi rivi per taloyhtiö (upsert id = 1)

create table if not exists company_info (
  id                    int  primary key default 1,  -- singleton row
  company_name          text not null default '',
  business_id           text default '',             -- Y-tunnus
  address               text default '',
  postal_code           text default '',
  city                  text default '',
  built_year            int,
  floor_area_m2         numeric(10,2),               -- Kerrosala m²
  volume_m3             numeric(10,2),               -- Tilavuus m³
  plot_area_m2          numeric(10,2),               -- Tontin pinta-ala m²
  property_id           text default '',             -- Kiinteistötunnus
  apartment_count       int,
  manager_name          text default '',             -- Isännöitsijä
  manager_email         text default '',
  manager_phone         text default '',
  auditor_name          text default '',             -- Tilintarkastaja
  board_chair_name      text default '',             -- Hallituksen pj.
  bank_account          text default '',             -- Tilinumero (IBAN)
  updated_at            timestamptz default now(),
  constraint company_info_singleton check (id = 1)
);

alter table company_info enable row level security;

create policy "company_info: authenticated read"
  on company_info for select
  using (auth.uid() is not null);

create policy "company_info: authenticated insert"
  on company_info for insert
  with check (auth.uid() is not null);

create policy "company_info: authenticated update"
  on company_info for update
  using  (auth.uid() is not null)
  with check (auth.uid() is not null);

-- Seed the singleton row so upsert always works
insert into company_info (id) values (1) on conflict (id) do nothing;


-- ── 2. KUNNOSSAPITOSUUNNITELMA (PTS) ─────────────────────────

create table if not exists maintenance_plan (
  id              uuid primary key default gen_random_uuid(),
  target          text not null,          -- Kohde: katto, putket, jne.
  description     text default '',
  planned_year    int,                    -- Arvioitu toteutusvuosi
  estimated_cost  numeric(12,2),          -- Arvioitu kustannus (€)
  urgency         text not null default 'medium'
                  check (urgency in ('low','medium','high','critical')),
  status          text not null default 'planned'
                  check (status in ('planned','in_progress','done')),
  notes           text default '',
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

alter table maintenance_plan enable row level security;

create policy "maintenance_plan: authenticated read"
  on maintenance_plan for select
  using (auth.uid() is not null);

create policy "maintenance_plan: authenticated insert"
  on maintenance_plan for insert
  with check (auth.uid() is not null);

create policy "maintenance_plan: authenticated update"
  on maintenance_plan for update
  using  (auth.uid() is not null)
  with check (auth.uid() is not null);

create policy "maintenance_plan: authenticated delete"
  on maintenance_plan for delete
  using (auth.uid() is not null);


-- ── 3. REMONTIT ───────────────────────────────────────────────

create table if not exists renovations (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  description      text default '',
  renovation_type  text not null default 'planned'
                   check (renovation_type in ('planned','ongoing','completed')),
  start_date       date,
  end_date         date,
  total_cost       numeric(14,2),          -- Toteutunut kustannus (€)
  estimated_cost   numeric(14,2),          -- Arvioitu kustannus (€)
  contractor       text default '',        -- Urakoitsija
  contractor_email text default '',
  contractor_phone text default '',
  notes            text default '',
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

alter table renovations enable row level security;

create policy "renovations: authenticated read"
  on renovations for select
  using (auth.uid() is not null);

create policy "renovations: authenticated insert"
  on renovations for insert
  with check (auth.uid() is not null);

create policy "renovations: authenticated update"
  on renovations for update
  using  (auth.uid() is not null)
  with check (auth.uid() is not null);

create policy "renovations: authenticated delete"
  on renovations for delete
  using (auth.uid() is not null);


-- ── 4. REMONTIN TEHTÄVÄT / VAIHEET ───────────────────────────

create table if not exists renovation_tasks (
  id              uuid primary key default gen_random_uuid(),
  renovation_id   uuid not null references renovations(id) on delete cascade,
  title           text not null,
  status          text not null default 'todo'
                  check (status in ('todo','in_progress','done')),
  assignee        text default '',        -- Vastuuhenkilö
  due_date        date,
  notes           text default '',
  created_at      timestamptz default now()
);

alter table renovation_tasks enable row level security;

create policy "renovation_tasks: authenticated read"
  on renovation_tasks for select
  using (auth.uid() is not null);

create policy "renovation_tasks: authenticated insert"
  on renovation_tasks for insert
  with check (auth.uid() is not null);

create policy "renovation_tasks: authenticated update"
  on renovation_tasks for update
  using  (auth.uid() is not null)
  with check (auth.uid() is not null);

create policy "renovation_tasks: authenticated delete"
  on renovation_tasks for delete
  using (auth.uid() is not null);


-- ── 5. ISÄNNÖITSIJÄNTODISTUKSET ──────────────────────────────

create table if not exists manager_certificates (
  id                  uuid primary key default gen_random_uuid(),
  issued_date         date not null default current_date,
  recipient_name      text not null,           -- Vastaanottaja
  apartment_number    text not null,           -- Huoneisto
  share_numbers       text default '',         -- Osakesarja ja numerot
  share_count         int,                     -- Osakkeiden lukumäärä
  floor_area_m2       numeric(8,2),            -- Huoneistoala m²
  rooms               text default '',         -- Huoneistokuvaus
  debt_free_price     numeric(14,2),           -- Velaton hinta (€)
  loan_share          numeric(14,2),           -- Lainaosuus (€)
  maintenance_charge  numeric(10,2),           -- Yhtiövastike (€/kk)
  financing_charge    numeric(10,2),           -- Rahoitusvastike (€/kk)
  other_charges       text default '',         -- Muut maksut
  encumbrances        text default '',         -- Rasitteet / panttaukset
  remarks             text default '',         -- Huomautukset
  created_by          text default '',         -- Allekirjoittaja
  created_at          timestamptz default now()
);

alter table manager_certificates enable row level security;

create policy "manager_certificates: authenticated read"
  on manager_certificates for select
  using (auth.uid() is not null);

create policy "manager_certificates: authenticated insert"
  on manager_certificates for insert
  with check (auth.uid() is not null);

create policy "manager_certificates: authenticated update"
  on manager_certificates for update
  using  (auth.uid() is not null)
  with check (auth.uid() is not null);

create policy "manager_certificates: authenticated delete"
  on manager_certificates for delete
  using (auth.uid() is not null);
