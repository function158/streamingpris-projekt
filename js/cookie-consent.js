(function () {
  if (localStorage.getItem('cookie_consent')) return;

  const style = document.createElement('style');
  style.textContent = `
    #cb-wrapper {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%) translateY(20px);
      opacity: 0;
      z-index: 999999;
      width: calc(100% - 48px);
      max-width: 420px;
      transition: opacity 0.35s ease, transform 0.35s ease;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    #cb-wrapper.cb-visible {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
    #cb-banner {
      background: #fff;
      border-radius: 16px;
      padding: 20px 22px 18px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.10);
    }
    #cb-top {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }
    #cb-headline {
      font-size: 15px;
      font-weight: 700;
      color: #1a1a1a;
    }
    #cb-body {
      font-size: 13px;
      color: #555;
      line-height: 1.55;
      margin-bottom: 16px;
    }
    #cb-body a {
      color: #4a5af7;
      text-decoration: underline;
    }
    #cb-buttons {
      display: flex;
      gap: 10px;
    }
    #cb-accept {
      flex: 1;
      background: #4a5af7;
      color: #fff;
      border: none;
      border-radius: 10px;
      padding: 12px 18px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
      transition: background 0.15s;
    }
    #cb-accept:hover { background: #3a49e0; }
    #cb-decline {
      background: transparent;
      border: 1.5px solid #ddd;
      border-radius: 10px;
      padding: 12px 16px;
      font-size: 13px;
      font-weight: 500;
      color: #666;
      cursor: pointer;
      font-family: inherit;
      white-space: nowrap;
      transition: border-color 0.15s, color 0.15s;
    }
    #cb-decline:hover { border-color: #bbb; color: #444; }
  `;
  document.head.appendChild(style);

  const wrapper = document.createElement('div');
  wrapper.id = 'cb-wrapper';
  wrapper.innerHTML = `
    <div id="cb-banner">
      <div id="cb-top">
        <span>🍪</span>
        <span id="cb-headline">Vi bruger cookies</span>
      </div>
      <p id="cb-body">
        Vi bruger cookies til annoncering (Google AdSense) og statistik (Google Analytics) –
        det er det der gør siden gratis at bruge. <a href="/cookiepolitik">Læs mere</a>
      </p>
      <div id="cb-buttons">
        <button id="cb-accept">Acceptér</button>
        <button id="cb-decline">Kun nødvendige</button>
      </div>
    </div>
  `;
  document.body.appendChild(wrapper);

  requestAnimationFrame(() => {
    setTimeout(() => wrapper.classList.add('cb-visible'), 80);
  });

  function dismiss(consent) {
    localStorage.setItem('cookie_consent', consent);
    wrapper.style.opacity = '0';
    wrapper.style.transform = 'translateX(-50%) translateY(10px)';
    setTimeout(() => wrapper.remove(), 350);

    if (consent === 'all') {
      // gtag('consent', 'update', { ad_storage: 'granted', analytics_storage: 'granted' });
    } else {
      // gtag('consent', 'update', { ad_storage: 'denied', analytics_storage: 'denied' });
    }
  }

  document.getElementById('cb-accept').addEventListener('click', () => dismiss('all'));
  document.getElementById('cb-decline').addEventListener('click', () => dismiss('necessary'));
})();