/**
 * FOOTER.JS – Dynamisk footer til mineudgifter.dk
 * Placer denne fil i /js/footer.js
 * Tilføj én linje i bunden af hver HTML-side (før </body>):
 *   <script src="/js/footer.js"></script>
 *
 * Vil du ændre footeren? Ret KUN her – alle sider opdateres automatisk.
 */

(function () {
    const footerHTML = `
    <footer class="site-footer">
      <div class="footer-grid">
  
        <!-- OM OS -->
        <div class="footer-col">
          <h4>Om os</h4>
          <p>
            Mine Udgifter hjælper dig med at få overblik over dine
            streaming- og digitale abonnementer, så du nemt kan se,
            hvad du samlet betaler.
          </p>
        </div>
  
        <!-- TJENESTER -->
        <div class="footer-col">
          <h4>Tjenester</h4>
          <ul>
            <li><a href="/netflix">Netflix i Danmark</a></li>
            <li><a href="/amazon-prime">Amazon Prime i Danmark</a></li>
            <li><a href="/deezer">Deezer i Danmark</a></li>
          </ul>
        </div>
  
        <!-- HURTIGE LINKS -->
        <div class="footer-col">
          <h4>Hurtige links</h4>
          <ul>
            <li><a href="/">Beregn dine streamingudgifter</a></li>
            <li><a href="/guides/hvorfor-stiger-streaming-priser/">Hvorfor stiger streaming priser?</a></li>
            <li><a href="/guides/streaming-priser/">Streaming priser i Danmark</a></li>
            <li><a href="mailto:info@mineudgifter.dk">Kontakt</a></li>
          </ul>
        </div>
  
        <!-- INFORMATION -->
        <div class="footer-col">
          <h4>Information</h4>
          <ul>
            <li><a href="/legal/privatlivspolitik/">Privatlivspolitik</a></li>
            <li><a href="/legal/ansvarsfraskrivelse/">Ansvarsfraskrivelse</a></li>
          </ul>
        </div>
  
      </div>
  
      <div class="footer-bottom">
  
        <div class="footer-logo">
          <a href="/index.html">
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
  
        <p class="footer-disclaimer">
          Priser er vejledende og kan ændre sig. Beregningen er udelukkende informativ.
        </p>
  
        <p class="footer-meta">
          © 2026 · Lavet i Danmark 🇩🇰
        </p>
      </div>
    </footer>
    `;
  
    function injectFooter() {
      // Undgå dobbelt-injektion
      if (document.querySelector('.site-footer')) return;
  
      // Indsæt footer sidst i <body>
      document.body.insertAdjacentHTML('beforeend', footerHTML);
    }
  
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', injectFooter);
    } else {
      injectFooter();
    }
  })();