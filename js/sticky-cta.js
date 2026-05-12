/**
 * sticky-cta.js
 * Viser en diskret sticky CTA i bunden af siden.
 * Desktop: kortboks nede til højre. Mobil: fuld-bredde bjælke i bunden.
 * Lukkes med × og huskes i sessionStorage.
 */
(function () {

  // ── Konfiguration per side ──────────────────────────────────────────────────
  const CTA_MAP = [
    {
      match: '/sport/formel-1/',
      type: 'partner',
      eyebrow: 'Officiel partner',
      name: 'Allente',
      logo: '/images/allente-logo.svg',
      text: 'Alle F1-løb, kvalifikationer og træninger – kom i gang på 5 minutter.',
      url: 'https://www.allente.dk/?at_gd=F79ED0B476387593B26D73C81EDCFE735A2AB5B9',
      cta: 'Kom i gang med Allente',
      sponsored: true,
    },
    {
      match: '/sport/golf/',
      type: 'partner',
      eyebrow: 'Officiel partner',
      name: 'Allente',
      logo: '/images/allente-logo.svg',
      text: 'Alle 4 golfmajors og DP World Tour samlet i én fleksibel pakke.',
      url: 'https://www.allente.dk/?at_gd=F79ED0B476387593B26D73C81EDCFE735A2AB5B9',
      cta: 'Kom i gang med Allente',
      sponsored: true,
    },
    {
      match: '/allente/',
      type: 'partner',
      eyebrow: 'Officiel partner',
      name: 'Allente',
      logo: '/images/allente-logo.svg',
      text: 'Fleksibel tv-pakke med sport, film og serier – uden binding.',
      url: 'https://www.allente.dk/?at_gd=F79ED0B476387593B26D73C81EDCFE735A2AB5B9',
      cta: 'Kom i gang med Allente',
      sponsored: true,
    },
    {
      match: '/netflix/',
      type: 'save',
      text: 'Spar på Netflix',
      sub: 'Se om du kan få Netflix billigere via et mobilabonnement.',
      url: '/',
      cta: 'Beregn din pris gratis',
    },
    {
      match: '/viaplay/',
      type: 'save',
      text: 'Spar på Viaplay',
      sub: 'Sammenlign mobilabonnementer med Viaplay inkluderet.',
      url: '/',
      cta: 'Beregn din pris gratis',
    },
    {
      match: '/amazon-prime/',
      type: 'save',
      text: 'Spar på Amazon Prime',
      sub: 'Find mobilabonnementer med Prime Video inkluderet.',
      url: '/',
      cta: 'Beregn din pris gratis',
    },
    {
      match: '/disneyplus/',
      type: 'save',
      text: 'Spar på Disney+',
      sub: 'Tjek om du kan spare via et mobilabonnement med Disney+ inkluderet.',
      url: '/',
      cta: 'Beregn din pris gratis',
    },
    {
      match: '/tv2play/',
      type: 'save',
      text: 'Spar på TV 2 Play',
      sub: 'Se om du kan få TV 2 Play billigere via mobilabonnement.',
      url: '/',
      cta: 'Beregn din pris gratis',
    },
    {
      match: '/skyshowtime/',
      type: 'save',
      text: 'Spar på SkyShowtime',
      sub: 'Find ud af om SkyShowtime er billigst via et mobilabonnement.',
      url: '/',
      cta: 'Beregn din pris gratis',
    },
    {
      match: '/max/',
      type: 'save',
      text: 'Spar på Max',
      sub: 'Se om du kan få Max inkluderet i dit mobilabonnement.',
      url: '/',
      cta: 'Beregn din pris gratis',
    },
  ];

  // Standard fallback til alle andre artikel-sider
  const DEFAULT_CTA = {
    type: 'save',
    text: 'Spar på dine abonnementer',
    sub: 'Beregn om du betaler for meget for streaming og mobil.',
    url: '/',
    cta: 'Beregn gratis',
  };

  // ── Find config til denne side ──────────────────────────────────────────────
  const path = window.location.pathname;

  // Kør ikke på forsiden eller mobilabonnement-beregneren
  if (path === '/' || path === '/index.html' || path.startsWith('/mobilabonnement') || path.startsWith('/internetabonnement')) return;

  const config = CTA_MAP.find(c => path.startsWith(c.match)) || DEFAULT_CTA;

  // Kør ikke igen i samme session hvis brugeren lukkede den
  const storageKey = 'sticky_cta_closed_' + (config.match || 'default');
  if (sessionStorage.getItem(storageKey)) return;

  // ── CSS ─────────────────────────────────────────────────────────────────────
  const css = `
    #sticky-cta {
      position: fixed;
      bottom: 28px;
      right: 24px;
      width: 320px;
      background: #fff;
      border-radius: 18px;
      box-shadow: 0 12px 40px rgba(0,0,0,0.16), 0 3px 10px rgba(0,0,0,0.08);
      z-index: 9999;
      font-family: Inter, Arial, sans-serif;
      overflow: hidden;
      transform: translateY(calc(100% + 40px));
      opacity: 0;
      transition: transform 0.45s cubic-bezier(.22,.68,0,1.15), opacity 0.35s ease;
    }
    #sticky-cta.visible {
      transform: translateY(0);
      opacity: 1;
    }
    #sticky-cta.hiding {
      transform: translateY(calc(100% + 40px));
      opacity: 0;
    }

    /* ── Close button ── */
    .scta-close {
      position: absolute;
      top: 10px;
      right: 12px;
      background: rgba(255,255,255,0.18);
      border: none;
      cursor: pointer;
      color: rgba(255,255,255,0.8);
      font-size: 16px;
      line-height: 1;
      width: 26px;
      height: 26px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s, color 0.15s;
      z-index: 1;
    }
    .scta-close:hover {
      background: rgba(255,255,255,0.3);
      color: #fff;
    }
    .scta-close-dark {
      background: rgba(0,0,0,0.06);
      color: #6b7280;
    }
    .scta-close-dark:hover {
      background: rgba(0,0,0,0.1);
      color: #374151;
    }

    /* ── Partner type ── */
    .scta-header {
      background: linear-gradient(135deg, #0f3a6b 0%, #1A4F8B 100%);
      padding: 20px 20px 18px;
      position: relative;
    }
    .scta-eyebrow {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: rgba(255,255,255,0.6);
      margin: 0 0 10px;
    }
    .scta-logo {
      height: 30px;
      width: auto;
      display: block;
      filter: brightness(0) invert(1);
    }
    .scta-body {
      padding: 16px 20px 20px;
    }
    .scta-text-partner {
      font-size: 13px;
      color: #4b5563;
      line-height: 1.55;
      margin: 0 0 16px;
    }

    /* ── Save type ── */
    .scta-save-header {
      background: linear-gradient(135deg, #1A4F8B 0%, #2563a8 100%);
      padding: 18px 20px 16px;
      position: relative;
    }
    .scta-save-title {
      font-size: 16px;
      font-weight: 700;
      color: #fff;
      margin: 0;
      line-height: 1.3;
      padding-right: 30px;
    }
    .scta-save-body {
      padding: 14px 20px 18px;
    }
    .scta-save-sub {
      font-size: 13px;
      color: #4b5563;
      line-height: 1.55;
      margin: 0 0 16px;
    }

    /* ── Button ── */
    .scta-btn {
      display: block;
      background: #1A4F8B;
      color: #fff !important;
      text-decoration: none;
      padding: 11px 20px;
      border-radius: 10px;
      font-size: 13.5px;
      font-weight: 600;
      text-align: center;
      transition: background 0.15s, transform 0.1s;
      letter-spacing: -0.1px;
    }
    .scta-btn:hover {
      background: #0f3a6b;
      transform: translateY(-1px);
    }
    .scta-btn-save {
      background: #fff;
      color: #1A4F8B !important;
      border: 2px solid rgba(255,255,255,0.3);
    }
    .scta-btn-save:hover {
      background: rgba(255,255,255,0.92);
      transform: translateY(-1px);
    }
    .scta-sponsored {
      font-size: 10px;
      color: #c4c9d4;
      margin: 10px 0 0;
      text-align: center;
    }

    /* ── Mobile ── */
    @media (max-width: 600px) {
      #sticky-cta {
        bottom: 0;
        right: 0;
        left: 0;
        width: auto;
        border-radius: 20px 20px 0 0;
        box-shadow: 0 -6px 30px rgba(0,0,0,0.13);
        transform: translateY(100%);
      }
      .scta-header,
      .scta-save-header {
        padding: 16px 20px 14px;
      }
      .scta-body,
      .scta-save-body {
        padding: 14px 20px 24px;
      }
    }
  `;

  // ── Byg HTML ─────────────────────────────────────────────────────────────────
  function buildHTML(c) {
    if (c.type === 'partner') {
      const logoEl = c.logo
        ? `<img src="${c.logo}" alt="${c.name}" class="scta-logo">`
        : `<span style="font-size:18px;font-weight:700;color:#fff;">${c.name}</span>`;
      return `
        <div class="scta-header">
          <button class="scta-close" aria-label="Luk">×</button>
          <p class="scta-eyebrow">${c.eyebrow}</p>
          ${logoEl}
        </div>
        <div class="scta-body">
          <p class="scta-text-partner">${c.text}</p>
          <a href="${c.url}" target="_blank" rel="sponsored noopener" class="scta-btn">${c.cta} →</a>
          ${c.sponsored ? '<p class="scta-sponsored">Reklamelink</p>' : ''}
        </div>
      `;
    } else {
      return `
        <div class="scta-save-header">
          <button class="scta-close" aria-label="Luk">×</button>
          <p class="scta-save-title">${c.text}</p>
        </div>
        <div class="scta-save-body">
          <p class="scta-save-sub">${c.sub}</p>
          <a href="${c.url}" class="scta-btn">${c.cta} →</a>
        </div>
      `;
    }
  }

  // ── Init ─────────────────────────────────────────────────────────────────────
  function init() {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    const el = document.createElement('div');
    el.id = 'sticky-cta';
    el.innerHTML = buildHTML(config);
    document.body.appendChild(el);

    el.querySelector('.scta-close').addEventListener('click', function () {
      el.classList.add('hiding');
      sessionStorage.setItem(storageKey, '1');
      setTimeout(() => el.remove(), 450);
    });

    setTimeout(() => el.classList.add('visible'), 8000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
