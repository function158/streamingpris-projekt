(function () {
  'use strict';

  // ─── GLOBAL MODAL INSTANS ─────────────────────────────────────────────────────
  var modal = null;
  var pendingData = null;

  function createModal() {
    if (document.getElementById('send-offer-modal')) return;

    var el = document.createElement('div');
    el.id = 'send-offer-modal';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-label', 'Send tilbud til din mail');
    el.style.cssText = [
      'display:none',
      'position:fixed',
      'inset:0',
      'z-index:9999',
      'align-items:center',
      'justify-content:center',
      'padding:16px',
    ].join(';');

    el.innerHTML = [
      '<div id="send-offer-overlay" style="position:absolute;inset:0;background:rgba(0,0,0,0.5);"></div>',
      '<div id="send-offer-card" style="',
        'position:relative;background:white;border-radius:20px;padding:28px 24px;',
        'max-width:420px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,0.2);z-index:1;',
      '">',

        '<button id="send-offer-close" aria-label="Luk" style="',
          'position:absolute;top:16px;right:16px;background:none;border:none;',
          'font-size:24px;cursor:pointer;color:#6b7280;line-height:1;padding:4px 8px;',
        '">&times;</button>',

        '<div id="send-offer-form-area">',
          '<div style="text-align:center;margin-bottom:20px;">',
            '<div style="font-size:28px;margin-bottom:8px;">&#9993;</div>',
            '<h2 style="font-size:18px;font-weight:800;color:#111;margin:0 0 8px;">F\xe5 tilbuddet sendt til din mail</h2>',
            '<p style="font-size:14px;color:#6b7280;margin:0;line-height:1.5;">',
              'Vi sender dig en oversigt med dette tilbud og dine valgte tjenester inkl. link til udbyderen',
            '</p>',
          '</div>',

          '<form id="send-offer-form" novalidate>',
            '<!-- Honeypot til botfiltrering -->',
            '<input type="text" name="website" id="send-offer-honeypot" style="position:absolute;left:-9999px;opacity:0;pointer-events:none;" tabindex="-1" autocomplete="off">',

            '<div style="margin-bottom:16px;">',
              '<input type="email" id="send-offer-email" name="email"',
                ' placeholder="Din e-mailadresse" required autocomplete="email"',
                ' style="display:block;width:100%;box-sizing:border-box;padding:13px 16px;',
                  'border:1.5px solid #d1d5db;border-radius:12px;font-size:15px;color:#111;',
                  'outline:none;transition:border-color .2s;font-family:inherit;">',
            '</div>',

            '<label style="display:flex;align-items:flex-start;gap:10px;cursor:pointer;margin-bottom:20px;">',
              '<input type="checkbox" id="send-offer-newsletter" name="newsletter_optin"',
                ' style="margin-top:3px;accent-color:#2B3EFF;width:16px;height:16px;flex-shrink:0;">',
              '<span style="font-size:13px;color:#374151;line-height:1.5;">',
                'Ja tak, send mig ogs\xe5 tips og nye besparelser<br>',
                '<span style="color:#9ca3af;font-size:12px;">(nyhedsbrev ca. 1\u20132x/md)</span>',
              '</span>',
            '</label>',

            '<div id="send-offer-status" style="display:none;margin-bottom:12px;padding:10px 14px;border-radius:10px;font-size:14px;"></div>',

            '<button type="submit" id="send-offer-submit" style="',
              'display:block;width:100%;padding:14px;background:#2B3EFF;color:white;border:none;',
              'border-radius:14px;font-size:15px;font-weight:700;cursor:pointer;',
              'transition:opacity .2s;font-family:inherit;',
            '">Send tilbuddet til mig \u2192</button>',
          '</form>',

          '<p style="text-align:center;font-size:12px;color:#9ca3af;margin:14px 0 0;">',
            '&#128274; Vi deler aldrig din mail. ',
            '<a href="/legal/privatlivspolitik/" style="color:#6b7280;">L\xe6s vores privatlivspolitik.</a>',
          '</p>',
        '</div>',

        '<div id="send-offer-success-area" style="display:none;text-align:center;padding:12px 0;">',
          '<div style="font-size:40px;margin-bottom:12px;">&#10003;</div>',
          '<h2 id="send-offer-success-msg" style="font-size:18px;font-weight:800;color:#111;margin:0 0 8px;"></h2>',
          '<p style="font-size:14px;color:#6b7280;margin:0 0 20px;">Tjek din indbakke \u2013 og m\xe5ske spam-mappen.</p>',
          '<button id="send-offer-success-close" style="',
            'padding:12px 28px;background:#2B3EFF;color:white;border:none;',
            'border-radius:14px;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit;',
          '">Luk</button>',
        '</div>',

      '</div>',
    ].join('');

    document.body.appendChild(el);
    modal = el;

    // Begivenhedslyttere
    el.querySelector('#send-offer-overlay').addEventListener('click', closeModal);
    el.querySelector('#send-offer-close').addEventListener('click', closeModal);
    el.querySelector('#send-offer-success-close').addEventListener('click', closeModal);

    var emailInput = el.querySelector('#send-offer-email');
    emailInput.addEventListener('focus', function () { emailInput.style.borderColor = '#2B3EFF'; });
    emailInput.addEventListener('blur',  function () { emailInput.style.borderColor = '#d1d5db'; });

    el.querySelector('#send-offer-form').addEventListener('submit', handleSubmit);
  }

  function openModal(data) {
    pendingData = data;
    if (!modal) createModal();

    // Nulstil tilstand
    modal.querySelector('#send-offer-form-area').style.display = 'block';
    modal.querySelector('#send-offer-success-area').style.display = 'none';
    modal.querySelector('#send-offer-status').style.display = 'none';

    var submitBtn = modal.querySelector('#send-offer-submit');
    submitBtn.textContent = 'Send tilbuddet til mig \u2192';
    submitBtn.disabled = false;

    // Nyhedsbrev-checkbox skal ALTID være unchecked som default (GDPR)
    modal.querySelector('#send-offer-newsletter').checked = false;

    // Forudfyld email fra localStorage hvis tilgængeligt
    var saved = localStorage.getItem('mineudgifter_email');
    var emailInput = modal.querySelector('#send-offer-email');
    emailInput.value = saved || '';

    modal.style.display = 'flex';
    setTimeout(function () { emailInput.focus(); }, 60);
  }

  function closeModal() {
    if (modal) modal.style.display = 'none';
    pendingData = null;
  }

  function showStatus(msg, isError) {
    var el = modal.querySelector('#send-offer-status');
    el.style.display = 'block';
    el.style.background  = isError ? '#fef2f2' : '#f0fdf4';
    el.style.color       = isError ? '#dc2626' : '#15803d';
    el.style.border      = isError ? '1px solid #fecaca' : '1px solid #bbf7d0';
    el.textContent = msg;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // Honeypot check
    if (document.getElementById('send-offer-honeypot').value) return;

    var emailInput = modal.querySelector('#send-offer-email');
    var email = emailInput.value.trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showStatus('Indtast venligst en gyldig e-mailadresse.', true);
      emailInput.focus();
      return;
    }

    localStorage.setItem('mineudgifter_email', email);

    var submitBtn = modal.querySelector('#send-offer-submit');
    submitBtn.textContent = 'Sender\u2026';
    submitBtn.disabled = true;
    modal.querySelector('#send-offer-status').style.display = 'none';

    var payload = Object.assign({}, pendingData, {
      email: email,
      newsletter_optin: modal.querySelector('#send-offer-newsletter').checked,
      mode: window.activeMode || 'har',
      timestamp: new Date().toISOString(),
    });

    try {
      var res = await fetch('https://mineudgifter-api.gentle-sun-c47f.workers.dev', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      var json;
      try { json = await res.json(); } catch (_) { json = {}; }

      if (res.ok && json.success) {
        modal.querySelector('#send-offer-form-area').style.display = 'none';
        modal.querySelector('#send-offer-success-msg').textContent =
          'Tilbuddet er sendt til ' + email + '!';
        modal.querySelector('#send-offer-success-area').style.display = 'block';
      } else {
        showStatus(json.error || 'Noget gik galt. Pr\xf8v igen.', true);
        submitBtn.textContent = 'Send tilbuddet til mig \u2192';
        submitBtn.disabled = false;
      }
    } catch (err) {
      showStatus('Noget gik galt. Tjek din internetforbindelse og pr\xf8v igen.', true);
      submitBtn.textContent = 'Send tilbuddet til mig \u2192';
      submitBtn.disabled = false;
    }
  }

  // Luk med Escape-tast
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal && modal.style.display !== 'none') closeModal();
  });

  window.openSendOfferModal = openModal;
})();
