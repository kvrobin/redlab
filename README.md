# 🔬 RED Lab – Kutatási & Szakdolgozati Együttműködési Platform

> **Tudományos projektmenedzsment, szakdolgozat-írási roadmap, GitHub-stílusú verziózott fájltár és automatizált kommunikációs motor a RED Lab kutatócsoportja és a témavezető professzorok számára.**

---

## 📋 Áttekintés & Célkitűzés

A **RED Lab Platform** egy célzottan tudományos kutatásokhoz, mikrofluidikai fejlesztésekhez és egyetemi szakdolgozatokhoz tervezett teljes körű együttműködési rendszer. Megszünteti az elszórt email-váltásokat, a verzióvesztést és az időpont-egyeztetési nehézségeket a három kutató (**Robin** – rendszer & kézirat, **Emma** – wet-lab & reagensek, **Domi** – CAD & CFD szimulációk) és a **Témavezető Professzorok** között.

---

## 🚀 Főbb Modulok és Képességek

### 1. 🎛️ Command Center Dashboard & Témavezetői Központ (Executive Hub)
- **Kutatói és Professzori mód:** 1-kattintásos váltás a kutatói operatív nézet és a témavezetői vezetői összefoglaló (KPI mutatók, szignálásra váró fejezetek, átnézendő feladatok) között.
- **Valós idejű Audit Feed:** Supabase Realtime feliratkozással követhető minden projektbeli esemény.

### 2. 📜 Mérföldkövek & Szakdolgozati Haladási Terv (Progress Roadmap)
- Fázis-alapú ütemterv (Kutatási célkitűzés ➜ Szimuláció ➜ Gyártás ➜ Mérések ➜ Kézirat véglegesítés).
- Szódarabszám-számláló, fejezet-szerkesztő és **hivatalos professzori digitális jóváhagyási (Sign-off) folyamat**.

### 3. 📌 Interaktív Kanban Tábla Kutatási Workstream-ekkel
- 5 státusz oszlop: `Ötletek`, `Teendő`, `Folyamatban`, `Témavezetői átnézésre vár (review_professor)`, `Kész`.
- Drag-and-Drop optimista UI-val, interaktív alfeladat-listával (Checklist) és professzori kiemelt visszajelzésekkel.
- Gyorsszűrők: **Mindenki | Robin (R) | Emma (E) | Domi (D)**, valamint kutatási ág szerint.

### 4. 🗓️ Intelligens Időpont-egyeztető (Smart Scheduler & Consensus Engine)
- Több javasolt idősáv kiírása konzultációkhoz és heti szinkronokhoz.
- **3-állású szavazás:** 👍 Upvote (Zöld), ⚠️ Ha muszáj (Borostyán), 👎 Downvote (Karmazsinvörös).
- **Okos Downvote indoklás:** Ütközés esetén azonnali indoklás és alternatív idősáv javaslat.
- **Auto-Reschedule Trigger (`evaluate_meeting_consensus`):** Ha minden sávot leszavaznak, a rendszer automatikusan újraütemezési állapotba kapcsolja a megbeszélést és riasztja a csapatot.
- Google Calendar és iCalendar (.ics) közvetlen integráció.

### 5. 📚 Szakirodalom & Cikk-Kezelő (Literature Hub)
- **1-Kattintásos CrossRef DOI Lekérdező:** DOI azonosító alapján automatikusan kitölti a címet, szerzőket, kiadási évet, folyóiratot és absztraktot.
- **Automatikus BibTeX Generálás:** Szabványos LaTeX hivatkozás készítése egyetlen másolás gombbal.
- Beépített PDF csatolás és olvasási státuszok (`Elolvasandó`, `Olvasás alatt`, `Jegyzetelve`, `Szakdogában hivatkozva`).
- **„Kiemelés a Témavezetőnek 📌”** professzori szűrőkapcsoló.

### 6. 🗄️ GitHub-stílusú Fájltár & Digitális Kutatási Napló (ELN)
- **Fájltár Git-bonyolultság nélkül:** Mappanézet (`Szakdolgozat`, `Labor adatok`, `CAD tervek`, `Kódok`, `Prezentációk`).
- **Okos Verziózás (`file_group_key` + `version_number`):** Új verzió feltöltésekor automatikusan emeli a verziószámot (`v2`, `v3`, `v4`), kötelező commit üzenettel.
- **Verziótörténet (Slide-over History Drawer):** Bármely korábbi verzió közvetlenül visszakereshető és letölthető.
- **Digitális Kutatási Napló:** Gazdag Markdown formázás élő előnézettel, strukturált fizikai paraméterek rögzítése (`Áramlási sebesség: 15 µL/min`, `Hőmérséklet: 37 °C`), és fájltárbeli állományok becsatolása.

### 7. 📡 Automatizált Kommunikációs Motor (Discord Webhook + Resend Email)
- **Discord / Slack Webhook integráció:** Karmazsinvörös (`color: 0xE11D48`) gazdag Embed kártyák küldése a csapat közös csatornájára.
- **Témavezetői Email Értesítések:** Resend API alapon professzionális HTML levelek a konzulenseknek.
- **Csapattag / Témavezető Meghívó Varázsló:** 1-kattintásos meghívó link generálás automatikus `supervisor` vagy `researcher` jogosultságokkal.

---

## 🛠️ Telepítés és Helyi Futtatás

### 1. Előfeltételek
- Node.js 18+ (ajánlott: Node.js 20 LTS vagy 22)
- npm vagy yarn / pnpm

### 2. Csomagok telepítése
```bash
npm install
```

### 3. Környezeti változók beállítása
Másold le a `.env.example` fájlt `.env.local` néven:
```bash
cp .env.example .env.local
```

Töltsd ki a környezeti változókat az alábbi leírás alapján:
```env
# Supabase Konfiguráció
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key-here

# Alkalmazás Címe
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Discord Webhook Értesítésekhez
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...

# Resend API Kulcs Email Értesítésekhez
RESEND_API_KEY=re_your_api_key_here
```

### 4. Fejlesztői szerver indítása
```bash
npm run dev
```
Nyisd meg a böngésződben a [http://localhost:3000](http://localhost:3000) címet!

---

## 🗄️ Supabase Adatbázis & Storage Beüzemelési Útmutató

### 1. Supabase Storage Bucket-ek létrehozása
A fájlok és PDF-ek tárolásához hozz létre két külön Storage bucket-et a Supabase Irányítópulton (**Storage > New Bucket**):

1. **`redlab-files`**
   - **Cél:** Szakdolgozat kéziratok (`.docx`), 3D mikrofluidikai modellek (`.stl`), szimulációs kódok (`.py`) és mérési nyersadatok (`.csv`).
   - **Public bucket:** Opcionális (vagy privát autentikált RLS szabályokkal).
   - **Fájlméret korlát:** 50 MB.

2. **`redlab-literature`**
   - **Cél:** Tudományos folyóiratcikkek, lektorált tanulmányok és könyvfejezetek (`.pdf`).
   - **Public bucket:** Ajánlott olvasási hozzáféréssel a beépített böngészős PDF megjelenítőhöz.
   - **Fájlméret korlát:** 30 MB.

### 2. Storage RLS Szabályok (Példa SQL)
```sql
-- Olvasási jog minden bejelentkezett kutatónak és témavezetőnek
CREATE POLICY "RED Lab Storage Read"
ON storage.objects FOR SELECT
USING (bucket_id IN ('redlab-files', 'redlab-literature'));

-- Feltöltési jog kutatóknak és témavezetőknek
CREATE POLICY "RED Lab Storage Insert"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id IN ('redlab-files', 'redlab-literature'));
```

---

## 🤖 Automatizált Események (Trigger Dispatcher)

A rendszer központi szerveroldali értesítő motorja (`src/lib/automation/notifier.ts`) és az `/api/notify` végpont a következő eseményeket közvetíti automatikusan:

| Esemény kód | Leírás | Érintett csatornák |
|---|---|---|
| `FILE_NEW_VERSION` | Új fájl vagy újabb revízió commitolása a tárhelyre | Discord Webhook + In-App |
| `TASK_READY_FOR_PROFESSOR` | Feladat / Mérföldkő témavezetői átnézésre küldve | Témavezető Email + Discord + In-App |
| `MILESTONE_SIGNED_OFF` | Professzor digitálisan szignálta vagy átdolgozásra küldte a fejezetet | Kutatók Értesítése + Discord |
| `MEETING_PROPOSED` | Új konzultáció vagy heti szinkron időpont-szavazás kiírása | Témavezető Email + Discord |
| `MEETING_RESCHEDULE_NEEDED` | Minden idősáv ütközött (Consensus fail trigger) | Sürgős Discord Riasztás + In-App |
| `MEETING_CONFIRMED` | Megbeszélés véglegesítve és Meet link rögzítve | Csapat Naptár + Discord + Email |

---

## 👥 Csapattagok és Szerepkörök

- 🔴 **Robin (`R`)**: Rendszeradminisztráció, Szakdolgozat Integráció & Kézirat (Dry Lab)
- 🌸 **Emma (`E`)**: Reagens Előkészítés, PDMS Plazmatisztítás & Cseppgenerálás (Wet Lab)
- 🟠 **Domi (`D`)**: CAD Tervezés, 3D Nyomtatás & OpenFOAM CFD Szimuláció (Dry Lab / Hardware)
- 🟣 **Prof. Dr. Kovács Gergely (`P`)**: Témavezető Egyetemi Docens (Executive Hub, Bírálat & Szignó)

---

## 📜 Licenc & Szakmai Hivatkozás
Készült a Budapesti Műszaki és Gazdaságtudományi Egyetem (BME) tudományos kutatásaihoz és diplomatervezési munkájához.
Minden jog fenntartva • **RED Lab 2026**
