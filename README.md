# Kampanmaster

Webová aplikace pro správu úkolů volební kampaně. Určena pro tým 5–15 lidí.

## Funkce

- Přihlášení přes Google (whitelist e-mailů z Google Sheets)
- Projekty s úkoly, termíny a přiřazením osob
- Odpočet do voleb
- Upozornění na blížící se termíny
- Rozcestník s odkazy (editovatelný v Google Sheets)
- Drag & drop řazení projektů i úkolů
- E-mailové notifikace při přiřazení úkolu
- Metadata úkolů (kdo vytvořil/upravil) v tooltipu

## Tech stack

- **Frontend:** React 18 + Vite + Tailwind CSS
- **Backend:** Firebase (Firestore + Auth + Hosting)
- **Správa týmu:** Google Sheets
- **Notifikace:** Firebase Cloud Functions + Gmail SMTP

---

## Zprovoznění

### 1. Firebase

1. Vytvoř projekt na [console.firebase.google.com](https://console.firebase.google.com)
2. Povol **Google Authentication** (Build → Authentication → Sign-in method → Google)
3. Vytvoř **Firestore databázi** (Build → Firestore Database → Create database → production mode → europe-west1)
4. Nastav **Hosting** (Build → Hosting → Get started)
5. V Project Settings → Your apps → přidej Web app a zkopíruj `firebaseConfig`

### 2. Google Sheets

Vytvoř tabulku se dvěma listy:

**List `Uživatelé`** — členové týmu:

| A - Jméno | B - Email | C - Telefon | D - WhatsApp | E - Aktivní | F - Admin |
|---|---|---|---|---|---|
| Jan Novák | jan@gmail.com | +420123456789 | 1 | 1 | 1 |
| Eva Svobodová | eva@gmail.com | | 0 | 1 | 0 |

- WhatsApp: `1` = chce notifikace, `0` = nechce
- Aktivní: `1` = má přístup, `0` = nemá
- Admin: `1` = může vytvářet/mazat projekty, `0` = nemůže

**List `Odkazy`** — rozcestník:

| A - Kategorie | B - Název | C - URL |
|---|---|---|
| Hlavní složky | Kampaňová složka | https://drive.google.com/... |
| Socky | Facebook | https://facebook.com/... |
| | Harmonogram | https://docs.google.com/... |

Nastav sdílení tabulky: **Kdokoliv s odkazem → Zobrazení**.

### 3. Google Sheets API klíč

1. Jdi na [console.cloud.google.com](https://console.cloud.google.com), vyber stejný projekt jako Firebase
2. APIs & Services → Library → zapni **Google Sheets API**
3. APIs & Services → Credentials → Create Credentials → **API Key**
4. Omez klíč na Google Sheets API

### 4. Instalace

```bash
git clone https://github.com/michalberg/kampanmaster.git
cd kampanmaster
npm install
```

### 5. Konfigurace

Vytvoř soubor `.env.local`:

```bash
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_AUTH_DOMAIN=xxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=xxx
VITE_FIREBASE_STORAGE_BUCKET=xxx.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=xxx
VITE_FIREBASE_APP_ID=xxx

VITE_GOOGLE_API_KEY=xxx
VITE_TEAM_SHEET_ID=xxx          # ID tabulky z URL
VITE_QUICKLINKS_SHEET_ID=xxx    # stejné nebo jiné ID

VITE_APP_URL=https://tvuj-projekt.web.app
VITE_ELECTION_DATE=2026-10-09
```

### 6. Lokální vývoj

```bash
npm run dev
```

### 7. Deploy

```bash
npm install -g firebase-tools
firebase login
npm run build
firebase deploy --only hosting,firestore:rules
```

---

## GitHub Actions (automatický deploy)

Po každém push na `main` se automaticky builduje a deployuje.

### Nastavení

1. Vygeneruj Firebase CI token: `npx firebase-tools login:ci`
2. Na GitHubu v Settings → Secrets → Actions přidej:

| Secret | Hodnota |
|---|---|
| `FIREBASE_TOKEN` | token z předchozího kroku |
| `VITE_FIREBASE_API_KEY` | z Firebase config |
| `VITE_FIREBASE_AUTH_DOMAIN` | `xxx.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | ID projektu |
| `VITE_FIREBASE_STORAGE_BUCKET` | `xxx.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | sender ID |
| `VITE_FIREBASE_APP_ID` | app ID |
| `VITE_GOOGLE_API_KEY` | Google Sheets API klíč |
| `VITE_TEAM_SHEET_ID` | ID tabulky |
| `VITE_QUICKLINKS_SHEET_ID` | ID tabulky |

---

## E-mailové notifikace (volitelné)

Notifikace se odesílají přes Firebase Cloud Functions a Gmail.

### Nastavení

1. Vytvoř Google účet pro odesílání (např. `kampan@gmail.com`)
2. Zapni 2-Step Verification na [myaccount.google.com/security](https://myaccount.google.com/security)
3. Vytvoř App Password na [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
4. Nastav Firebase Functions config:

```bash
firebase functions:config:set \
  email.user="kampan@gmail.com" \
  email.password="xxxx-xxxx-xxxx-xxxx" \
  email.from_name="Kampanmaster" \
  app.url="https://tvuj-projekt.web.app"
```

5. Deploy funkcí:

```bash
cd functions && npm install && cd ..
firebase deploy --only functions
```

---

## Správa týmu

- **Přidat člena:** přidej řádek do listu `Uživatelé` — aplikace se aktualizuje do 5 minut
- **Odebrat člena:** nastav Aktivní na `0`
- **Udělit admin práva:** nastav Admin na `1`
- **Upravit rozcestník:** edituj list `Odkazy` — aplikace se aktualizuje do 10 minut
