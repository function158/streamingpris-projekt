// ─── CONFIG ────────────────────────────────────────────────────────────────
var SB_URL  = "https://jrjwronitlemdnctzkdj.supabase.co";
var SB_KEY  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impyandyb25pdGxlbWRuY3R6a2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNDQyMzgsImV4cCI6MjA4ODYyMDIzOH0.rlvdsZZTPfVIsjzq4IzcsIoMqz7DwgcgZP_RkUiwWYc";

var LOGOS = {
  flexii:      "/images/flexii-logo.svg",
  oister:      "/images/oister.svg",
  duka:        "/images/duka-logo.svg",
  eesy:        "/images/eesy-logo.svg",
  greentel:    "/images/greentel-logo.png",
  callme:      "/images/call-me.svg",
  "call-me":   "/images/call-me.svg",
  telmore:     "/images/telmore-logo.svg",
  cbb:         "/images/cbb-mobil.png",
  "cbb-mobil": "/images/cbb-mobil.png",
  norlys:      "/images/norlys-logo.svg",
  hiper:       "/images/hiper-logo.png",
  ewii:        "/images/ewii-logo.svg",
  "lyca-mobile":      "/images/lyca-mobil-logo.svg",
  yousee:             "/images/yousee-logo.svg",
  "oister-20-rabat":  "/images/oister.svg",
  "oister-25-rabat":  "/images/oister.svg",
  "lebara-copy":      ""
};

// ─── STATE ─────────────────────────────────────────────────────────────────
var allPlans = [];
var filters  = { gb: 0, maxPrice: 300, net: "alle", only5g: false, binding: "alle", eu: 0 };
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
  var badge      = document.getElementById("lastUpdatedBadge");
  var textEl     = document.getElementById("lastUpdatedText");
  var minutesAgo = Math.floor((Date.now() - new Date(updatedAt)) / 60000);
  var hoursAgo   = Math.floor(minutesAgo / 60);
  var daysAgo    = Math.floor(hoursAgo / 24);
  var label;
  if (hoursAgo < 1)        label = "Opdateret for " + Math.max(1, minutesAgo) + " min. siden";
  else if (hoursAgo === 1) label = "Opdateret for 1 time siden";
  else if (hoursAgo < 24)  label = "Opdateret for " + hoursAgo + " timer siden";
  else if (daysAgo === 1)  label = "Opdateret for 1 dag siden";
  else                     label = "Opdateret for " + daysAgo + " dage siden";
  textEl.textContent = label;
  badge.classList.remove("loading");
  if (hoursAgo >= 12) badge.classList.add("stale");
}

// ─── FILTER + SORT ─────────────────────────────────────────────────────────
function applyFilters() {
  return allPlans.filter(function(p) {
    var gb    = parseGb(p.data_amount);
    var euGb  = parseGb(p.data_eu);   // null/undefined → 0 via parseGb
    var price = (p.intro_price_mobile != null && p.intro_price_mobile > 0) ? toNum(p.intro_price_mobile) : toNum(p.mobile_base_price);
    var is5g  = p.network && p.network.indexOf("5G") !== -1;
    var gbOk  = filters.gb === 9999 ? gb >= 9999 : gb >= filters.gb;
    var euOk  = filters.eu === 0 || euGb >= filters.eu;

    return gbOk
      && euOk
      && price <= filters.maxPrice
      && (filters.net === "alle" || parseNet(p.network) === filters.net)
      && (!filters.only5g || is5g)
      && (filters.binding === "alle" || !p.binding_months);
  });
}

function sortPlans(arr) {
  return arr.slice().sort(function(a, b) {
    if (sortBy === "intro")  return ((a.intro_price_mobile != null && a.intro_price_mobile > 0) ? toNum(a.intro_price_mobile) : toNum(a.mobile_base_price)) - ((b.intro_price_mobile != null && b.intro_price_mobile > 0) ? toNum(b.intro_price_mobile) : toNum(b.mobile_base_price));
    if (sortBy === "data")   return parseGb(b.data_amount) - parseGb(a.data_amount);
    if (sortBy === "normal") return toNum(a.mobile_base_price) - toNum(b.mobile_base_price);
    return 0;
  });
}

// ─── CARD ──────────────────────────────────────────────────────────────────
function buildCard(p, i) {
  var logo          = LOGOS[p.provider_id] || "";
  var baseP         = toNum(p.mobile_base_price);
  var introP        = p.intro_price_mobile != null ? toNum(p.intro_price_mobile) : null;
  var hasIntro      = introP !== null && introP > 0 && introP < baseP;
  var is5g          = p.network && p.network.indexOf("5G") !== -1;
  var netLabel      = (p.network || "").replace(/\s*\(.*\)/, "").trim();
  var planName      = p.name || p.data_amount || "";
  var featured      = i === 0 ? " featured" : "";
  var providerLabel = p.provider_id.charAt(0).toUpperCase() + p.provider_id.slice(1).replace(/-/g, " ");

  var logoHtml = logo
    ? '<div style="display:flex;flex-direction:column;gap:2px;"><img src="' + logo + '" alt="' + p.provider_id + '" class="plan-logo" loading="lazy"><span style="font-size:11px;color:#6b7280;font-weight:600;">' + planName + '</span></div>'
    : '<div style="display:flex;flex-direction:column;gap:2px;"><span class="plan-logo-fallback">' + providerLabel + '</span><span style="font-size:11px;color:#6b7280;font-weight:600;">' + planName + '</span></div>';

  var introBadgeHtml = hasIntro
    ? '<div class="intro-badge">\uD83D\uDD25 ' + introP + ' kr/md de f\u00F8rste ' + (p.intro_months || "?") + ' mdr.</div>'
    : '<div class="intro-badge-placeholder"></div>';

  var priceHtml = hasIntro
    ? '<div class="plan-price-left"><div class="price-intro-num">' + introP + ' <span>kr/md</span></div><div class="price-after">Herefter ' + baseP + ' kr/md</div></div>'
    : '<div class="plan-price-left"><div class="price-normal-num">' + baseP + ' <span>kr/md</span></div></div>';

  var netBadge  = netLabel ? '<span class="plan-network-badge">' + netLabel + '</span>' : "";
  var g5badge   = is5g     ? '<span class="plan-5g-badge">5G</span>' : "";
  var bindLabel = p.binding_months ? p.binding_months + " mdr" : "Ingen";

  var opr    = (p.oprettelse || "0 kr.").toLowerCase().trim();
  var isFree = opr === "0 kr." || opr === "gratis" || opr === "0";
  var oprHtml = isFree
    ? '<span class="meta-pill meta-pill--free">Gratis oprettelse</span>'
    : '<span class="meta-pill">Oprettelse: ' + p.oprettelse + '</span>';

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
    +   oprHtml
    + '</div>'
    + '<a href="' + (p.link || "#") + '" class="plan-btn" target="_blank" rel="sponsored noopener nofollow">G\u00E5 til tilbud \u2192</a>'
    + '<div class="plan-opsigelse">' + (p.opsigelse || "Ingen binding") + '</div>'
    + '</div>';
}

// ─── RENDER ────────────────────────────────────────────────────────────────
var INITIAL_SHOW  = 4;
var LOAD_MORE_STEP = 4;
var shownCount = 0;
var lastSorted = [];

function render() {
  lastSorted = sortPlans(applyFilters());
  shownCount = Math.min(INITIAL_SHOW, lastSorted.length);
  document.getElementById("resultsCount").textContent = lastSorted.length + " tilbud";

  var html = "";
  for (var i = 0; i < shownCount; i++) html += buildCard(lastSorted[i], i);
  document.getElementById("plansList").innerHTML = html || '<div class="empty-state"><p>\uD83D\uDE15 Ingen tilbud matcher dine filtre</p></div>';

  var old = document.getElementById("loadMorePlans");
  if (old) old.remove();

  if (lastSorted.length > shownCount) {
    var btn = document.createElement("button");
    btn.id = "loadMorePlans";
    btn.textContent = "Indl\u00E6s flere tilbud (" + (lastSorted.length - shownCount) + " tilbage) \u25BE";
    btn.style.cssText = "display:block;width:100%;max-width:480px;margin:8px auto 32px;padding:14px 0;background:white;color:#2B3EFF;border:2px solid #2B3EFF;border-radius:14px;font-size:15px;font-weight:700;cursor:pointer;transition:all .2s ease;";
    btn.onmouseenter = function() { btn.style.background = "#eff6ff"; };
    btn.onmouseleave = function() { btn.style.background = "white"; };
    btn.onclick = function() {
      var next = lastSorted.slice(shownCount, shownCount + LOAD_MORE_STEP);
      var list = document.getElementById("plansList");
      for (var i = 0; i < next.length; i++) {
        list.insertAdjacentHTML("beforeend", buildCard(next[i], shownCount + i));
      }
      shownCount += next.length;
      if (shownCount >= lastSorted.length) {
        btn.remove();
      } else {
        btn.textContent = "Indl\u00E6s flere tilbud (" + (lastSorted.length - shownCount) + " tilbage) \u25BE";
      }
    };
    document.getElementById("plansList").insertAdjacentElement("afterend", btn);
  }
}

// ─── GÅ TIL TOPPEN (kun mobil) ────────────────────────────────────────────
(function() {
  var topBtn = document.createElement("button");
  topBtn.id = "scrollTopBtn";
  topBtn.innerHTML = "&#8679; Tilpas filtre";
  topBtn.style.cssText = "display:none;position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#2B3EFF;color:#fff;border:none;border-radius:99px;padding:12px 22px;font-size:14px;font-weight:700;cursor:pointer;box-shadow:0 4px 16px rgba(43,62,255,0.35);z-index:999;";
  document.body.appendChild(topBtn);
  topBtn.addEventListener("click", function() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  window.addEventListener("scroll", function() {
    if (window.innerWidth > 768) { topBtn.style.display = "none"; return; }
    topBtn.style.display = window.scrollY > 600 ? "block" : "none";
  });
})();

// ─── FETCH ────────────────────────────────────────────────────────────────
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
  showError("\u26A0\uFE0F Timeout \u2014 ingen svar fra Supabase.");
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
  allPlans = data.map(function(p) {
    if (p.provider_id === "lyca-mobile") p.network = "Telenor (4G)";
    return p;
  });
  if (allPlans.length === 0) {
    showError("\u26A0\uFE0F 0 planer hentet");
    return;
  }
  var newest = data.reduce(function(a, b) {
    return new Date(a.updated_at) > new Date(b.updated_at) ? a : b;
  });
  updateLastUpdatedBadge(newest.updated_at);
  render();
})
.catch(function(err) {
  clearTimeout(fetchTimeout);
  showError("\u26A0\uFE0F " + err.message);
});

// ─── EVENTS ────────────────────────────────────────────────────────────────
// ─── EVENTS ────────────────────────────────────────────────────────────────
function chipListener(containerId, attr, stateKey, parseAsInt) {
  var el = document.getElementById(containerId);
  if (!el) return; // skip hvis elementet ikke findes
  el.addEventListener("click", function(e) {
    var c = e.target.closest("[" + attr + "]");
    if (!c) return;
    this.querySelectorAll(".mobile-chip").forEach(function(ch) { ch.classList.remove("active"); });
    c.classList.add("active");
    filters[stateKey] = parseAsInt ? parseInt(c.getAttribute(attr), 10) : c.getAttribute(attr);
    render();
  });
}

chipListener("dataChips",    "data-gb",      "gb",      true);
chipListener("euChips",      "data-eu",      "eu",      true);
chipListener("priceChips",   "data-price",   "maxPrice",true);
chipListener("netChips",     "data-net",     "net",     false);
chipListener("bindingChips", "data-binding", "binding", false);

var tog5g = document.getElementById("tog5g");
if (tog5g) tog5g.addEventListener("change", function() {
  filters.only5g = this.checked;
  render();
});

var sortChips = document.getElementById("sortChips");
if (sortChips) sortChips.addEventListener("click", function(e) {
  var c = e.target.closest("[data-sort]");
  if (!c) return;
  document.querySelectorAll("#sortChips .sort-chip").forEach(function(ch) { ch.classList.remove("active"); });
  c.classList.add("active");
  sortBy = c.getAttribute("data-sort");
  render();
});

var filterToggle = document.getElementById("filterToggle");
if (filterToggle) filterToggle.addEventListener("click", function() {
  document.querySelector(".filter-panel").classList.toggle("open");
});

var resetBtn = document.getElementById("resetFilters");
if (resetBtn) resetBtn.addEventListener("click", function() {
  filters = { gb: 0, maxPrice: 300, net: "alle", only5g: false, binding: "alle", eu: 0 };
  ["dataChips","priceChips","netChips","bindingChips"].forEach(function(id) {
    var chips = document.querySelectorAll("#" + id + " .mobile-chip");
    for (var i = 0; i < chips.length; i++) chips[i].classList.remove("active");
    if (chips[0]) chips[0].classList.add("active");
  });
  render();
});