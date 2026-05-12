(function () {
  const headerHTML = `
  <header class="top-nav">
    <div class="nav-inner">
      <div class="nav-logo">
        <a href="/">
          <img src="/images/mineudgifter-logo.svg" alt="Mine Udgifter logo" width="120" height="28">
        </a>
      </div>
      <ul class="nav-links">

        <!-- SAMMENLIGN -->
        <li>
          <button class="nav-dropdown-toggle" aria-expanded="false" aria-haspopup="true">
            Sammenlign
            <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          <ul class="dropdown">
            <li>
              <a href="/">
                Mobil + Streaming
                <span class="dd-desc">Find det billigste bundle</span>
              </a>
            </li>
            <li>
              <a href="/mobilabonnement">
                Mobilabonnement
                <span class="dd-desc">Find det billigste abonnement</span>
              </a>
            </li>
            <li>
              <a href="/internetabonnement">
                Internetabonnement
                <span class="dd-desc">Find det billigste bredbånd</span>
              </a>
            </li>
          </ul>
        </li>

        <!-- TJENESTER -->
        <li>
          <button class="nav-dropdown-toggle" aria-expanded="false" aria-haspopup="true">
            Tjenester
            <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          <ul class="dropdown dropdown--wide">
            <li class="dd-category-label">Film & serier</li>
            <li><a href="/netflix">Netflix<span class="dd-desc">Streaming</span></a></li>
            <li><a href="/amazon-prime">Amazon Prime<span class="dd-desc">Streaming</span></a></li>
            <li><a href="/viaplay">Viaplay<span class="dd-desc">Streaming</span></a></li>
            <li><a href="/disneyplus">Disney Plus<span class="dd-desc">Streaming</span></a></li>
            <li><a href="/tv2play">TV2 Play<span class="dd-desc">Streaming</span></a></li>
            <li><a href="/max">Max<span class="dd-desc">Streaming</span></a></li>
            <li><a href="/skyshowtime">Skyshowtime<span class="dd-desc">Streaming</span></a></li>
            <li><a href="/nordisk-film-plus">Nordisk Film+<span class="dd-desc">Dansk</span></a></li>
            <li><a href="/allente">Allente<span class="dd-desc">Sport & TV</span></a></li>
            <li><a href="/apple-tv-plus">Apple TV+<span class="dd-desc">Streaming</span></a></li>
            <li><a href="/britbox">Britbox<span class="dd-desc">Britisk streaming</span></a></li>
            <li class="dd-category-label dd-category-label--second">Musik & lyd</li>
            <li><a href="/spotify">Spotify<span class="dd-desc">Musik</span></a></li>
            <li><a href="/deezer">Deezer<span class="dd-desc">Musik</span></a></li>
            <li><a href="/podimo">Podimo<span class="dd-desc">Podcast & lyd</span></a></li>
            <li><a href="/mofibo">Mofibo<span class="dd-desc">Lydbøger</span></a></li>
            <li><a href="/bookbeat">Bookbeat<span class="dd-desc">Lydbøger</span></a></li>
            <li><a href="/nextory">Nextory<span class="dd-desc">Lydbøger</span></a></li>
            <li><a href="/saxo">Saxo<span class="dd-desc">Lydbøger</span></a></li>
          </ul>
        </li>

        <!-- UDBYDERE -->
        <li>
          <button class="nav-dropdown-toggle" aria-expanded="false" aria-haspopup="true">
            Udbydere
            <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          <ul class="dropdown">
            <li>
              <a href="/udbydere/telmore">
                Telmore
                <span class="dd-desc">Mobil & Streaming</span>
              </a>
            </li>
            <li>
              <a href="/udbydere/cbb">
                CBB
                <span class="dd-desc">Mobil, Streaming & Internet</span>
              </a>
            </li>
            <li>
              <a href="/udbydere/norlys">
                Norlys
                <span class="dd-desc">Mobil, Internet, TV/Streaming & El</span>
              </a>
            </li>
            <li>
              <a href="/udbydere/oister">
                Oister
                <span class="dd-desc">Mobil & Internet</span>
              </a>
            </li>
            <li>
              <a href="/udbydere/callme">
                Call Me
                <span class="dd-desc">Mobil, Internet & Streaming</span>
              </a>
            </li>
            <li>
              <a href="/udbydere/yousee">
                Yousee
                <span class="dd-desc">Mobil, Internet & Streaming</span>
              </a>
            </li>
            <li>
              <a href="/udbydere/telenor">
                Telenor
                <span class="dd-desc">Mobil, Internet & tilbehør</span>
              </a>
            </li>
            <li>
              <a href="/udbydere/3">
                3
                <span class="dd-desc">Mobil, Internet & tilbehør</span>
              </a>
            </li>
             <li>
              <a href="/udbydere/eesy">
                eesy
                <span class="dd-desc">Mobil & Internet</span>
              </a>
            </li>
             <li>
              <a href="/udbydere/flexii">
                Flexii
                <span class="dd-desc">Mobil</span>
              </a>
            </li>
             <li>
              <a href="/udbydere/lebara">
                Lebara
                <span class="dd-desc">Mobil</span>
              </a>
            </li>
             <li>
              <a href="/udbydere/lyca-mobile">
                Lyca Mobile
                <span class="dd-desc">Mobil</span>
              </a>
            </li>
          </ul>
        </li>

        <!-- SPORT -->
        <li>
          <button class="nav-dropdown-toggle" aria-expanded="false" aria-haspopup="true">
            Sport
            <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          <ul class="dropdown">
            <li><a href="/sport/fodbold/">Fodbold<span class="dd-desc">Se fodbold live</span></a></li>
            <li><a href="/sport/haandbold/">Håndbold<span class="dd-desc">Se håndbold live</span></a></li>
            <li><a href="/sport/cykling/">Cykling<span class="dd-desc">Se cykling live</span></a></li>
            <li><a href="/sport/formel-1/">Formel 1<span class="dd-desc">Se Formel 1 live</span></a></li>
            <li><a href="/sport/golf/">Golf<span class="dd-desc">Se golf live</span></a></li>
          </ul>
        </li>

        <!-- GUIDES -->
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
            <li>
              <a href="/guides/mobilabonnement-for-studerende/">
                Mobilabonnement til studerende
                <span class="dd-desc">Studierabatter & billigste priser</span>
              </a>
            </li>
          </ul>
        </li>

        <!-- OM OS -->
        <li>
          <a href="/om-os/" class="nav-plain-link">Om os</a>
        </li>

      </ul>
      <a href="/" class="nav-home-btn">Beregn din pris →</a>
      <button class="burger-btn" id="burgerBtn" aria-label="Åbn menu" aria-expanded="false">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>

    <!-- MOBILMENU -->
    <nav class="mobile-menu" id="mobileMenu" aria-hidden="true">

      <!-- Sammenlign -->
      <button class="mobile-dd-toggle" data-target="mobileSammenlign">
        Sammenlign
        <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      <div class="mobile-sub" id="mobileSammenlign">
  <a href="/">Mobil + Streaming</a>
  <a href="/mobilabonnement">Mobilabonnement</a>
  <a href="/internetabonnement">Internetabonnement</a>
</div>

      <!-- Tjenester -->
      <button class="mobile-dd-toggle" data-target="mobileTjenester">
        Tjenester
        <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      <div class="mobile-sub" id="mobileTjenester">
        <a href="/netflix">Netflix</a>
        <a href="/amazon-prime">Amazon Prime</a>
        <a href="/viaplay">Viaplay</a>
        <a href="/skyshowtime">Skyshowtime</a>
        <a href="/tv2play">TV2 Play</a>
        <a href="/disneyplus">Disney Plus</a>
        <a href="/max">Max</a>
        <a href="/nordisk-film-plus">Nordisk Film Plus</a>
        <a href="/deezer">Deezer</a>
        <a href="/podimo">Podimo</a>
        <a href="/mofibo">Mofibo</a>
        <a href="/bookbeat">Bookbeat</a>
        <a href="/nextory">Nextory</a>
        <a href="/saxo">Saxo</a>
        <a href="/allente">Allente</a>
        <a href="/apple-tv-plus">Apple TV+</a>
        <a href="/britbox">Britbox</a>
        <a href="/spotify">Spotify</a>
      </div>

      <!-- Udbydere -->
      <button class="mobile-dd-toggle" data-target="mobileUdbydere">
        Udbydere
        <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      <div class="mobile-sub" id="mobileUdbydere">
        <a href="/udbydere/telmore">Telmore</a>
        <a href="/udbydere/cbb">CBB</a>
        <a href="/udbydere/norlys">Norlys</a>
        <a href="/udbydere/oister">Oister</a>
        <a href="/udbydere/callme">Call Me</a>
        <a href="/udbydere/yousee">Yousee</a>
        <a href="/udbydere/telenor">Telenor</a>
        <a href="/udbydere/3">3</a>
        <a href="/udbydere/eesy">eesy</a>
        <a href="/udbydere/flexii">Flexii</a>
        <a href="/udbydere/lebara">Lebara</a>
        <a href="/udbydere/lyca-mobile">Lyca Mobile</a>
      </div>

      <!-- Sport -->
      <button class="mobile-dd-toggle" data-target="mobileSport">
        Sport
        <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      <div class="mobile-sub" id="mobileSport">
        <a href="/sport/fodbold/">Fodbold</a>
        <a href="/sport/haandbold/">Håndbold</a>
        <a href="/sport/cykling/">Cykling</a>
        <a href="/sport/formel-1/">Formel 1</a>
        <a href="/sport/golf/">Golf</a>
      </div>

      <!-- Guides -->
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
        <a href="/guides/mobilabonnement-for-studerende/">Mobilabonnement til studerende</a>
      </div>

      <div class="mobile-divider"></div>
      <a href="/om-os/" class="mobile-plain-link">Om os</a>
      <div class="mobile-divider"></div>
      <div class="mobile-cta">
        <a href="/">Tjek din pris</a>
      </div>

    </nav>
  </header>
  `;

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

        // Luk alle andre
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
  }

  function initReadingProgress() {
    const bar = document.getElementById('readingProgressBar');
    if (!bar) return;
    window.addEventListener('scroll', () => {
      const doc = document.documentElement;
      const scrollTop = doc.scrollTop || document.body.scrollTop;
      const scrollHeight = doc.scrollHeight - doc.clientHeight;
      const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      bar.style.width = progress + '%';
    }, { passive: true });
  }

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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectHeader);
  } else {
    injectHeader();
  }
})();