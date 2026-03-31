# Copilot-ohjeistus: Taisa – Taloyhtiön isännöintisovellus

## 🎯 Projektin tavoite

Rakenna moderni, kevyt ja selkeä selainpohjainen isännöintisovellus pienelle asunto-osakeyhtiölle.

Sovelluksen nimi: **Taisa**

---

## 🧱 Teknologiat (pakolliset)

* Next.js (App Router, uusin versio)
* TypeScript
* Tailwind CSS
* Supabase (auth + database + storage)

---

## 🔗 Supabase-konfiguraatio

Käytä seuraavia ympäristömuuttujia:

```
NEXT_PUBLIC_SUPABASE_URL=https://tlfkdnqhtrjgmbehuqtt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_UU6-fiUVvlJE-nb8XgvN0Q_zLWkPJNH
```

Älä kovakoodaa näitä suoraan koodiin – käytä `.env.local` tiedostoa.

---

## 🏗️ Arkkitehtuuriperiaatteet

* Käytä Next.js App Routeria (`/app`)
* Suosi Server Components -komponentteja
* Käytä Client Components vain tarvittaessa (esim. lomakkeet)
* Erota logiikka ja UI selkeästi
* Vältä duplikaattikoodia (DRY)
* Luo uudelleenkäytettäviä komponentteja

---

## 📁 Projektirakenne

```
/app
  /login
  /dashboard
  /announcements
  /documents
  /maintenance

/components
  /ui
  Navbar.tsx
  Card.tsx

/lib
  supabaseClient.ts
  auth.ts

/types
  database.ts
```

---

## 🔐 Autentikointi

Toteuta Supabase Auth:

* Email + password login
* Kirjautumissivu `/login`
* Suojaa dashboard kirjautuneille käyttäjille
* Ohjaa kirjautumattomat käyttäjät login-sivulle

Lisäksi:

* Luo `auth` helper funktiot
* Käytä session tarkistusta server-side

---

## 🗄️ Tietokanta (Supabase)

Luo seuraavat taulut:

### `announcements`

* id (uuid)
* title (text)
* content (text)
* created_at (timestamp)

### `documents`

* id (uuid)
* name (text)
* file_url (text)
* created_at (timestamp)

### `maintenance_requests`

* id (uuid)
* title (text)
* description (text)
* status (text)
* created_at (timestamp)

---

## 🔐 Turvallisuus

* Ota käyttöön Row Level Security (RLS)
* Salli vain kirjautuneiden käyttäjien pääsy dataan
* Estä anonyymi pääsy

---

## 🎨 UI / UX vaatimukset

* Moderni ja minimalistinen design
* Käytä Tailwind CSS:ää
* Responsiivinen (mobile + desktop)
* Selkeä navigaatio (Navbar)

Suositukset:

* Korttipohjainen layout
* Selkeät lomakkeet
* Hyvä spacing ja typografia

---

## 🧩 Toiminnot (MVP)

### Dashboard

* Näytä ilmoitukset
* Nopeat linkit

### Ilmoitukset

* Listaus
* Luo uusi ilmoitus

### Dokumentit

* Lista
* Tiedoston upload (Supabase Storage)

### Vikailmoitukset

* Luo uusi
* Listaa omat

---

## 🧠 Koodityyli

* Käytä TypeScript-tyypityksiä kaikkialla
* Vältä any-tyyppiä
* Kirjoita selkeitä funktioita
* Käytä async/await
* Pilko komponentit pieniksi

---

## 🚀 Deployment

* Sovellus tulee olla deployattavissa Verceliin / github / netlify
* Ei kovakoodattuja arvoja
* Ympäristömuuttujat käytössä

---

## 📌 Ohje Copilotille

Kun generoidaan koodia:

* Suosi yksinkertaisia ratkaisuja
* Älä lisää turhia kirjastoja
* Käytä moderneja Next.js käytäntöjä
* Tee koodi tuotantovalmiiksi
* Kommentoi tarvittaessa lyhyesti

---

## ✅ Ensimmäinen tehtävä

1. Luo Next.js projekti
2. Konfiguroi Tailwind
3. Lisää Supabase client (`/lib/supabaseClient.ts`)
4. Toteuta login-sivu
5. Toteuta suojattu dashboard-sivu

---

## 🎯 Lopputulos

Selkeä, toimiva ja helposti laajennettava taloyhtiösovellus.
