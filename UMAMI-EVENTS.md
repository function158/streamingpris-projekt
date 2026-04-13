# Umami Events – mineudgifter.dk

Filen `js/umami-events.js` tilføjer præcis tracking til alle sider via Umami Analytics. En typisk sidevisning genererer 3–6 events — ikke 15–20.

## Script-tag

Tilføjet automatisk til alle sider efter `cookie-consent.js`:

```html
<script defer src="/js/umami-events.js"></script>
```

---

## Komplet event-oversigt

| Event          | Hvornår                                                         | Data                                    |
|----------------|-----------------------------------------------------------------|-----------------------------------------|
| `scroll-25`    | Bruger scroller til 25 % af siden                              | `{ path }`                              |
| `scroll-50`    | Bruger scroller til 50 %                                        | `{ path }`                              |
| `scroll-75`    | Bruger scroller til 75 %                                        | `{ path }`                              |
| `scroll-100`   | Bruger når bunden                                               | `{ path }`                              |
| `click-tilbud` | Klik på eksternt link (affiliate/tilbud til udbyder)            | `{ text, href, path }`                  |
| `click-intern` | Klik på intern navigation (link til anden side på sitet)        | `{ text, href, path }`                  |
| `click-knap`   | Klik på `<button>` eller `role="button"`-element               | `{ text, path }`                        |
| `exit-scroll`  | Højeste scroll % bruger nåede (sendt ved forlad side)          | `{ pct, path }` — afrundet til 5%       |

**Intet andet trackes.** Ingen section-visible støj. Ingen engagement-tid (Umami tracker det selv som Visit Duration).

---

## Sådan opretter du Goals i Umami

### Goal 1: Tilbuds-klik
Succeskriterium: besøgende klikker på mindst ét affiliate-link.

1. Gå til **Umami → dit website → Goals**
2. Klik **Add goal**
3. Udfyld:
   - **Name:** Tilbuds-klik
   - **Event name:** `click-tilbud`
4. Klik **Save**

Du kan nu se konverteringsrate i Umami's Goals-sektion: "X% af besøgende klikkede på et tilbud".

---

### Goal 2: Engagement (scroll-dybde)
Succeskriterium: besøgende læser 75 % af indholdet.

1. Gå til **Umami → dit website → Goals**
2. Klik **Add goal**
3. Udfyld:
   - **Name:** Engagement (scroll 75%)
   - **Event name:** `scroll-75`
4. Klik **Save**

---

## Konkrete indsigter du kan handle på

### "Hvilke sider konverterer til tilbuds-klik?"

**I Umami:** Events → `click-tilbud` → filtrer på `path`

```
/netflix/       → 18% af besøgende klikkede på tilbud
/viaplay/       → 7% af besøgende klikkede på tilbud
/amazon-prime/  → 3% af besøgende klikkede på tilbud
```

**Handling:** Viaplay og Amazon Prime har lav CTR. Er CTA-knappen tydelig nok? Er prisen den rigtige? Sammenlign med Netflix-siden der konverterer bedre.

---

### "Læser folk indholdet på guide-siderne?"

**I Umami:** Events → `scroll-75` → filtrer på `path = /guides/mobilabonnement-for-studerende/`

Hvis `scroll-75` er lav (under 30 % af sidevisninger) men `scroll-25` er høj, falder folk fra midt på siden. Kig på om der er et naturligt stoppunkt — en lang tabel, for meget tekst uden overskrifter, eller en CTA-knap der distraherer.

---

### "Hvad navigerer folk til fra forsiden?"

**I Umami:** Events → `click-intern` → filtrer på `path = /`

`href`-feltet viser præcis hvilke undersider folk klikker sig videre til. Hvis mange klikker på `/netflix/` men få på `/skyshowtime/`, spejler det brugerinteressen og kan guide hvilke sider du prioriterer at forbedre.

---

### "Kom de overhovedet i gang med at scrolle?"

Sammenlign `scroll-25` med totale pageviews for en side:

```
/guides/streaming-priser/ → 1.200 pageviews, scroll-25: 340 events (28%)
```

72 % scroller ikke engang til 25 %. Det tyder på at titlen/introen ikke matcher søgeintentionen — folk bouncer hurtigt. Prøv at rewrite H1 og første afsnit.

---

## Filtrér events per side i Umami

1. Gå til **Events** i Umami-dashboardet
2. Klik på et event (fx `click-tilbud`)
3. Klik **Properties** → se `path`-fordelingen
4. Brug **Filter** øverst til at filtrere på et bestemt `path`-felt for at se kun data fra én side

Alternativt: Gå til **Pages** → vælg en side → se hvilke events der fyrer på netop den side.
