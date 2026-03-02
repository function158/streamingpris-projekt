const TRACKING_CONFIG = {
  oister: {
    match: "oister.dk",
    direct: "https://go.adt284.net/t/t?a=1666103641&as=2050148986&t=2&tk=1",
    build: (url) => `https://go.adt284.net/t/t?a=1666103641&as=2050148986&t=2&tk=1&url=${encodeURIComponent(url)}`,
  },
  callme: {
    match: "callme.dk",
    direct: "https://ion.callme.dk/t/t?a=1694478781&as=2050148986&t=2&tk=1",
    build: (url) => `https://ion.callme.dk/t/t?a=1694478781&as=2050148986&t=2&tk=1&url=${encodeURIComponent(url)}`,
  },
};

window.applyTracking = function(url) {
  if (!url) return url;

  for (const [key, config] of Object.entries(TRACKING_CONFIG)) {
    if (!url.includes(config.match)) continue;

    // Undgå dobbelt-wrapping
    if (url.includes("adt284.net") || url.includes("ion.callme.dk")) return url;

    // Forsiden / root = brug direkte link uden &url=
    try {
      const parsed = new URL(url);
      const isRoot = parsed.pathname === "/" || parsed.pathname === "";
      if (isRoot && !parsed.search) {
        return config.direct;
      }
    } catch(e) {}

    // Specifik underside = deeplink med &url=
    return config.build(url);
  }

  return url;
};

// Fanger klik på dynamisk oprettede links (bundle-kort m.m.)
document.addEventListener("click", function (e) {
  const a = e.target.closest("a[href]");
  if (!a) return;
  const tracked = window.applyTracking(a.href);
  if (tracked !== a.href) {
    e.preventDefault();
    a.setAttribute("rel", "sponsored noopener");
    window.open(tracked, "_blank");
  }
});