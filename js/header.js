/**
 * HEADER.JS – Dynamisk navigation til mineudgifter.dk
 * Placer denne fil i /js/header.js
 * Tilføj én linje i toppen af <body> på hver HTML-side:
 *   <script src="/js/header.js"></script>
 *
 * Vil du ændre menuen? Ret KUN her – alle sider opdateres automatisk.
 */

(function () {
  const headerHTML = `
  <header class="top-nav">
    <div class="nav-inner">
      <div class="nav-logo">
        <a href="/index.html">
          <img src="/images/mineudgifter-logo.svg" alt="Mine Udgifter logo">
        </a>
      </div>
      <ul class="nav-links">
        <li>
          <button class="nav-dropdown-toggle" aria-expanded="false" aria-haspopup="true">
            Tjenester
            <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          <ul class="dropdown">
            <li>
              <a href="/netflix">
                Netflix i Danmark
                <span class="dd-desc">Priser og pakker</span>
              </a>
            </li>
            <li>
              <a href="/amazon-prime">
                Amazon Prime
                <span class="dd-desc">Priser og pakker</span>
              </a>
            </li>
             <li>
              <a href="/deezer">
                Deezer
                <span class="dd-desc">Priser og pakker</span>
              </a>
            </li>
          </ul>
        </li>
        <li>
          <button class="nav-dropdown-toggle" aria-expanded="false" aria-haspopup="true">
            Guides
            <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          <ul class="dropdown">
            <li>
              <a href="/guides/streaming-priser/">
                Streaming priser i Danmark
                <span class="dd-desc">Oversigt over alle priser</span>
              </a>
            </li>
            <li>
              <a href="/guides/hvorfor-stiger-streaming-priser/">
                Hvorfor stiger streaming priser?
                <span class="dd-desc">Forklaring og baggrund</span>
              </a>
            </li>
          </ul>
        </li>
      </ul>
      <a href="/" class="cta-primary">
        Tjek din pris <span class="arrow">→</span>
      </a>
      <button class="burger-btn" id="burgerBtn" aria-label="Åbn menu" aria-expanded="false">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>
    <nav class="mobile-menu" id="mobileMenu" aria-hidden="true">
      <button class="mobile-dd-toggle" data-target="mobileTjenester">
        Tjenester
        <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      <div class="mobile-sub" id="mobileTjenester">
        <a href="/netflix">Netflix i Danmark</a>
        <a href="/amazon-prime">Amazon Prime</a>
        <a href="/deezer">Deezer</a>
      </div>
      <button class="mobile-dd-toggle" data-target="mobileGuides">
        Guides
        <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      <div class="mobile-sub" id="mobileGuides">
        <a href="/guides/streaming-priser/">Streaming priser i Danmark</a>
        <a href="/guides/hvorfor-stiger-streaming-priser/">Hvorfor stiger streaming priser?</a>
      </div>
      <div class="mobile-divider"></div>
      <div class="mobile-cta">
        <a href="/index.html">Tjek din pris</a>
      </div>
    </nav>
  </header>
  `;

  function injectHeader() {
    // Undgå dobbelt-injektion
    if (document.querySelector('.top-nav')) return;

    // Indsæt header øverst i <body>
    document.body.insertAdjacentHTML('afterbegin', headerHTML);

    // Kør menu-logik efter header er injektet
    initMenu();

    // Kør læseprogress-bar efter header er injektet
    initReadingProgress();
  }

  function initMenu() {
    // ---- DESKTOP DROPDOWNS ----
    document.querySelectorAll(".nav-links > li").forEach((li) => {
      let closeTimer;
      li.addEventListener("mouseenter", () => {
        clearTimeout(closeTimer);
        document.querySelectorAll(".nav-links > li").forEach((other) => {
          if (other !== li) other.classList.remove("open");
        });
        li.classList.add("open");
      });
      li.addEventListener("mouseleave", () => {
        closeTimer = setTimeout(() => {
          li.classList.remove("open");
        }, 120);
      });
    });

    // Luk desktop dropdowns ved klik udenfor
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".nav-links")) {
        document.querySelectorAll(".nav-links > li").forEach((li) =>
          li.classList.remove("open")
        );
      }
    });

    // ---- BURGER MENU ----
    const burger = document.getElementById("burgerBtn");
    const mobileMenu = document.getElementById("mobileMenu");

    if (burger && mobileMenu) {
      burger.addEventListener("click", (e) => {
        e.stopPropagation();
        burger.classList.toggle("active");
        mobileMenu.classList.toggle("active");
      });

      document.addEventListener("click", (e) => {
        if (!burger.contains(e.target) && !mobileMenu.contains(e.target)) {
          burger.classList.remove("active");
          mobileMenu.classList.remove("active");
        }
      });
    }

    // ---- MOBIL SUB-MENUS ----
    document.querySelectorAll(".mobile-dd-toggle").forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetId = btn.dataset.target;
        const sub = document.getElementById(targetId);
        btn.classList.toggle("open");
        if (sub) sub.classList.toggle("open");
      });
    });

    // ---- ACCORDION ----
    document.querySelectorAll('.extra-info details').forEach(detail => {
      detail.addEventListener('click', () => {
        if (detail.open) return;
        const parent = detail.closest('.extra-info');
        if (!parent) return;
        parent.querySelectorAll('details').forEach(other => {
          if (other !== detail) other.open = false;
        });
      });
    });
  }

  function initReadingProgress() {
    // Sider uden progress bar
    const excluded = [
      '/',
      '/index.html',
      '/legal/privatlivspolitik',
      '/legal/privatlivspolitik/',
      '/legal/ansvarsfraskrivelse',
      '/legal/ansvarsfraskrivelse/'
    ];

    const path = window.location.pathname.replace(/\/$/, '') || '/';
    const isExcluded = excluded.some(p => (p.replace(/\/$/, '') || '/') === path);
    if (isExcluded) return;
    if (document.getElementById('reading-progress')) return;

    // Indsæt style
    const style = document.createElement('style');
    style.textContent = '#reading-progress{position:fixed;top:0;left:0;width:0%;height:3px;background:linear-gradient(90deg,#2B3EFF,#6B7FFF);z-index:9999;transition:width 0.1s linear;border-radius:0 2px 2px 0;}';
    document.head.appendChild(style);

    // Indsæt bar
    const bar = document.createElement('div');
    bar.id = 'reading-progress';
    document.body.insertAdjacentElement('afterbegin', bar);

    // Scroll-lytter der virker på alle mobile browsere
    window.addEventListener('scroll', function () {
      const scrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
      const viewHeight = (window.visualViewport ? window.visualViewport.height : window.innerHeight) || window.innerHeight;
      const docHeight = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight
      ) - viewHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = Math.min(pct, 100) + '%';
    }, { passive: true });
  }

  // Kør når DOM er klar
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectHeader);
  } else {
    injectHeader();
  }

})();