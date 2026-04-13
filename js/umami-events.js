(function () {
  'use strict';

  if (navigator.doNotTrack === '1') return;

  var path      = window.location.pathname;
  var maxScroll = 0;
  var scrollTracked = {};

  // ─── Umami-kø: queues events indtil umami er indlæst ──────────────────────
  var _q = [];
  var _ok = false;

  function track(name, data) {
    try {
      if (_ok) {
        window.umami.track(name, data);
      } else {
        _q.push([name, data]);
      }
    } catch (e) {}
  }

  var _n = 0;
  var _t = setInterval(function () {
    if (window.umami && typeof window.umami.track === 'function') {
      clearInterval(_t);
      _ok = true;
      var item;
      while ((item = _q.shift())) {
        try { window.umami.track(item[0], item[1]); } catch (e) {}
      }
    } else if (++_n > 50) { clearInterval(_t); }
  }, 100);

  // ─── 1. SCROLL-DYBDE ──────────────────────────────────────────────────────
  var ticking = false;

  function getPct() {
    var h = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    return h <= 0 ? 100 : Math.min(100, Math.round((window.scrollY / h) * 100));
  }

  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var pct = getPct();
      if (pct > maxScroll) maxScroll = pct;
      [25, 50, 75, 100].forEach(function (m) {
        if (!scrollTracked[m] && pct >= m) {
          scrollTracked[m] = true;
          track('scroll-' + m, { path: path });
        }
      });
    });
  }, { passive: true });

  // ─── 2. KLIK-TRACKING (én listener på body) ────────────────────────────────
  document.body.addEventListener('click', function (e) {
    try {
      var el = e.target;
      for (var i = 0; i < 5 && el && el !== document.body; i++) {
        var tag  = el.tagName  ? el.tagName.toUpperCase() : '';
        var role = el.getAttribute ? (el.getAttribute('role') || '') : '';
        if (tag === 'A' || tag === 'BUTTON' || role === 'button') break;
        el = el.parentElement;
      }
      if (!el || el === document.body) return;

      var tag  = el.tagName  ? el.tagName.toUpperCase()  : '';
      var role = el.getAttribute ? (el.getAttribute('role') || '') : '';
      var txt  = ((el.innerText || el.textContent || el.getAttribute('aria-label') || '')
                   .trim().replace(/\s+/g, ' ')).slice(0, 50);

      // Knapper
      if (tag === 'BUTTON' || role === 'button') {
        track('click-knap', { text: txt, path: path });
        return;
      }

      // Links
      if (tag !== 'A') return;
      var href = el.getAttribute('href') || '';
      if (!href || href.charAt(0) === '#' ||
          href.indexOf('javascript:') === 0 || href.indexOf('mailto:') === 0) return;

      var isInternal = false;
      var dest = href;
      try {
        var u = new URL(href, window.location.href);
        isInternal = u.hostname === window.location.hostname;
        dest = isInternal ? u.pathname : u.href;
      } catch (_) {
        isInternal = href.charAt(0) === '/';
      }

      if (isInternal) {
        track('click-intern',  { text: txt, href: dest.slice(0, 200), path: path });
      } else {
        track('click-tilbud', { text: txt, href: dest.slice(0, 200), path: path });
      }
    } catch (e) {}
  }, { passive: true });

  // ─── 3. EXIT-SCROLL ───────────────────────────────────────────────────────
  var exitSent = false;
  function sendExit() {
    if (exitSent) return;
    exitSent = true;
    track('exit-scroll', { pct: Math.round(maxScroll / 5) * 5, path: path });
  }

  window.addEventListener('beforeunload', sendExit);
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) sendExit();
  });

})();
