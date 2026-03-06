/**
 * TOC.JS – Automatisk indholdsfortegnelse
 * 
 * Placer i /js/toc.js
 * Tilføj på artikelsider: <script defer src="/js/toc.js"></script>
 * 
 * - Scanner automatisk alle h2-tags på siden
 * - Bygger TOC og indsætter den efter .intro
 * - Sætter id på h2-tags automatisk (behøver ikke gøres manuelt)
 * - Lukker TOC når man klikker et link
 * - Lukker TOC når man klikker udenfor
 * - Springer h2 inde i .cta-wrap og .related-articles over
 */

(function () {

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  
    function init() {
      // Find alle h2-tags – undtagen dem inde i .cta-wrap og .related-articles
      const h2s = Array.from(document.querySelectorAll('h2')).filter(h2 => {
        return !h2.closest('.cta-wrap') &&
               !h2.closest('.cta-heading') &&
               !h2.closest('.related-articles');
      });
  
      // Færre end 2 h2-tags? Så lav ingen TOC
      if (h2s.length < 2) return;
  
      // Sæt id på alle h2-tags automatisk ud fra teksten
      h2s.forEach(h2 => {
        if (!h2.id) {
          const text = h2.textContent.trim()
            .toLowerCase()
            .replace(/[æ]/g, 'ae').replace(/[ø]/g, 'oe').replace(/[å]/g, 'aa')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
          h2.id = text;
        }
      });
  
      // Byg TOC HTML
      const items = h2s.map(h2 => {
        const text = h2.textContent.trim();
        return `<li><a href="#${h2.id}">${text}</a></li>`;
      }).join('');
  
      const toc = document.createElement('div');
      toc.className = 'extra-info toc-wrap';
      toc.innerHTML = `
        <details>
          <summary>Indholdsfortegnelse</summary>
          <ol class="toc-list">${items}</ol>
        </details>
      `;
  
      // Indsæt efter .intro, eller efter h1 hvis ingen .intro
      const intro = document.querySelector('.intro') || document.querySelector('h1');
      if (intro) {
        intro.insertAdjacentElement('afterend', toc);
      }
  
      const details = toc.querySelector('details');
  
      // Luk TOC når man klikker et link
      toc.querySelectorAll('.toc-list a').forEach(link => {
        link.addEventListener('click', () => {
          details.removeAttribute('open');
        });
      });
  
      // Luk TOC når man klikker udenfor
      document.addEventListener('click', (e) => {
        if (!toc.contains(e.target)) {
          details.removeAttribute('open');
        }
      });
    }
  
  })();