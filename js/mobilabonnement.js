  // ─── CONFIG ────────────────────────────────────────────────────────────────
var SB_URL  = "https://jrjwronitlemdnctzkdj.supabase.co";
var SB_KEY  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impyandyb25pdGxlbWRuY3R6a2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNDQyMzgsImV4cCI6MjA4ODYyMDIzOH0.rlvdsZZTPfVIsjzq4IzcsIoMqz7DwgcgZP_RkUiwWYc";

var LOGOS = {
  flexii:      "/images/flexii-logo.svg",
  oister:      "/images/oister.svg",
  duka:        "/images/duka-logo.svg",
  eesy:        "images/eesy-logo.svg",
  greentel:    "/images/greentel-logo.png",
  callme:      "/images/call-me.svg",
  "call-me":   "/images/call-me.svg",
  telmore:     "/images/telmore-logo.svg",
  cbb:         "/images/cbb-mobil.png",
  "cbb-mobil": "/images/cbb-mobil.png",
  norlys:      "/images/norlys-logo.svg",
  hiper:       "/images/hiper-logo.png",
  ewii:        "/images/ewii-logo.svg"
};

// ─── STATE ─────────────────────────────────────────────────────────────────
var allPlans = [];
var filters  = { gb:0, maxPrice:300, net:"alle", only5g:false };
var sortBy   = "intro";

// ─── HELPERS ───────────────────────────────────────────────────────────────
function toNum(v) { return parseFloat(v) || 0; }

function parseGb(s) {
  if (!s) return 0;
  if (/fri.?data/i.test(String(s))) return 99999;
  var m = String(s).match(/[\d.]+/);
  return m ? parseFloat(m[0]) : 0;
}

function parseNet(n) {
  if (!n) return "";
  var l = String(n).toLowerCase();
  if (l.indexOf("telenor") !== -1) return "telenor";
  if (l.indexOf("tdc")     !== -1) return "tdc";
  if (l.indexOf("telia")   !== -1) return "telia";
  if (l.indexOf("3")       === 0)  return "3";
  return "";
}

// ─── LAST UPDATED ──────────────────────────────────────────────────────────
function updateLastUpdatedBadge(updatedAt) {
  var badge   = document.getElementById("lastUpdatedBadge");
  var textEl  = document.getElementById("lastUpdatedText");
  var minutesAgo = Math.floor((Date.now() - new Date(updatedAt)) / 60000);
  var hoursAgo   = Math.floor(minutesAgo / 60);
  var daysAgo    = Math.floor(hoursAgo / 24);

  var label;
if (hoursAgo < 1)        label = "Opdateret for " + minutesAgo + " min. siden";
else if (hoursAgo === 1) label = "Opdateret for 1 time siden";
else if (hoursAgo < 24)  label = "Opdateret for " + hoursAgo + " timer siden";
else if (daysAgo === 1)  label = "Opdateret for 1 dag siden";
else                     label = "Opdateret for " + daysAgo + " dage siden";
  textEl.textContent = label;
  badge.classList.remove("loading");

  // Gul dot hvis data er mere end 12 timer gammelt
  if (hoursAgo >= 12) badge.classList.add("stale");
}

// ─── FILTER + SORT ─────────────────────────────────────────────────────────
function applyFilters() {
  return allPlans.filter(function(p) {
    var gb    = parseGb(p.data_amount);
    var price = toNum(p.intro_price_mobile != null ? p.intro_price_mobile : p.mobile_base_price);
    var is5g  = p.network && p.network.indexOf("5G") !== -1;
    var gbOk  = filters.gb === 9999 ? gb >= 9999 : gb >= filters.gb;
    return gbOk
      && price <= filters.maxPrice
      && (filters.net === "alle" || parseNet(p.network) === filters.net)
      && (!filters.only5g || is5g);
  });
}

function sortPlans(arr) {
  return arr.slice().sort(function(a, b) {
    if (sortBy === "intro")  return toNum(a.intro_price_mobile != null ? a.intro_price_mobile : a.mobile_base_price) - toNum(b.intro_price_mobile != null ? b.intro_price_mobile : b.mobile_base_price);
    if (sortBy === "data")   return parseGb(b.data_amount) - parseGb(a.data_amount);
    if (sortBy === "normal") return toNum(a.mobile_base_price) - toNum(b.mobile_base_price);
    return 0;
  });
}

// ─── CARD ──────────────────────────────────────────────────────────────────
function buildCard(p, i) {
  var logo     = LOGOS[p.provider_id] || "";
  var baseP    = toNum(p.mobile_base_price);
  var introP   = p.intro_price_mobile != null ? toNum(p.intro_price_mobile) : null;
  var hasIntro = introP !== null && introP < baseP;
  var is5g     = p.network && p.network.indexOf("5G") !== -1;
  var netLabel = (p.network || "").replace(/\s*\(.*\)/, "").trim();
  var planName = p.name || p.data_amount || "";
  var featured = i === 0 ? " featured" : "";
  var providerLabel = p.provider_id.charAt(0).toUpperCase() + p.provider_id.slice(1).replace(/-/g, " ");

  var logoHtml;
  if (logo) {
    logoHtml = '<div style="display:flex;flex-direction:column;gap:2px;">'
      + '<img src="' + logo + '" alt="' + p.provider_id + '" class="plan-logo" loading="lazy">'
      + '<span style="font-size:11px;color:#6b7280;font-weight:600;">' + planName + '</span>'
      + '</div>';
  } else {
    logoHtml = '<div style="display:flex;flex-direction:column;gap:2px;">'
      + '<span class="plan-logo-fallback">' + providerLabel + '</span>'
      + '<span style="font-size:11px;color:#6b7280;font-weight:600;">' + planName + '</span>'
      + '</div>';
  }

  var introBadgeHtml = hasIntro
    ? '<div class="intro-badge">\uD83D\uDD25 ' + introP + ' kr/md de f\u00F8rste ' + (p.intro_months || "?") + ' mdr.</div>'
    : "";

  var priceHtml = hasIntro
    ? '<div class="plan-price-left"><div class="price-intro-num">' + introP + ' <span>kr/md</span></div><div class="price-after">Herefter ' + baseP + ' kr/md</div></div>'
    : '<div class="plan-price-left"><div class="price-normal-num">' + baseP + ' <span>kr/md</span></div></div>';

  var netBadge  = netLabel ? '<span class="plan-network-badge">' + netLabel + '</span>' : "";
  var g5badge   = is5g     ? '<span class="plan-5g-badge">5G</span>' : "";
  var bindLabel = p.binding_months ? p.binding_months + " mdr" : "Ingen";

  return '<div class="plan-card' + featured + '">'
    + introBadgeHtml
    + '<div class="plan-top">'
    +   logoHtml
    +   '<div>' + netBadge + g5badge + '</div>'
    + '</div>'
    + '<div class="plan-specs">'
    +   '<div class="spec-box"><span class="spec-label">Data DK</span><span class="spec-val">' + (p.data_amount || "\u2013") + '</span></div>'
    +   '<div class="spec-box"><span class="spec-label">Data EU</span><span class="spec-val">' + (p.data_eu || "\u2013") + '</span></div>'
    +   '<div class="spec-box"><span class="spec-label">Binding</span><span class="spec-val">' + bindLabel + '</span></div>'
    + '</div>'
    + '<div class="plan-price-row">' + priceHtml + '</div>'
    + '<div class="plan-meta">'
    +   '<span class="meta-pill">\uD83D\uDCDE Fri tale</span>'
    +   '<span class="meta-pill">\u2709\uFE0F Fri SMS</span>'
    +   '<span class="meta-pill">\uD83D\uDD27 ' + (p.oprettelse || "0 kr.") + '</span>'
    + '</div>'
    + '<a href="' + (p.link || "#") + '" class="plan-btn" target="_blank" rel="sponsored noopener nofollow">G\u00E5 til tilbud \u2192</a>'
    + '<div class="plan-opsigelse">' + (p.opsigelse || "Ingen binding") + '</div>'
    + '</div>';
}

// ─── RENDER ────────────────────────────────────────────────────────────────
function render() {
  var sorted = sortPlans(applyFilters());
  document.getElementById("resultsCount").textContent = sorted.length + " tilbud";
  var html = "";
  for (var i = 0; i < sorted.length; i++) html += buildCard(sorted[i], i);
  document.getElementById("plansList").innerHTML = html || '<div class="empty-state"><p>😕 Ingen tilbud matcher dine filtre</p></div>';
}

// ─── FETCH fra mobile_plans ────────────────────────────────────────────────
function showError(msg) {
  document.getElementById("plansList").innerHTML = '<div class="empty-state"><p>' + msg + '</p></div>';
  document.getElementById("resultsCount").textContent = "Fejl";
  var badge  = document.getElementById("lastUpdatedBadge");
  var textEl = document.getElementById("lastUpdatedText");
  badge.classList.remove("loading");
  badge.classList.add("stale");
  textEl.textContent = "Kunne ikke hente priser";
}

var fetchTimeout = setTimeout(function() {
  showError("⚠️ Timeout — ingen svar fra Supabase. Tjek RLS policies.");
}, 8000);

fetch(SB_URL + "/rest/v1/mobile_plans?status=eq.active&select=*", {
  headers: { "apikey": SB_KEY, "Authorization": "Bearer " + SB_KEY }
})
.then(function(res) {
  clearTimeout(fetchTimeout);
  if (!res.ok) return res.text().then(function(t) { throw new Error("HTTP " + res.status + ": " + t); });
  return res.json();
})
.then(function(data) {
  allPlans = data;
  console.log("Hentet " + allPlans.length + " planer fra mobile_plans");

  if (allPlans.length === 0) {
    showError("⚠️ 0 planer hentet — tjek at RLS policy er gemt, og at der er rækker med status=active");
    return;
  }

  // Find nyeste updated_at og opdater badge
  var newest = data.reduce(function(a, b) {
    return new Date(a.updated_at) > new Date(b.updated_at) ? a : b;
  });
  updateLastUpdatedBadge(newest.updated_at);

  render();
})
.catch(function(err) {
  clearTimeout(fetchTimeout);
  console.error(err);
  showError("⚠️ " + err.message);
});

// ─── EVENTS ────────────────────────────────────────────────────────────────
document.getElementById("dataChips").addEventListener("click", function(e) {
  var c = e.target.closest("[data-gb]");
  if (!c) return;
  var chips = document.querySelectorAll("#dataChips .fchip");
  for (var i=0; i<chips.length; i++) chips[i].classList.remove("active");
  c.classList.add("active");
  filters.gb = parseInt(c.getAttribute("data-gb"), 10);
  render();
});

document.getElementById("netChips").addEventListener("click", function(e) {
  var c = e.target.closest("[data-net]");
  if (!c) return;
  var chips = document.querySelectorAll("#netChips .fchip");
  for (var i=0; i<chips.length; i++) chips[i].classList.remove("active");
  c.classList.add("active");
  filters.net = c.getAttribute("data-net");
  render();
});

document.getElementById("priceSlider").addEventListener("input", function() {
  var v = parseInt(this.value, 10);
  filters.maxPrice = v;
  document.getElementById("priceVal").textContent = v >= 300 ? "Alle priser" : "Op til " + v + " kr";
  render();
});

document.getElementById("tog5g").addEventListener("change", function() {
  filters.only5g = this.checked;
  render();
});

document.getElementById("sortSelect").addEventListener("change", function() {
  sortBy = this.value;
  render();
});