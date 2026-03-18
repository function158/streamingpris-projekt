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
    { name: "Hiper",    logo: "/images/hiper-logo.png",    url: "https://go.adt242.com/t/t?a=1697235826&as=2050148986&t=2&tk=1" },
    { name: "EWII",     logo: "/images/ewii-logo.svg",     url: "https://go.ewii.dk/t/t?a=1693093225&as=2050148986&t=2&tk=1" },
    { name: "Flexii",   logo: "/images/flexii-logo.svg",   url: "https://go.adt256.com/t/t?a=1751759538&as=2050148986&t=2&tk=1" },
    { name: "eesy",     logo: "/images/eesy-logo.svg",     url: "https://on.eesy.dk/t/t?a=1700040947&as=2050148986&t=2&tk=1" },
    { name: "Duka",     logo: "/images/duka-logo.svg",     url: "https://ion.dukatale.dk/t/t?a=1666106721&as=2050148986&t=2&tk=1" },
    { name: "Greentel", logo: "/images/greentel-logo.png", url: "https://go.adt256.com/t/t?a=1667317668&as=2050148986&t=2&tk=1" },
    { name: "Allente",  logo: "/images/allente-logo.svg",  url: "https://dot.allente.dk/t/t?a=1661367060&as=2050148986&t=2&tk=1" },
    { name: "YouSee",   logo: "/images/yousee-logo.svg",   url: "https://at.yousee.dk/t/t?a=1697234454&as=2050148986&t=2&tk=1" },
    { name: "3",        logo: "/images/3-logo.svg",        url: "https://go.adt291.com/t/t?a=1888318380&as=2050148986&t=2&tk=1" },
  ];
  
  // =====================================================
  //  RØR IKKE HERUNDER
  // =====================================================
  (function () {
    const isForside = window.location.pathname === "/" || window.location.pathname === "/index.html";
    const partners  = isForside ? PARTNERS_FORSIDE : PARTNERS_ALLE;
    const speed     = isForside ? 20 : 60;
  
    const CSS = `
      .pc { padding: 36px 0; font-family: inherit; width: 100vw; position: relative; left: 50%; transform: translateX(-50%); }
      .pc-label { text-align: center; font-size: 11px; letter-spacing: .12em; text-transform: uppercase; color: #888; margin-bottom: 24px; }
      .pc-wrap { overflow: hidden; -webkit-mask: linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%); mask: linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%); }
      .pc-track { display: flex; align-items: center; width: max-content; animation: pc-scroll var(--pc-speed) linear infinite; }
      .pc-wrap:hover .pc-track { animation-play-state: paused; }
      @keyframes pc-scroll { from { transform: translateX(0); } to { transform: translateX(-25%); } }
      .pc-item { display: flex; align-items: center; justify-content: center; padding: 0 40px; height: 56px; text-decoration: none; flex-shrink: 0; }
      .pc-item img { height: 28px; width: auto; max-width: 120px; object-fit: contain; filter: grayscale(100%) opacity(55%); transform: scale(1) translateY(0); transition: filter .35s ease, transform .35s ease; }
      .pc-item:hover img { filter: grayscale(0%) opacity(100%); transform: scale(1.08) translateY(-3px); }
      .pc-note { text-align: center; font-size: 11px; color: #888; margin-top: 16px; letter-spacing: .03em; }
      @media (max-width: 600px) {
        .pc-item { padding: 0 24px; height: 44px; }
        .pc-item img { height: 22px; max-width: 90px; }
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
        img.src = logo; img.alt = name; img.loading = 'lazy';
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
      section.insertAdjacentHTML('beforeend', '<p class="pc-note">ℹ️ Indeholder reklamelinks – vi får kommission ved køb via dem, uden ekstra pris for dig 💙</p>');
  
      // Indsæt i #partners-carousel hvis den findes — ellers efter .cta-wrap
      const placeholder = document.getElementById('partners-carousel');
      if (placeholder) { placeholder.replaceWith(section); return; }
      const cta = document.querySelector('.cta-wrap');
      if (cta) { cta.insertAdjacentElement('afterend', section); return; }
      document.body.appendChild(section);
    }
  
    document.readyState === 'loading'
      ? document.addEventListener('DOMContentLoaded', build)
      : build();
  })();