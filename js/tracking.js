const TRACKING_CONFIG = {
  oister: {
    match: "oister.dk",
    base: "https://go.adt284.net/t/t?a=1666103641&as=2050148986&t=2&tk=1",
    build: (base, url) => `${base}&url=${encodeURIComponent(url)}`,
  },
  callme: {
    match: "callme.dk",
    base: "https://ion.callme.dk/t/t?a=1694478781&as=2050148986&t=2&tk=1",
    build: (base, url) => `${base}&url=${encodeURIComponent(url)}`,
  },
};

window.applyTracking = function(url) {
  for (const config of Object.values(TRACKING_CONFIG)) {
    if (url.includes(config.match)) {
      return config.build(config.base, url);
    }
  }
  return url;
};

function initTracking() {
  document.querySelectorAll("a[href]").forEach(a => {
    const tracked = window.applyTracking(a.href);
    if (tracked !== a.href) {
      a.href = tracked;
      a.setAttribute("rel", "sponsored noopener");
      a.setAttribute("target", "_blank");
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initTracking);
} else {
  initTracking();
}

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