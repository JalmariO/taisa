# Taisa – Laajennussuunnitelma

## Uudet toiminnallisuudet

### 1. Yhtiön perustiedot (`/company`)
- Yksi rivi per yhtiö (`company_info`-taulu)
- Yhtiön nimi, y-tunnus, osoite, rakennusvuosi, kerrosala, tilavuus, tontin pinta-ala, kiinteistötunnus, isännöitsijä, tilintarkastaja, hallituksen puheenjohtaja
- Lomake muokkaukseen (upsert)

### 2. Kunnossapitosuunnitelma (`/maintenance-plan`)
- Pitkän tähtäimen kunnossapitosuunnitelma (PTS)
- Kohde (esim. katto, putket), kuvaus, arvioitu vuosi, arvioitu kustannus, kiireellisyys (low/medium/high/critical), tila (planned/in_progress/done)
- Lista + uusi + muokkaus

### 3. Remontit (`/renovations`)
- Tehdyt ja tulevat remontit
- Remontin nimi, kuvaus, tyyppi (planned/ongoing/completed), aloitus- ja lopetuspäivä, kokonaiskustannus, urakoitsija
- Alataulun tehtävät/vaiheet (`renovation_tasks`): otsikko, tila, vastuuhenkilö, deadline
- Lista + detail-sivu + uusi

### 4. Isännöitsijäntodistukset (`/certificates`)
- Luo todistus yhtiön perustietojen pohjalta
- Tallennetaan todistuksen tiedot (vastaanottaja, päivämäärä, osake/huoneisto, velaton hinta, lainaosuus, yhtiövastike, jne.)
- Print/PDF-valmis layout

## Tietokanta

```
company_info          – yksi rivi, yhtiön perustiedot
maintenance_plan      – PTS-kohteet
renovations           – remontit
renovation_tasks      – remontin vaiheet/tehtävät
manager_certificates  – isännöitsijäntodistukset
```

## Navigaatio (ryhmitelty)

```
Dashboard
── Taloyhtiö
   Perustiedot
   Isännöitsijäntodistukset
── Suunnittelu
   Kunnossapitosuunnitelma (PTS)
   Remontit
── Viestintä
   Ilmoitukset
   Dokumentit
── Huolto
   Vikailmoitukset
```
