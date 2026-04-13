/**
 * MODE-SWITCH.JS
 * Skifter mellem "Jeg har allerede" og "Jeg vil gerne have"
 * Ændrer kun tekster og bundle-sektionens header — logikken i bundles.js røres ikke.
 */

(function () {

    const MODES = {
      har: {
        title:        'Vælg dine streamingtjenester og se dine <span>mulige besparelser</span>',
        intro:        'Opdag om dine streamingtjenester kan blive billigere gennem mobilabonnementer med inkluderet streaming.',
        bundleTitle:  'Du kan måske spare penge',
        summaryLabel: 'Din samlede pris for valgte tjenester',
        mobileH3: 'Hvad betaler du for <span>mobilabonnement?</span>',
        mobileP:      'Vi finder bundter, der kan spare dig penge på både streaming og mobil.',
      },
      vil: {
        title: 'Sammensæt dine streamingtjenester og find den <span>billigste måde</span>',
        intro: 'Vælg dine streamingtjenester. Vi finder mobilabonnementer hvor de allerede er inkluderet.',
        bundleTitle:  'Sådan får du det billigst',
        summaryLabel: 'Samlet listepris, hvis du køber separat',
        mobileH3: 'Har du et <span>mobilabonnement</span> i dag?',
        mobileP:      'Vi bruger det til at sammenligne med bundter, der måske er billigere.',
      },
    };
  
    // Aktiv mode — eksponér globalt så bundles.js evt. kan læse den
    window.activeMode = 'har';
  
    function applyMode(mode) {
      window.activeMode = mode;
      const m = MODES[mode];
  
      // Titel
      const titleEl = document.querySelector('.title');
      if (titleEl) {
        titleEl.classList.add('fading');
        setTimeout(() => {
          titleEl.innerHTML = m.title;
          titleEl.classList.remove('fading');
        }, 160);
      }
  
      // Intro
      const introEl = document.querySelector('.intro');
      if (introEl) {
        introEl.classList.add('fading');
        setTimeout(() => {
          introEl.textContent = m.intro;
          introEl.classList.remove('fading');
        }, 160);
      }
  
      // Bundle-sektion overskrift
      const bundleTitleEl = document.querySelector('.bundle-title');
      if (bundleTitleEl) bundleTitleEl.textContent = m.bundleTitle;
  
      // Summary label
      const summaryLabelEl = document.querySelector('.summary-label');
      if (summaryLabelEl) summaryLabelEl.textContent = m.summaryLabel;
  
      // Mobile picker tekst
      const mobileH3 = document.querySelector('.mobile-picker-title');
      if (mobileH3) mobileH3.innerHTML = m.mobileH3;
  
      // Knapper
      document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
      });
  
      // Genberegn bundles med ny mode (for evt. fremtidig logik-udvidelse)
      if (typeof renderBundles === 'function') {
        renderBundles(window.selected || {});
      }
    }
  
    function init() {
      // Byg switch og indsæt FØR .mobile-picker-wrap
      const pickerWrap = document.querySelector('.mobile-picker-wrap');
      if (!pickerWrap) return;

      const wrap = document.createElement('div');
      wrap.className = 'mode-switch-wrap';
      wrap.innerHTML = `
        <div class="mode-switch" role="group" aria-label="Vælg tilstand">
          <button class="mode-btn active" data-mode="har">
            Jeg har allerede streaming
          </button>
          <button class="mode-btn" data-mode="vil">
            Jeg vil gerne have streaming
          </button>
        </div>
      `;

      pickerWrap.parentNode.insertBefore(wrap, pickerWrap);
  
      wrap.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => applyMode(btn.dataset.mode));
      });
    }
  
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  
  })();