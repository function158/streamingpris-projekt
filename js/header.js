var script = document.createElement('script');
script.src = '/js/cookie-consent.js';
document.head.appendChild(script);

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
                Netflix
                <span class="dd-desc">Streaming</span>
              </a>
            </li>
            <li>
              <a href="/amazon-prime">
                Amazon Prime
                <span class="dd-desc">Streaming</span>
              </a>
            </li>
             <li>
              <a href="/deezer">
                Deezer
                <span class="dd-desc">Musik</span>
              </a>
            </li>
               <li>
              <a href="/viaplay">
                Viaplay
                <span class="dd-desc">Streaming</span>
              </a>
            </li>
               <li>
              <a href="/skyshowtime">
                Skyshowtime
                <span class="dd-desc">Streaming</span>
              </a>
            </li>
                <li>
              <a href="/tv2play">
                TV2 Play
                <span class="dd-desc">Streaming</span>
              </a>
            </li>
               <li>
              <a href="/disneyplus">
                Disney Plus
                <span class="dd-desc">Streaming</span>
              </a>
            </li>
            <li>
              <a href="/max">
                Max
                <span class="dd-desc">Streaming</span>
              </a>
            </li>
             <li>
              <a href="/podimo">
                Podimo
                <span class="dd-desc">Podcast & Lydbøger</span>
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
            <li>
              <a href="/guides/mobil-abonnement-med-streaming/">
                Mobil abonnement med streaming
                <span class="dd-desc">Pakker og priser</span>
              </a>
            </li>
          </ul>
        </li>
        <li>
          <a href="/om-os/" class="nav-plain-link">Om os</a>
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
        <a href="/viaplay">Viaplay</a>
        <a href="/skyshowtime">Skyshowtime</a>
        <a href="/tv2play">TV2 Play</a>
        <a href="/disneyplus">Disney Plus</a>
        <a href="/max">Max</a>
        <a href="/podimo">Podimo</a>
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
        <a href="/guides/mobil-abonnement-med-streaming/">Mobil abonnement med streaming</a>
      </div>
      <div class="mobile-divider"></div>
      <a href="/om-os/" class="mobile-plain-link">Om os</a>
      <div class="mobile-divider"></div>
      <div class="mobile-cta">
        <a href="/index.html">Tjek din pris</a>
      </div>
    </nav>
  </header>
  `;

  function injectHeader() {
    if (document.querySelector('.top-nav')) return;
    document.body.insertAdjacentHTML('afterbegin', headerHTML);
    initMenu();

    var lastScrollY = window.scrollY;
    var ticking = false;
    window.addEventListener('scroll', function() {
      if (!ticking) {
        window.requestAnimationFrame(function() {
          var nav = document.querySelector('.top-nav');
          if (nav) {
            var currentScrollY = window.scrollY;
            var diff = currentScrollY - lastScrollY;
            if (diff < -3) {
              nav.classList.remove('hidden');
            } else if (diff > 3 && currentScrollY > 60) {
              nav.classList.add('hidden');
            }
            lastScrollY = currentScrollY;
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

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
        const isOpen = btn.classList.contains("open");

        document.querySelectorAll(".mobile-dd-toggle").forEach((other) => {
          if (other !== btn) {
            other.classList.remove("open");
            const otherId = other.dataset.target;
            const otherSub = document.getElementById(otherId);
            if (otherSub) otherSub.classList.remove("open");
          }
        });

        btn.classList.toggle("open", !isOpen);
        if (sub) sub.classList.toggle("open", !isOpen);
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

    const style = document.createElement('style');
    style.textContent = '#reading-progress{position:fixed;top:0;left:0;width:0%;height:3px;background:linear-gradient(90deg,#2B3EFF,#6B7FFF);z-index:9999;transition:width 0.1s linear;border-radius:0 2px 2px 0;}';
    document.head.appendChild(style);

    const bar = document.createElement('div');
    bar.id = 'reading-progress';
    document.body.insertAdjacentElement('afterbegin', bar);

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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectHeader);
  } else {
    injectHeader();
  }

})();