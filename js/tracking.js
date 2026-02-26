/**
 * AFFILIATE TRACKING
 * Tilføj nye udbydere i TRACKING_CONFIG – resten sker automatisk.
 */

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
  
    // Tilføj næste udbyder sådan her:
    // telmore: {
    //   match: "telmore.dk",
    //   base: "https://dit-tracking-link-her",
    //   build: (base, url) => `${base}&url=${encodeURIComponent(url)}`,
    // },
  };
  
  /**
   * Returnerer tracked URL hvis udbyderen er konfigureret – ellers original URL.
   * Eksponeret globalt så bundles.js kan kalde den direkte ved rendering.
   */
  function applyTracking(url) {
    if (!url) return url;
    for (const provider of Object.values(TRACKING_CONFIG)) {
      if (url.includes(provider.match)) {
        return provider.build(provider.base, url);
      }
    }
    return url;
  }
  
  // Gør tilgængelig globalt så bundles.js kan bruge den
  window.applyTracking = applyTracking;
  
  /**
   * Kør automatisk på alle <a> tags der matcher en udbyder.
   * Fanger statiske links i HTML – dynamiske links håndteres af bundles.js.
   */
  function initTracking() {
    document.querySelectorAll("a[href]").forEach(a => {
      const tracked = applyTracking(a.href);
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