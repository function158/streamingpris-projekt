/**
 * Cookie Consent – mineudgifter.dk
 * Håndterer: Google AdSense, Umami (altid aktiv)
 *
 * Indsæt i <head> via header.js – kører på alle sider automatisk.
 *
 * Tilpas ADSENSE_ID nedenfor.
 */

(function () {
    // ─── KONFIGURATION ────────────────────────────────────────────────
    var ADSENSE_ID = 'ca-pub-XXXXXXXXXX';    // ← skift til dit AdSense publisher-ID
    // ──────────────────────────────────────────────────────────────────
  
    var STORAGE_KEY = 'cookieConsent';
  
    function getConsent() {
      try { return localStorage.getItem(STORAGE_KEY); } catch(e) { return null; }
    }
  
    function setConsent(value) {
      try { localStorage.setItem(STORAGE_KEY, value); } catch(e) {}
    }
  
    function loadAdSense() {
      if (document.getElementById('adsense-script')) return;
      var s = document.createElement('script');
      s.id          = 'adsense-script';
      s.src         = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + ADSENSE_ID;
      s.async       = true;
      s.crossOrigin = 'anonymous';
      document.head.appendChild(s);
    }
  
    function applyConsent(consent) {
      if (consent === 'accepted') {
        loadAdSense();
      }
    }
  
    // Forsvind-animation: glider ned og fader ud
    function hideBanner() {
      var banner = document.getElementById('cookie-banner');
      if (!banner) return;
      banner.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
      banner.style.opacity    = '0';
      banner.style.transform  = isMobile()
        ? 'translateY(100%)'
        : 'translateX(calc(100% + 20px))';
      setTimeout(function () { banner.remove(); }, 280);
    }
  
    function isMobile() {
      return window.innerWidth < 640;
    }
  
    window.cookieAccept = function () {
      setConsent('accepted');
      applyConsent('accepted');
      hideBanner();
    };
  
    window.cookieReject = function () {
      setConsent('rejected');
      hideBanner();
    };
  
    function injectStyles() {
      if (document.getElementById('cookie-consent-style')) return;
      var style = document.createElement('style');
      style.id = 'cookie-consent-style';
      style.textContent = [
        '#cookie-banner {',
          'position: fixed;',
          'z-index: 99999;',
          'background: #fff;',
          'border: 1.5px solid #e2e6ea;',
          'border-radius: 12px;',
          'box-shadow: 0 4px 20px rgba(0,0,0,0.10);',
          'font-family: sans-serif;',
          'padding: 14px 16px;',
          'max-width: 300px;',
          /* Desktop: nederste højre hjørne */
          'bottom: 20px;',
          'right: 20px;',
          'left: auto;',
          'transform: none;',
          'width: auto;',
        '}',
        /* Mobil: fuld bredde i bunden */
        '@media (max-width: 639px) {',
          '#cookie-banner {',
            'bottom: 0;',
            'right: 0;',
            'left: 0;',
            'max-width: 100%;',
            'border-radius: 14px 14px 0 0;',
            'border-bottom: none;',
            'padding: 16px;',
          '}',
        '}',
        '#cookie-banner .cb-title {',
          'display: flex;',
          'align-items: center;',
          'gap: 6px;',
          'font-size: 13px;',
          'font-weight: 700;',
          'color: #111;',
          'margin: 0 0 5px;',
        '}',
        '#cookie-banner .cb-title svg {',
          'flex-shrink: 0;',
        '}',
        '#cookie-banner .cb-text {',
          'font-size: 12px;',
          'color: #666;',
          'line-height: 1.5;',
          'margin: 0 0 12px;',
        '}',
        '#cookie-banner .cb-text a {',
          'color: #4B4FE8;',
          'text-decoration: underline;',
        '}',
        '#cookie-banner .cb-buttons {',
          'display: flex;',
          'gap: 8px;',
        '}',
        '#cookie-banner .cb-accept {',
          'flex: 1;',
          'background: #4B4FE8;',
          'color: #fff;',
          'border: none;',
          'padding: 9px 12px;',
          'border-radius: 7px;',
          'font-size: 12px;',
          'font-weight: 600;',
          'cursor: pointer;',
          'transition: background 0.15s;',
        '}',
        '#cookie-banner .cb-accept:hover { background: #3a3fd4; }',
        '#cookie-banner .cb-reject {',
          'flex: 1;',
          'background: #fff;',
          'color: #555;',
          'border: 1.5px solid #d1d5db;',
          'padding: 9px 12px;',
          'border-radius: 7px;',
          'font-size: 12px;',
          'font-weight: 600;',
          'cursor: pointer;',
          'transition: border-color 0.15s, color 0.15s;',
        '}',
        '#cookie-banner .cb-reject:hover { border-color: #999; color: #333; }',
      ].join('');
      document.head.appendChild(style);
    }
  
    function injectBanner() {
      injectStyles();
  
      var el = document.createElement('div');
      el.id = 'cookie-banner';
      el.innerHTML = [
        '<p class="cb-title">',
          // Cookie-ikon i #4B4FE8
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="#4B4FE8" xmlns="http://www.w3.org/2000/svg">',
            '<path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/>',
            '<circle cx="8.5" cy="10.5" r="1.5"/>',
            '<circle cx="13.5" cy="15.5" r="1.5"/>',
            '<circle cx="15" cy="8" r="1"/>',
          '</svg>',
          'Vi bruger cookies',
        '</p>',
        '<p class="cb-text">',
          'Vi bruger cookies til annoncering (Google AdSense) for at holde siden gratis. ',
          '<a href="/legal/privatlivspolitik">Læs mere</a>',
        '</p>',
        '<div class="cb-buttons">',
          '<button class="cb-accept" onclick="cookieAccept()">Acceptér</button>',
          '<button class="cb-reject" onclick="cookieReject()">Kun nødvendige</button>',
        '</div>',
      ].join('');
  
      document.body.appendChild(el);
    }
  
    function init() {
      var saved = getConsent();
      if (saved) {
        applyConsent(saved);
      } else {
        injectBanner();
      }
    }
  
    // Virker uanset om DOM er klar eller ej
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  
  })();