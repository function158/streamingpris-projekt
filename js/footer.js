(function () {
  const footerHTML = `
  <footer class="site-footer">

    <div class="footer-grid">

      <div class="footer-col">
        <h4>Om os</h4>
        <p>Mine Udgifter hjælper dig med at få overblik over dine streaming og digitale abonnementer og viser, om du kan spare penge ved at samle det med mobilabonnementer.</p>
      </div>

      <div class="footer-col">
        <h4>Tjenester</h4>
        <ul>
          <li><a href="/netflix">Netflix</a></li>
          <li><a href="/amazon-prime">Amazon Prime</a></li>
          <li><a href="/deezer">Deezer</a></li>
          <li><a href="/viaplay">Viaplay</a></li>
          <li><a href="/skyshowtime">Skyshowtime</a></li>
          <li><a href="/tv2play">TV2 Play</a></li>
          <li><a href="/disneyplus">Disney Plus</a></li>
          <li><a href="/max">Max</a></li>
          <li><a href="/podimo">Podimo</a></li>
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
        </ul>
      </div>

      <div class="footer-col">
        <h4>Hurtige links</h4>
        <ul>
          <li><a href="/">Beregn dine streamingudgifter</a></li>
          <li><a href="/guides/hvorfor-stiger-streaming-priser/">Hvorfor stiger streaming priser?</a></li>
          <li><a href="/guides/streaming-priser/">Streaming priser i Danmark</a></li>
          <li><a href="/guides/mobil-abonnement-med-streaming/">Mobil abonnement med streaming</a></li>
          <li><a href="mailto:info@mineudgifter.dk">Kontakt</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h4>Information</h4>
        <ul>
        <li><a href="/om-os/">Om os</a></li>
          <li><a href="/legal/privatlivspolitik/">Privatlivspolitik</a></li>
          <li><a href="/legal/ansvarsfraskrivelse/">Ansvarsfraskrivelse</a></li>
        </ul>
      </div>

    </div>

    <div class="footer-bottom">

      <div class="footer-logo">
        <a href="/">
          <img src="/images/mineudgifter-logo.svg" alt="Mine Udgifter logo">
        </a>
      </div>

      <ul class="footer-bottom-links">
        <li><a href="/">Beregner</a></li>
        <li><a href="/guides/streaming-priser/">Streaming priser</a></li>
        <li><a href="/legal/privatlivspolitik/">Privatlivspolitik</a></li>
        <li><a href="/legal/ansvarsfraskrivelse/">Ansvarsfraskrivelse</a></li>
        <li><a href="mailto:info@mineudgifter.dk">Kontakt</a></li>
      </ul>

      <a class="footer-instagram" href="https://www.instagram.com/mineudgifter" target="_blank" rel="noopener noreferrer" aria-label="Følg os på Instagram">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5.5" ry="5.5"/>
          <circle cx="12" cy="12" r="4.5"/>
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
        </svg>
        Følg os på Instagram
      </a>

   <p class="footer-disclaimer">
Priser er vejledende og kan ændre sig. Beregningen er udelukkende informativ.
<br>
Siden indeholder affiliate-links. Vi kan modtage provision ved køb via vores links.
Dette påvirker ikke din pris eller sorteringen af tilbud.
</p>
      <p class="footer-disclaimer footer-legal">
        Mine Udgifter er ikke tilknyttet, samarbejder ikke med og er ikke sponsoreret af de streamingtjenester, der omtales på siden. Alle logoer og varemærker tilhører de respektive ejere og anvendes udelukkende til identifikationsformål.
      </p>

      <p class="footer-meta">© 2026 Mine Udgifter · Alle rettigheder forbeholdes · Lavet i Danmark 🇩🇰</p>

    </div>
  </footer>
  `;

  function injectFooter() {
    if (document.querySelector('.site-footer')) return;
    document.body.insertAdjacentHTML('beforeend', footerHTML);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectFooter);
  } else {
    injectFooter();
  }
})();