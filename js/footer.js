(function () {
  const footerHTML = `
  <footer class="site-footer">
    <div class="footer-inner">

      <!-- TOP: Brand + Newsletter -->
      <div class="footer-top">

        <div class="footer-brand">
          <a href="/" class="footer-brand-logo">
            <img src="/images/mineudgifter-logo.svg" alt="Mine Udgifter" width="120" height="28">
          </a>
          <p>Vi hjælper dig med at få overblik over dine abonnementer og finde den billigste kombination af streaming og mobil.</p>
          <a class="footer-instagram" href="https://www.instagram.com/mineudgifter" target="_blank" rel="noopener noreferrer">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5.5" ry="5.5"/>
              <circle cx="12" cy="12" r="4.5"/>
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
            </svg>
            Instagram
          </a>
        </div>

        <div class="footer-newsletter-block">
          <h4>Hold dig opdateret</h4>
          <p>Få tilbud, nyheder og guides om streaming og mobil direkte i din indbakke.</p>
          <form class="footer-newsletter-form" id="footerNewsletterForm" novalidate>
            <div class="footer-newsletter-row">
              <input type="email" class="footer-newsletter-input" id="footerNewsletterEmail" placeholder="din@email.dk" autocomplete="email" required>
              <button type="submit" class="footer-newsletter-btn">Tilmeld</button>
            </div>
            <p class="footer-newsletter-status" id="footerNewsletterStatus" aria-live="polite"></p>
          </form>
        </div>

      </div>

      <!-- DIVIDER -->
      <div class="footer-divider"></div>

      <!-- LINKS -->
      <div class="footer-links">

        <div class="footer-col">
          <h4>Sammenlign</h4>
          <ul>
            <li><a href="/">Mobil + Streaming</a></li>
            <li><a href="/mobilabonnement">Mobilabonnement</a></li>
            <li><a href="/internetabonnement">Internetabonnement</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4>Tjenester</h4>
          <ul>
            <li><a href="/netflix">Netflix</a></li>
            <li><a href="/amazon-prime">Amazon Prime</a></li>
            <li><a href="/viaplay">Viaplay</a></li>
            <li><a href="/skyshowtime">Skyshowtime</a></li>
            <li><a href="/tv2play">TV 2 Play</a></li>
            <li><a href="/disneyplus">Disney+</a></li>
            <li><a href="/max">Max</a></li>
            <li><a href="/nordisk-film-plus">Nordisk Film+</a></li>
            <li><a href="/deezer">Deezer</a></li>
            <li><a href="/podimo">Podimo</a></li>
            <li><a href="/mofibo">Mofibo</a></li>
            <li><a href="/bookbeat">Bookbeat</a></li>
            <li><a href="/nextory">Nextory</a></li>
            <li><a href="/saxo">Saxo</a></li>
            <li><a href="/allente">Allente</a></li>
            <li><a href="/apple-tv-plus">Apple TV+</a></li>
            <li><a href="/britbox">Britbox</a></li>
            <li><a href="/spotify">Spotify</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4>Udbydere</h4>
          <ul>
            <li><a href="/udbydere/telmore">Telmore</a></li>
            <li><a href="/udbydere/cbb">CBB</a></li>
            <li><a href="/udbydere/norlys">Norlys</a></li>
            <li><a href="/udbydere/oister">Oister</a></li>
            <li><a href="/udbydere/callme">Call Me</a></li>
            <li><a href="/udbydere/yousee">Yousee</a></li>
            <li><a href="/udbydere/telenor">Telenor</a></li>
            <li><a href="/udbydere/3">3</a></li>
            <li><a href="/udbydere/eesy">eesy</a></li>
            <li><a href="/udbydere/flexii">Flexii</a></li>
            <li><a href="/udbydere/lebara">Lebara</a></li>
            <li><a href="/udbydere/lyca-mobile">Lyca Mobile</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4>Se sport</h4>
          <ul>
            <li><a href="/sport/formel-1/">Formel 1</a></li>
            <li><a href="/sport/golf/">Golf</a></li>
            <li><a href="/sport/fodbold/">Fodbold</a></li>
            <li><a href="/sport/haandbold/">Håndbold</a></li>
            <li><a href="/sport/cykling/">Cykling</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4>Guides</h4>
          <ul>
            <li><a href="/guides/streaming-priser/">Streaming priser i Danmark</a></li>
            <li><a href="/guides/hvorfor-stiger-streaming-priser/">Hvorfor stiger streaming priser?</a></li>
            <li><a href="/guides/mobil-abonnement-med-streaming/">Mobil med streaming inkluderet</a></li>
            <li><a href="/guides/mobilabonnement-for-studerende/">Mobilabonnement til studerende</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4>Information</h4>
          <ul>
            <li><a href="/om-os/">Om os</a></li>
            <li><a href="/legal/privatlivspolitik/">Privatlivspolitik</a></li>
            <li><a href="/legal/ansvarsfraskrivelse/">Ansvarsfraskrivelse</a></li>
            <li><a href="mailto:info@mineudgifter.dk">Kontakt</a></li>
          </ul>
        </div>

      </div>

      <!-- BOTTOM BAR -->
      <div class="footer-bar">
        <p class="footer-disclaimer">
          Priser er vejledende og kan ændre sig. Siden indeholder affiliate-links — vi kan modtage provision ved køb via vores links uden ekstra omkostninger for dig. Mine Udgifter er ikke tilknyttet de omtalte tjenester. Alle logoer tilhører de respektive ejere.
        </p>
        <div class="footer-bar-bottom">
          <ul class="footer-bar-links">
            <li><a href="/">Beregner</a></li>
            <li><a href="/guides/streaming-priser/">Streaming priser</a></li>
            <li><a href="/legal/privatlivspolitik/">Privatlivspolitik</a></li>
            <li><a href="mailto:info@mineudgifter.dk">Kontakt</a></li>
          </ul>
          <p class="footer-meta">© 2026 Mine Udgifter · Lavet i Danmark</p>
        </div>
      </div>

    </div>
  </footer>
  `;

  function injectFooter() {
    if (document.querySelector('.site-footer')) return;
    document.body.insertAdjacentHTML('beforeend', footerHTML);
    initNewsletterForm();
    loadStickyCta();
  }

  function loadStickyCta() {
    if (document.querySelector('script[src="/js/sticky-cta.js"]')) return;
    const s = document.createElement('script');
    s.src = '/js/sticky-cta.js';
    s.defer = true;
    document.head.appendChild(s);
  }

  function initNewsletterForm() {
    const form   = document.getElementById('footerNewsletterForm');
    const input  = document.getElementById('footerNewsletterEmail');
    const status = document.getElementById('footerNewsletterStatus');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = input.value.trim();
      if (!email || !email.includes('@')) {
        status.textContent = 'Indtast en gyldig e-mailadresse.';
        status.className = 'footer-newsletter-status error';
        return;
      }

      const btn = form.querySelector('.footer-newsletter-btn');
      btn.disabled = true;
      btn.textContent = 'Tilmelder…';
      status.textContent = '';
      status.className = 'footer-newsletter-status';

      try {
        const res = await fetch('https://mineudgifter-api.gentle-sun-c47f.workers.dev/newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        if (res.ok) {
          form.innerHTML = '<p class="footer-newsletter-success">✓ Du er tilmeldt – tak!</p>';
        } else {
          throw new Error();
        }
      } catch {
        status.textContent = 'Noget gik galt. Prøv igen.';
        status.className = 'footer-newsletter-status error';
        btn.disabled = false;
        btn.textContent = 'Tilmeld';
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectFooter);
  } else {
    injectFooter();
  }
})();
