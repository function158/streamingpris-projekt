(function () {

  // ══════════════════════════════════════════════════════════════════════
  // 1. UMAMI – cookieless, kører ALTID, uafhængigt af alt andet
  // ══════════════════════════════════════════════════════════════════════
  var um = document.createElement('script');
  um.defer = true;
  um.src = 'https://cloud.umami.is/script.js';
  um.setAttribute('data-website-id', 'e51de17b-f27c-4606-9aa4-90699fd13555');
  document.head.appendChild(um);

  // ══════════════════════════════════════════════════════════════════════
  // 2. SCROLL DEPTH TRACKING – sender ÉT event når bruger forlader siden
  // ══════════════════════════════════════════════════════════════════════
  (function () {
    var maxScroll = 0;

    function getScrollPercent() {
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return 100;
      return Math.round((window.scrollY / docHeight) * 100);
    }

    // Track højeste scroll løbende
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          var pct = getScrollPercent();
          if (pct > maxScroll) maxScroll = pct;
          ticking = false;
        });
        ticking = true;
      }
    });

    // Send ét samlet event når brugeren forlader siden
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden' && maxScroll > 0) {
        if (typeof umami !== 'undefined' && umami.track) {
          umami.track('scroll-depth', {
            depth: maxScroll + '%',
            page: window.location.pathname
          });
        }
      }
    });
  })();

  // ══════════════════════════════════════════════════════════════════════
  // 3. GOOGLE ANALYTICS – loades KUN hvis bruger accepterer cookies
  // ══════════════════════════════════════════════════════════════════════
  function loadGA() {
    if (window._gaLoaded) return;
    window._gaLoaded = true;

    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    window.gtag = gtag;

    var ga = document.createElement('script');
    ga.async = true;
    ga.src = 'https://www.googletagmanager.com/gtag/js?id=G-GG1981P35F';
    ga.onload = function () {
      gtag('js', new Date());
      gtag('consent', 'default', {
        ad_storage:        'granted',
        analytics_storage: 'granted'
      });
      gtag('config', 'G-GG1981P35F', { send_page_view: true });
    };
    document.head.appendChild(ga);
  }

  // ── Hvis allerede accepteret → load GA med det samme ──
  var existing = localStorage.getItem('cookie_consent');
  if (existing === 'all') {
    loadGA();
    return;
  }
  if (existing === 'necessary') return;

  // ══════════════════════════════════════════════════════════════════════
  // 4. COOKIE BANNER (kun for GA4)
  // ══════════════════════════════════════════════════════════════════════
  var style = document.createElement('style');
  style.textContent = `
    #cb-overlay {
      position:fixed;inset:0;background:rgba(0,0,0,0.55);
      z-index:999998;opacity:0;transition:opacity 0.35s ease;
    }
    #cb-overlay.cb-visible{opacity:1;}
    #cb-wrapper {
      position:fixed;bottom:24px;left:50%;
      transform:translateX(-50%);
      opacity:0;z-index:999999;
      width:calc(100% - 32px);max-width:480px;
      transition:opacity 0.35s ease,transform 0.35s ease;
      font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
    }
    #cb-wrapper.cb-visible{opacity:1;}
    #cb-banner {
      background:#fff;border-radius:16px;
      padding:20px 22px 18px;
      box-shadow:0 8px 40px rgba(0,0,0,0.18);
    }
    #cb-top{display:flex;align-items:center;gap:8px;margin-bottom:8px;}
    #cb-headline{font-size:15px;font-weight:700;color:#1a1a1a;}
    #cb-body{font-size:13px;color:#555;line-height:1.55;margin-bottom:16px;}
    #cb-body a{color:#4a5af7;text-decoration:underline;}
    #cb-buttons{display:flex;gap:10px;}
    #cb-accept {
      flex:1;background:#4a5af7;color:#fff;border:none;
      border-radius:10px;padding:12px 18px;font-size:14px;
      font-weight:600;cursor:pointer;font-family:inherit;
      transition:background 0.15s;
    }
    #cb-accept:hover{background:#3a49e0;}
    #cb-decline {
      background:transparent;border:1.5px solid #ddd;
      border-radius:10px;padding:12px 16px;font-size:13px;
      font-weight:500;color:#666;cursor:pointer;
      font-family:inherit;white-space:nowrap;
    }
    #cb-decline:hover{border-color:#bbb;color:#444;}
  `;
  document.head.appendChild(style);

  function showBanner() {
    var overlay = document.createElement('div');
    overlay.id = 'cb-overlay';
    document.body.appendChild(overlay);

    var wrapper = document.createElement('div');
    wrapper.id = 'cb-wrapper';
    wrapper.innerHTML = `
      <div id="cb-banner">
        <div id="cb-top">
          <span>\u{1F36A}</span>
          <span id="cb-headline">Vi bruger cookies</span>
        </div>
        <p id="cb-body">
          Vi bruger cookies til statistik (Google Analytics) s\u00e5 vi kan forbedre siden.
          <a href="/legal/privatlivspolitik/">L\u00e6s mere</a>
        </p>
        <div id="cb-buttons">
          <button id="cb-accept">Accept\u00e9r</button>
          <button id="cb-decline">Kun n\u00f8dvendige</button>
        </div>
      </div>
    `;
    document.body.appendChild(wrapper);

    requestAnimationFrame(function () {
      setTimeout(function () {
        overlay.classList.add('cb-visible');
        wrapper.classList.add('cb-visible');
      }, 80);
    });

    function dismiss(consent) {
      localStorage.setItem('cookie_consent', consent);
      overlay.style.opacity = '0';
      wrapper.style.opacity = '0';
      setTimeout(function () {
        overlay.remove();
        wrapper.remove();
      }, 350);

      if (consent === 'all') {
        loadGA();
      }
    }

    document.getElementById('cb-accept').addEventListener('click', function () { dismiss('all'); });
    document.getElementById('cb-decline').addEventListener('click', function () { dismiss('necessary'); });
  }

  if (document.body) {
    showBanner();
  } else {
    document.addEventListener('DOMContentLoaded', showBanner);
  }

})();