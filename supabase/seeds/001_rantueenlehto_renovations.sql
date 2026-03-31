-- =============================================================
-- Taisa – Seed: Asunto Oy Rantueenlehto – historiaremontti-syöttö
-- Lähde: isännöitsijäntodistuksen "Suoritetut peruskorjaukset" -osio
--
-- Aja tämä Supabase SQL Editorissa MIGROINTIEN 001–005 jälkeen.
-- Jokainen tilikausi on oma rivi (tai useampi jos erityyppiset kohteet).
-- Kaikki ovat renovation_type = 'completed', ajoitus vain fiscal_year.
-- =============================================================

insert into renovations (
  name,
  description,
  renovation_type,
  renovation_category,
  fiscal_year,
  start_date,
  end_date,
  notes,
  created_at,
  updated_at
) values

-- ── 1996 ─────────────────────────────────────────────────────
(
  'Autokatosten huopakatteen korjaus (1996)',
  'Autokatosten kohdalla on korjattu kattojen huopakatetta.',
  'completed',
  'Katto',
  1996,
  null, null,
  'Tilikaudella 1996.',
  now(), now()
),
(
  'Sokkelien lisäeristys (1996)',
  'Rakennusten sokkeleihin on asennettu lisäeristeet.',
  'completed',
  'Julkisivu',
  1996,
  null, null,
  'Tilikaudella 1996.',
  now(), now()
),

-- ── 2000 ─────────────────────────────────────────────────────
(
  'Takkojen rakentaminen A2 ja B4 (2000)',
  'Osakkeenomistajat ovat rakennuttaneet omalla kustannuksellaan huoneistoihin A2 ja B4 takat. '
  || 'Hoito- ja kunnossapitovastuu on huoneiston omistajalla.',
  'completed',
  'Huoneistoremontti',
  2000,
  null, null,
  'Tilikaudella 2000. Osakkaiden kustantama.',
  now(), now()
),

-- ── 2008 ─────────────────────────────────────────────────────
(
  'Keittiö- ja eteiskaappiremontti A2 (2008)',
  'Osakkeenomistaja on huoneistossa A2 uusinut keittiön sekä eteisen eteiskaapit. '
  || 'Hoito- ja kunnossapitovastuu on huoneiston omistajalla.',
  'completed',
  'Huoneistoremontti',
  2008,
  null, null,
  'Tilikaudella 2008. Osakkaiden kustantama.',
  now(), now()
),

-- ── 2011 ─────────────────────────────────────────────────────
(
  'Vesivahinko ja lattiaremontti A2 (2011)',
  'Huoneistossa A2 on ollut vesivahinko keittiössä sekä sen lisäksi alakerran lattiamateriaali on uusittu. '
  || 'Näiden hoito- ja kunnossapitovastuu on huoneiston omistajalla.',
  'completed',
  'Huoneistoremontti',
  2011,
  null, null,
  'Tilikaudella 2011. Osakkaiden kustantama.',
  now(), now()
),

-- ── 2015 ─────────────────────────────────────────────────────
(
  'Saunaremontti B4 (2015)',
  'Huoneistossa B4 on tehty saunaremontti. Hoito- ja kunnossapitovastuu on huoneiston omistajilla.',
  'completed',
  'Huoneistoremontti',
  2015,
  null, null,
  'Tilikaudella 2015. Osakkaiden kustantama.',
  now(), now()
),

-- ── 2016 ─────────────────────────────────────────────────────
(
  'Lämminvesivaraajan vesivuoto A2 (2016)',
  'Huoneiston A2 vesiposti on vuotanut lämminvesivaraajan tilassa. '
  || 'Kuivaustoimet sekä korjaus on tehty. Vahinko on korjattu ja korjauskustannuksiin on saatu vakuutusyhtiöltä vakuutuskorvausta.',
  'completed',
  'Putket / LVI',
  2016,
  null, null,
  'Tilikaudella 2016. Vakuutuskorvaus saatu.',
  now(), now()
),

-- ── 2018 ─────────────────────────────────────────────────────
(
  'Keittiö- ja alakerranoviremontti B4 (2018)',
  'Huoneistossa B4 on tehty keittiöremontti sekä alakerta on remontoitu. '
  || 'Näiden hoito- ja kunnossapitovastuu on huoneiston omistajilla.',
  'completed',
  'Huoneistoremontti',
  2018,
  null, null,
  'Tilikaudella 2018. Osakkaiden kustantama.',
  now(), now()
),

-- ── 2020 ─────────────────────────────────────────────────────
(
  'Vesikaton uusiminen (2020)',
  'Taloyhtiön molempiin rakennuksiin on uusittu vesikatto.',
  'completed',
  'Katto',
  2020,
  null, null,
  'Tilikaudella 2020. Taloyhtiön kustantama.',
  now(), now()
),
(
  'Keittiö-, kylpyhuone- ja saunaremontti A1 (2020)',
  'Huoneistossa A1 on tehty keittiö-, kylpyhuone- ja saunaremontti. '
  || 'Näiden hoito- ja kunnossapitovastuu on huoneiston omistajilla.',
  'completed',
  'Huoneistoremontti',
  2020,
  null, null,
  'Tilikaudella 2020. Osakkaiden kustantama.',
  now(), now()
),

-- ── 2021 ─────────────────────────────────────────────────────
(
  'Julkisivujen maalaus (2021)',
  'Taloyhtiön molempiin rakennuksiin toteutettu julkisivujen maalaus asukkaiden toimesta. '
  || 'Osa maalauksista vielä kesken, pyritään saattamaan loppuun tilikaudella 2022.',
  'completed',
  'Julkisivu',
  2021,
  null, null,
  'Tilikaudella 2021. Asukkaiden toimesta. Osa töistä jatkui 2022.',
  now(), now()
),

-- ── 2022 ─────────────────────────────────────────────────────
(
  'Alakerran WC-remontti A2 (2022)',
  'Huoneistossa A2 on tehty alakerran wc:n remontti. Hoito- ja kunnossapitovastuu on huoneiston omistajalla.',
  'completed',
  'Huoneistoremontti',
  2022,
  null, null,
  'Tilikaudella 2022. Osakkaiden kustantama. '
  || 'Urakoitsija: Timpmark Oy (0967600–7). '
  || 'LV-työt: Vaajakosken sähkö- ja putkipalvelu Oy (Juhani Pitkälä). '
  || 'Sähkötyöt: Vaajakosken Sähköpalvelu Oy (Pekka Pitkä).',
  now(), now()
);
