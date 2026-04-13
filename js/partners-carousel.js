const PARTNERS_FORSIDE = [
    { name: "Norlys",  logo: "/images/norlys-logo.svg",  url: "https://to.norlys.dk/t/t?a=1666136303&as=2050148986&t=2&tk=1" },
    { name: "CBB",     logo: "/images/cbb-mobil.png",    url: "https://on.cbb.dk/t/t?a=1700024858&as=2050148986&t=2&tk=1" },
    { name: "Telmore", logo: "/images/telmore-logo.svg", url: "https://on.telmore.dk/t/t?a=1721073357&as=2050148986&t=2&tk=1" },
    { name: "Oister",  logo: "/images/oister.svg",       url: "https://go.adt284.net/t/t?a=1666103641&as=2050148986&t=2&tk=1" },
    { name: "CallMe",  logo: "/images/call-me.svg",       url: "https://ion.callme.dk/t/t?a=1694478781&as=2050148986&t=2&tk=1" },
  ];
  
  const PARTNERS_ALLE = [
    { name: "Norlys",   logo: "/images/norlys-logo.svg",   url: "https://to.norlys.dk/t/t?a=1666136303&as=2050148986&t=2&tk=1" },
    { name: "CBB",      logo: "/images/cbb-mobil.png",     url: "https://on.cbb.dk/t/t?a=1700024858&as=2050148986&t=2&tk=1" },
    { name: "Telmore",  logo: "/images/telmore-logo.svg",  url: "https://on.telmore.dk/t/t?a=1721073357&as=2050148986&t=2&tk=1" },
    { name: "Oister",   logo: "/images/oister.svg",        url: "https://go.adt284.net/t/t?a=1666103641&as=2050148986&t=2&tk=1" },
    { name: "CallMe",   logo: "/images/call-me.svg",        url: "https://ion.callme.dk/t/t?a=1694478781&as=2050148986&t=2&tk=1" },
    { name: "Viaplay",  logo: "/images/viaplay-logo.svg",  url: "https://go.adt242.com/t/t?a=1531118376&as=2050148986&t=2&tk=1" },
    { name: "Mofibo",  logo: "/images/mofibo.svg",  url: "https://go.adt212.net/t/t?a=1400643923&as=2050148986&t=2&tk=1" },
    { name: "Hiper",    logo: "/images/hiper-logo.png",    url: "https://go.adt242.com/t/t?a=1697235826&as=2050148986&t=2&tk=1" },
    { name: "EWII",     logo: "/images/ewii-logo.svg",     url: "https://go.ewii.dk/t/t?a=1693093225&as=2050148986&t=2&tk=1" },
    { name: "Flexii",   logo: "/images/flexii-logo.svg",   url: "https://go.adt256.com/t/t?a=1751759538&as=2050148986&t=2&tk=1" },
    { name: "eesy",     logo: "/images/eesy-logo.svg",     url: "https://on.eesy.dk/t/t?a=1700040947&as=2050148986&t=2&tk=1" },
    { name: "Duka",     logo: "/images/duka-logo.svg",     url: "https://ion.dukatale.dk/t/t?a=1666106721&as=2050148986&t=2&tk=1" },
    { name: "Greentel", logo: "/images/greentel-logo.png", url: "https://go.adt256.com/t/t?a=1667317668&as=2050148986&t=2&tk=1" },
    { name: "Allente",  logo: "/images/allente-logo.svg",  url: "https://dot.allente.dk/t/t?a=1661367060&as=2050148986&t=2&tk=1" },
    { name: "YouSee",   logo: "/images/yousee-logo.svg",   url: "https://at.yousee.dk/t/t?a=1697234454&as=2050148986&t=2&tk=1" },
    { name: "3",        logo: "/images/3-logo.svg",        url: "https://go.adt291.com/t/t?a=1888318380&as=2050148986&t=2&tk=1" },
    { name: "Nextory",  logo: "/images/nextory-logo.png",  url: "https://pin.nextory.dk/t/t?a=1412083419&as=2050148986&t=2&tk=1" },
  ];
  
  // =====================================================
  //  RØR IKKE HERUNDER
  // =====================================================
  (function () {
    const isForside = window.location.pathname === "/" || window.location.pathname === "/index.html";
    const partners  = isForside ? PARTNERS_FORSIDE : PARTNERS_ALLE;
    const speed     = isForside ? 40 : 80;

    const CSS = `
      .pc { padding: 56px 0 48px; font-family: inherit; width: 100vw; position: relative; left: 50%; transform: translateX(-50%); }
      .pc-label { text-align: center; font-size: 13px; letter-spacing: .14em; text-transform: uppercase; color: #999; margin-bottom: 32px; font-weight: 500; }
      .pc-wrap { overflow: hidden; -webkit-mask: linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%); mask: linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%); }
      .pc-track { display: flex; align-items: center; width: max-content; will-change: transform; backface-visibility: hidden; transform: translateZ(0); }
      .pc-track.running { animation: pc-scroll var(--pc-speed) linear infinite; }
      .pc-wrap:hover .pc-track { animation-play-state: paused; }
      @keyframes pc-scroll { from { transform: translateX(0); } to { transform: translateX(var(--pc-offset)); } }
      .pc-item { display: flex; align-items: center; justify-content: center; padding: 0 52px; height: 64px; text-decoration: none; flex-shrink: 0; }
      .pc-item img { height: 36px; width: auto; max-width: 140px; object-fit: contain; filter: grayscale(100%) opacity(70%); transform: scale(1) translateY(0); transition: filter .35s ease, transform .35s ease; }
      .pc-item:hover img { filter: grayscale(0%) opacity(100%); transform: scale(1.08) translateY(-2px); }
      .pc-note { text-align: center !important; font-size: 13px !important; color: #888 !important; margin-top: 28px !important; max-width: none !important; padding: 0 !important; line-height: 1.4 !important; }
      @media (max-width: 600px) {
        .pc { padding: 40px 0 36px; }
        .pc-item { padding: 0 28px; height: 48px; }
        .pc-item img { height: 26px; max-width: 100px; }
      }
    `;

    function build() {
      if (!document.getElementById('pc-styles')) {
        const style = document.createElement('style');
        style.id = 'pc-styles';
        style.textContent = CSS;
        document.head.appendChild(style);
      }

      const makeItem = ({ name, logo, url }) => {
        const a = document.createElement('a');
        a.className = 'pc-item';
        a.href = url; a.target = '_blank'; a.rel = 'sponsored noopener'; a.title = name;
        const img = document.createElement('img');
        img.src = logo; img.alt = name; img.loading = 'eager';
        a.appendChild(img);
        return a;
      };

      const track = document.createElement('div');
      track.className = 'pc-track';
      track.style.setProperty('--pc-speed', `${speed}s`);
      [1,2,3,4].forEach(() => partners.forEach(p => track.appendChild(makeItem(p))));

      const wrap = document.createElement('div');
      wrap.className = 'pc-wrap';
      wrap.appendChild(track);

      const section = document.createElement('section');
      section.className = 'pc';
      section.insertAdjacentHTML('afterbegin', '<p class="pc-label">Vi sammenligner tilbud fra</p>');
      section.appendChild(wrap);
      section.insertAdjacentHTML('beforeend', '<p class="pc-note">Siden indeholder reklamelinks. Vi modtager kommission ved køb – uden ekstra pris for dig.</p>');

      // Indsæt i #partners-carousel hvis den findes — ellers efter .cta-wrap
      const placeholder = document.getElementById('partners-carousel');
      if (placeholder) { placeholder.replaceWith(section); }
      else {
        const cta = document.querySelector('.cta-wrap');
        if (cta) { cta.insertAdjacentElement('afterend', section); }
        else { document.body.appendChild(section); }
      }

      // Vent på alle billeder er loadet — mål præcis pixel-bredde og start animation
      const imgs = Array.from(track.querySelectorAll('img'));
      const loaded = imgs.map(img =>
        img.complete ? Promise.resolve() : new Promise(r => { img.onload = img.onerror = r; })
      );
      Promise.all(loaded).then(() => {
        const setWidth = track.scrollWidth / 4;
        track.style.setProperty('--pc-offset', `-${setWidth}px`);
        track.classList.add('running');
      });
    }
  
    document.readyState === 'loading'
      ? document.addEventListener('DOMContentLoaded', build)
      : build();
  })();