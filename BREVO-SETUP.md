# Brevo-opsætning for "Send mig tilbuddet"-feature

## Trin 1 – Opret nyhedsbrevsliste

1. Log ind på [app.brevo.com](https://app.brevo.com)
2. Gå til **Contacts → Lists**
3. Klik **"Create a list"**
4. Navngiv listen: `Nyhedsbrev mineudgifter.dk`
5. Notér liste-ID'et (vises i URL'en eller i listevisningen) — du skal bruge det som `NEWSLETTER_LIST_ID`

## Trin 2 – Opret kontaktattributter

1. Gå til **Contacts → Settings → Contact attributes**
2. Opret følgende attributter (type i parentes):

| Attributnavn  | Type   |
|---------------|--------|
| `PROVIDER`    | Text   |
| `SERVICES`    | Text   |
| `MODE`        | Text   |
| `SIGNUP_DATE` | Date   |

## Trin 3 – Opret API-nøgle

1. Gå til **Settings → SMTP & API → API Keys**
2. Klik **"Generate a new API key"**
3. Giv nøglen et navn, fx `mineudgifter-worker`
4. Sæt tilladelser: **Transactional emails** + **Contacts**
5. Kopiér nøglen — den vises kun én gang

## Trin 4 – Konfigurér afsenderdomæne

1. Gå til **Settings → Senders & IP → Senders**
2. Klik **"Add a sender"**
3. Tilføj: `tilbud@mineudgifter.dk` (eller `noreply@mineudgifter.dk`)
4. Følg Brevos DNS-vejledning til at tilføje **SPF** og **DKIM** records hos din domæneudbyder
5. Vent på at Brevo bekræfter domænet (kan tage op til 24 timer)

## Trin 5 – Sæt miljøvariabler i Cloudflare Workers

I Cloudflare Workers dashboard under dit Worker → **Settings → Variables**:

| Variabelnavn        | Værdi                        |
|---------------------|------------------------------|
| `BREVO_API_KEY`     | Din API-nøgle fra Trin 3     |
| `NEWSLETTER_LIST_ID`| Liste-ID fra Trin 1 (tal)    |

**VIGTIGT:** Brug **"Encrypt"** på `BREVO_API_KEY` så den aldrig vises i plain text.

## Trin 6 – Deploy Cloudflare Worker

Worker-filen ligger i `/api/send-offer.js`.

```bash
# Installer Wrangler CLI
npm install -g wrangler

# Log ind
wrangler login

# Opret wrangler.toml i projektets rod (se nedenfor)
# Deploy
wrangler deploy api/send-offer.js --name mineudgifter-send-offer
```

### Eksempel på `wrangler.toml`

```toml
name = "mineudgifter-send-offer"
main = "api/send-offer.js"
compatibility_date = "2024-01-01"

[vars]
# Sæt hemmelige variabler via dashboard eller: wrangler secret put BREVO_API_KEY
```

### Opsæt route i Cloudflare

Så `/api/send-offer` på mineudgifter.dk ruter til Worker:

1. Gå til Cloudflare Dashboard → dit domæne → **Workers Routes**
2. Tilføj route: `mineudgifter.dk/api/send-offer` → dit Worker

## Trin 7 – Test

```bash
# Test manuelt med curl
curl -X POST https://mineudgifter.dk/api/send-offer \
  -H "Content-Type: application/json" \
  -H "Origin: https://mineudgifter.dk" \
  -d '{
    "email": "test@example.com",
    "newsletter_optin": false,
    "bundle": {
      "provider_name": "CBB Mobil",
      "provider_logo": "",
      "bundle_name": "CBB MIX 100 GB",
      "data_amount": "100 GB",
      "affiliate_link": "https://on.cbb.dk/t/t?a=1700024858&as=2050148986&t=2&tk=1",
      "normal_price": 399,
      "intro_price": null,
      "intro_months": null,
      "yearly_savings": 2388,
      "monthly_savings": 199
    },
    "services": [
      { "id": "netflix", "name": "Netflix Standard", "icon": "" }
    ],
    "mode": "har",
    "timestamp": "2026-04-09T12:00:00.000Z"
  }'
```

Forventet svar: `{"success":true}`
