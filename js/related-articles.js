/**
 * RELATED-ARTICLES.JS – "Andre læser også"
 * Tag-baseret matching: viser de mest relevante artikler for siden man er på.
 * Skalerer til 200+ artikler uden problemer.
 *
 * Placer i /js/related-articles.js
 * Tilføj på artikelsider: <script defer src="/js/related-articles.js"></script>
 *
 * For at systemet ved hvilken artikel der vises, tilføj dette meta-tag i <head>:
 *   <meta name="article-tags" content="netflix,streaming,pris">
 *
 * Tilføj nye artikler i ARTICLES-arrayet efterhånden som du opretter dem.
 */

(function () {

    // ============================================================
    // ARTIKELREGISTER – tilføj nye artikler her
    // tags: brug små bogstaver, ingen mellemrum
    // ============================================================
    const ARTICLES = [
      {
        url: '/netflix',
        title: 'Netflix i Danmark',
        desc: 'Priser, pakker og hvad abonnementet inkluderer i 2026.',
        emoji: '🎬',
        tags: ['netflix', 'streaming', 'pris', 'film', 'serier', 'abonnement']
      },
      {
        url: '/amazon-prime',
        title: 'Amazon Prime i Danmark',
        desc: 'Alt om pris, indhold og om det er pengene værd.',
        emoji: '📦',
        tags: ['amazon', 'streaming', 'pris', 'film', 'serier', 'abonnement', 'levering']
      },
      {
        url: '/deezer',
        title: 'Deezer i Danmark',
        desc: 'Musikstreaming – priser og sammenligning med Spotify.',
        emoji: '🎵',
        tags: ['deezer', 'musik', 'streaming', 'pris', 'abonnement', 'lyd']
      },
      {
        url: '/guides/streaming-priser/',
        title: 'Streaming priser i Danmark',
        desc: 'Samlet oversigt over alle populære streamingtjenesterne.',
        emoji: '📊',
        tags: ['streaming', 'pris', 'oversigt', 'sammenligning', 'netflix', 'viaplay', 'disney']
      },
      {
        url: '/guides/hvorfor-stiger-streaming-priser/',
        title: 'Hvorfor stiger streaming priser?',
        desc: 'Forklaring på prisudviklingen hos Netflix, Viaplay og andre.',
        emoji: '📈',
        tags: ['streaming', 'pris', 'prisstigning', 'netflix', 'viaplay', 'økonomi']
      },
    ];
  
    const SHOW_COUNT = 3;
  
    // ============================================================
    // HJÆLPEFUNKTIONER
    // ============================================================
  
    function getCurrentPath() {
      return window.location.pathname.replace(/\/$/, '') || '/';
    }
  
    // Hent tags fra meta-tagget på siden: <meta name="article-tags" content="netflix,pris">
    function getPageTags() {
      const meta = document.querySelector('meta[name="article-tags"]');
      if (!meta) return [];
      return meta.getAttribute('content').split(',').map(t => t.trim().toLowerCase());
    }
  
    // Score: antal fælles tags. Højere = mere relevant
    function score(article, pageTags) {
      if (pageTags.length === 0) return Math.random(); // ingen tags → tilfældig rækkefølge
      return article.tags.filter(t => pageTags.includes(t)).length;
    }
  
    function shuffle(arr) {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }
  
    function getRelated(pageTags) {
      const current = getCurrentPath();
  
      // Fjern aktuel side
      const candidates = ARTICLES.filter(a => a.url.replace(/\/$/, '') !== current);
  
      // Gruppér efter score
      const groups = {};
      candidates.forEach(a => {
        const s = score(a, pageTags);
        if (!groups[s]) groups[s] = [];
        groups[s].push(a);
      });
  
      // Sorter grupper høj → lav, shuffle inden for hver gruppe
      const sorted = Object.keys(groups)
        .map(Number)
        .sort((a, b) => b - a)
        .flatMap(s => shuffle(groups[s]));
  
      return sorted.slice(0, SHOW_COUNT);
    }
  
    // ============================================================
    // RENDER
    // ============================================================
  
    function render() {
      if (document.getElementById('related-articles')) return;
  
      const pageTags = getPageTags();
      const articles = getRelated(pageTags);
      if (articles.length === 0) return;
  
      const cards = articles.map(a => `
        <a href="${a.url}" class="related-card">
          <span class="related-emoji">${a.emoji}</span>
          <span class="related-text">
            <strong>${a.title}</strong>
            <span>${a.desc}</span>
          </span>
          <svg class="related-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </a>
      `).join('');
  
      const section = document.createElement('section');
      section.id = 'related-articles';
      section.innerHTML = `
        <h2 class="related-title">Andre læser også</h2>
        <div class="related-grid">${cards}</div>
      `;
  
      const footer = document.querySelector('.site-footer');
      if (footer) {
        footer.parentNode.insertBefore(section, footer);
      } else {
        document.body.appendChild(section);
      }
    }
  
    // ============================================================
    // STYLE
    // ============================================================
  
    const style = document.createElement('style');
    style.textContent = `
      #related-articles {
        max-width: 740px;
        margin: 48px auto 0;
        padding: 0 20px;
      }
      .related-title {
        font-size: 15px;
        font-weight: 700;
        color: #9ca3af;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        margin: 0 0 16px;
      }
      .related-grid {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .related-card {
        display: flex;
        align-items: center;
        gap: 14px;
        background: #fff;
        border: 1.5px solid #e5e7eb;
        border-radius: 14px;
        padding: 14px 16px;
        text-decoration: none;
        color: inherit;
        transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s;
      }
      .related-card:hover {
        border-color: #2B3EFF;
        box-shadow: 0 4px 16px rgba(43,62,255,0.08);
        transform: translateY(-1px);
      }
      .related-emoji {
        font-size: 22px;
        flex-shrink: 0;
        width: 36px;
        text-align: center;
      }
      .related-text {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .related-text strong {
        font-size: 14px;
        font-weight: 700;
        color: #111;
      }
      .related-text span {
        font-size: 13px;
        color: #6b7280;
        line-height: 1.4;
      }
      .related-arrow {
        width: 18px;
        height: 18px;
        color: #9ca3af;
        flex-shrink: 0;
        transition: color 0.15s, transform 0.15s;
      }
      .related-card:hover .related-arrow {
        color: #2B3EFF;
        transform: translateX(2px);
      }
      @media (max-width: 600px) {
        #related-articles {
          padding: 0 16px;
          margin-top: 36px;
        }
      }
    `;
    document.head.appendChild(style);
  
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', render);
    } else {
      render();
    }
  
  })();