(function () {

  // ── GOOGLE ANALYTICS – loader altid, consent mode håndteres af banner ──
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = gtag;

  // Sæt consent default – GDPR korrekt
  gtag('consent', 'default', {
    ad_storage:        'denied',
    analytics_storage: 'denied',
    wait_for_update:   500
  });

  // Load GA script
  var ga = document.createElement('script');
  ga.async = true;
  ga.src = 'https://www.googletagmanager.com/gtag/js?id=G-GG1981P35F';
  ga.onload = function() {
    gtag('js', new Date());
    gtag('config', 'G-GG1981P35F', { send_page_view: true });
  };
  document.head.appendChild(ga);

  // ── HVIS ALLEREDE ACCEPTERET ──────────────────────────────────────────
  var existing = localStorage.getItem('cookie_consent');
  if (existing === 'all') {
    gtag('consent', 'update', {
      ad_storage:        'granted',
      analytics_storage: 'granted'
    });
    return;
  }
  if (existing === 'necessary') return;

  // ── VIS BANNER ────────────────────────────────────────────────────────
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

  // Vent til body er klar
  function showBanner() {
    var overlay = document.createElement('div');
    overlay.id = 'cb-overlay';
    document.body.appendChild(overlay);

    var wrapper = document.createElement('div');
    wrapper.id = 'cb-wrapper';
    wrapper.innerHTML = `
      <div id="cb-banner">
        <div id="cb-top">
          <span>🍪</span>
          <span id="cb-headline">Vi bruger cookies</span>
        </div>
        <p id="cb-body">
          Vi bruger cookies til statistik (Google Analytics) så vi kan forbedre siden.
          <a href="/legal/privatlivspolitik/">Læs mere</a>
        </p>
        <div id="cb-buttons">
          <button id="cb-accept">Acceptér</button>
          <button id="cb-decline">Kun nødvendige</button>
        </div>
      </div>
    `;
    document.body.appendChild(wrapper);

    requestAnimationFrame(function() {
      setTimeout(function() {
        overlay.classList.add('cb-visible');
        wrapper.classList.add('cb-visible');
      }, 80);
    });

    function dismiss(consent) {
      localStorage.setItem('cookie_consent', consent);
      overlay.style.opacity = '0';
      wrapper.style.opacity = '0';
      setTimeout(function() {
        overlay.remove();
        wrapper.remove();
      }, 350);

      if (consent === 'all') {
        gtag('consent', 'update', {
          ad_storage:        'granted',
          analytics_storage: 'granted'
        });
      }
    }

    document.getElementById('cb-accept').addEventListener('click', function() { dismiss('all'); });
    document.getElementById('cb-decline').addEventListener('click', function() { dismiss('necessary'); });
  }

  if (document.body) {
    showBanner();
  } else {
    document.addEventListener('DOMContentLoaded', showBanner);
  }

})();