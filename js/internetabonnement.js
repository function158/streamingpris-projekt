// ─── CONFIG ────────────────────────────────────────────────────────────────
var ADTRACTION_URL    = "https://api.adtraction.com/v3/public/data/dk/broadband?channelId=2050148986";
var TJEKDITNET_UID    = "140426";
var TJEKDITNET_BASE   = "https://tjekditnet.dk/pls/wopdprod/tdn_feed_provider";
var DAWA_AUTOCOMPLETE = "https://api.dataforsyningen.dk/adresser/autocomplete";
var BBR_URL           = "https://api.dataforsyningen.dk/bbrlight/bygninger";

var LOGOS = {
  "cbb":     "/images/cbb-mobil.png",
  "duka":    "/images/duka-logo.svg",
  "hiper":   "/images/hiper-logo.png",
  "norlys":  "/images/norlys-logo.svg",
  "oister":  "/images/oister.svg",
  "telmore": "/images/telmore-logo.svg",
  "yousee":  "/images/yousee-logo.svg",
  "ewii":    "/images/ewii-logo.svg",
  "tdc":     "/images/eesy-logo.svg",
  "callme":  "/images/call-me.svg",
  "3":       "/images/3-logo.svg"
};

// ─── STATE ─────────────────────────────────────────────────────────────────
var allPlans       = [];
var availableTypes = null; // null = no filter yet, array = types from Tjekditnet
var filters        = { maxPrice: 9999, binding: "alle" };
var sortBy         = "price";

var INITIAL_SHOW   = 4;
var LOAD_MORE_STEP = 4;
var shownCount     = 0;
var lastSorted     = [];

// ─── HELPERS ───────────────────────────────────────────────────────────────
function toNum(v) { return parseFloat(v) || 0; }

function normalizeConn(conn) {
  if (!conn) return "other";
  var c = conn.toLowerCase();
  if (c.indexOf("fiber") !== -1) return "fiber";
  if (c.indexOf("5g")    !== -1) return "5g";
  if (c.indexOf("4g")    !== -1) return "4g";
  if (c.indexOf("coax")  !== -1 || c.indexOf("kabel") !== -1) return "coax";
  return "other";
}

function getLogo(provider) {
  if (!provider) return "";
  var key = provider.toLowerCase().replace(/\s+/g,"").replace(/-/g,"");
  if (LOGOS[key]) return LOGOS[key];
  for (var k in LOGOS) {
    if (key.indexOf(k) !== -1 || k.indexOf(key) !== -1) return LOGOS[k];
  }
  return "";
}

function hasPromo(p) { return !!p.promotion; }

function getIntroPrice(p) {
  if (!hasPromo(p)) return null;
  if (p.discountPriceFrom > 0) return p.discountPriceFrom;
  if (p.discountPriceFrom === 0) return 0;
  return null;
}

function getSortPrice(p) {
  var intro = getIntroPrice(p);
  if (intro !== null && intro > 0) return intro;
  return p.priceFrom;
}

function connLabel(conn) {
  var c = (conn || "").toLowerCase();
  if (c.indexOf("fiber") !== -1) return "Fiber";
  if (c.indexOf("5g")    !== -1) return "5G";
  if (c.indexOf("4g")    !== -1) return "4G";
  if (c.indexOf("coax")  !== -1 || c.indexOf("kabel") !== -1) return "Coax";
  return conn || "";
}

// ─── TJEKDITNET PARSER ─────────────────────────────────────────────────────
function parseTjekditnetTypes(data) {
  var seen  = {};
  var types = [];
  var daekninger = data.daekninger || [];
  for (var i = 0; i < daekninger.length; i++) {
    var list = daekninger[i].daekning || [];
    for (var j = 0; j < list.length; j++) {
      var tek = (list[j].teknologi || "").toLowerCase();
      var add = function(t) { if (!seen[t]) { seen[t] = true; types.push(t); } };
      if (tek === "fiber")           add("fiber");
      if (tek === "kabel-tv")        add("coax");
      if (tek === "xdsl")            add("xdsl");
      if (tek === "mobilt bredbånd") { add("5g"); add("4g"); }
    }
  }
  return types;
}

// ─── FILTER + SORT ─────────────────────────────────────────────────────────
function applyFilters() {
  return allPlans.filter(function(p) {
    var connType = normalizeConn(p.connection);
    var price    = getSortPrice(p);
    var binding  = toNum(p.bindingMonth);

    // address coverage filter
    if (availableTypes !== null) {
      var ok = false;
      for (var i = 0; i < availableTypes.length; i++) {
        if (availableTypes[i] === connType) { ok = true; break; }
      }
      if (!ok) return false;
    } else {
      // no address yet: only show 5G and 4G (nationwide)
      if (connType !== "5g" && connType !== "4g") return false;
    }

    if (price > filters.maxPrice) return false;
    if (filters.binding === "ingen" && binding > 0) return false;
    return true;
  });
}

var CONN_PRIORITY = { fiber: 0, coax: 1, "5g": 2, "4g": 3, other: 4 };

function connPriority(p) {
  // When address is entered, rank by best connection type first
  if (availableTypes === null) return 0;
  var t = normalizeConn(p.connection);
  return CONN_PRIORITY[t] !== undefined ? CONN_PRIORITY[t] : 4;
}

function sortPlans(arr) {
  return arr.slice().sort(function(a, b) {
    // Primary: connection type quality (fiber > coax > 5g > 4g)
    var cp = connPriority(a) - connPriority(b);
    if (cp !== 0) return cp;
    // Secondary: user-selected sort
    if (sortBy === "price") return getSortPrice(a) - getSortPrice(b);
    if (sortBy === "speed") return toNum(b.speedDownloadMB) - toNum(a.speedDownloadMB);
    return 0;
  });
}

// ─── CARD ──────────────────────────────────────────────────────────────────
function buildCard(p, i) {
  var logo      = getLogo(p.provider);
  var connType  = normalizeConn(p.connection);
  var featured  = i === 0 ? " featured" : "";
  var introP    = getIntroPrice(p);
  var normalP   = p.priceFrom;
  var binding   = toNum(p.bindingMonth);
  var initFee   = toNum(p.initialFee);

  var logoHtml = logo
    ? '<img src="' + logo + '" alt="' + (p.provider||"") + '" class="inet-logo" loading="lazy">'
    : '<span class="inet-logo-fallback">' + (p.provider || p.unitName || "") + '</span>';

  var promoBadge = hasPromo(p)
    ? '<div class="inet-promo-badge">🔥 ' + p.promotion + '</div>'
    : '<div class="inet-promo-placeholder"></div>';

  var priceHtml;
  if (introP !== null) {
    priceHtml = '<div class="inet-price-col">'
      + '<div class="inet-intro-price">' + introP + ' <span>kr/md</span></div>'
      + '<div class="inet-price-after">Herefter ' + normalP + ' kr/md</div>'
      + '</div>';
  } else {
    priceHtml = '<div class="inet-price-col">'
      + '<div class="inet-normal-price">' + normalP + ' <span>kr/md</span></div>'
      + '</div>';
  }

  var initLabel = initFee > 0
    ? '<span class="inet-usp">Oprettelse: ' + initFee + ' kr.</span>'
    : '<span class="inet-usp free">Gratis oprettelse</span>';

  var usps = [p.usp1, p.usp2, p.usp3].filter(Boolean).map(function(u) {
    return '<span class="inet-usp">' + u + '</span>';
  }).join("");

  var dlSpeed = p.speedDownloadMB ? p.speedDownloadMB + " Mbit/s" : "–";
  var ulSpeed = p.speedUploadMB   ? p.speedUploadMB   + " Mbit/s" : "–";
  var bindLabel = binding > 0 ? binding + " mdr. binding" : "Ingen binding";

  return '<div class="inet-card' + featured + '">'
    + promoBadge
    + '<div class="inet-card-top">'
    +   '<div class="inet-provider-col">'
    +     logoHtml
    +     (p.campaign ? '<span class="inet-campaign">' + p.campaign + '</span>' : '')
    +   '</div>'
    +   '<span class="inet-conn-badge ' + connType + '">' + connLabel(p.connection) + '</span>'
    + '</div>'
    + '<div class="inet-specs">'
    +   '<div class="inet-spec"><span class="inet-spec-label">Download</span><span class="inet-spec-val">' + dlSpeed + '</span></div>'
    +   '<div class="inet-spec"><span class="inet-spec-label">Upload</span><span class="inet-spec-val">' + ulSpeed + '</span></div>'
    +   '<div class="inet-spec"><span class="inet-spec-label">Binding</span><span class="inet-spec-val">' + (binding > 0 ? binding + " mdr" : "Ingen") + '</span></div>'
    + '</div>'
    + '<div class="inet-price-row">' + priceHtml + '</div>'
    + '<div class="inet-usps">' + initLabel + usps + '</div>'
    + '<a href="' + (p.trackingURL||"#") + '" class="inet-btn" target="_blank" rel="sponsored noopener nofollow">Gå til tilbud →</a>'
    + '<div class="inet-binding-note">' + bindLabel + '</div>'
    + '</div>';
}

// ─── RENDER ────────────────────────────────────────────────────────────────
function render() {
  lastSorted = sortPlans(applyFilters());
  shownCount = Math.min(INITIAL_SHOW, lastSorted.length);
  document.getElementById("resultsCount").textContent = lastSorted.length + " tilbud";

  var html = "";
  for (var i = 0; i < shownCount; i++) html += buildCard(lastSorted[i], i);
  document.getElementById("plansList").innerHTML = html
    || '<div class="inet-empty"><p>😕 Ingen tilbud matcher dine filtre</p></div>';

  var old = document.getElementById("loadMoreBtn");
  if (old) old.remove();

  if (lastSorted.length > shownCount) {
    var btn = document.createElement("button");
    btn.id = "loadMoreBtn";
    btn.textContent = "Indlæs flere tilbud (" + (lastSorted.length - shownCount) + " tilbage) ▾";
    btn.style.cssText = "display:block;width:100%;max-width:480px;margin:8px auto 32px;padding:14px 0;background:white;color:#1A4F8B;border:2px solid #1A4F8B;border-radius:14px;font-size:15px;font-weight:700;cursor:pointer;transition:all .2s;";
    btn.onmouseenter = function() { btn.style.background = "#eff6ff"; };
    btn.onmouseleave = function() { btn.style.background = "white"; };
    btn.onclick = function() {
      var next = lastSorted.slice(shownCount, shownCount + LOAD_MORE_STEP);
      var list = document.getElementById("plansList");
      for (var i = 0; i < next.length; i++) {
        list.insertAdjacentHTML("beforeend", buildCard(next[i], shownCount + i));
      }
      shownCount += next.length;
      if (shownCount >= lastSorted.length) btn.remove();
      else btn.textContent = "Indlæs flere tilbud (" + (lastSorted.length - shownCount) + " tilbage) ▾";
    };
    document.getElementById("plansList").insertAdjacentElement("afterend", btn);
  }
}

// ─── LAST UPDATED ──────────────────────────────────────────────────────────
function updateLastUpdated(isoDate) {
  var badge  = document.getElementById("lastUpdatedBadge");
  var textEl = document.getElementById("lastUpdatedText");
  var h = Math.floor((Date.now() - new Date(isoDate)) / 3600000);
  var d = Math.floor(h / 24);
  var label = h < 1 ? "Opdateret for under 1 time siden"
    : h === 1 ? "Opdateret for 1 time siden"
    : h < 24  ? "Opdateret for " + h + " timer siden"
    : d === 1 ? "Opdateret for 1 dag siden"
    : "Opdateret for " + d + " dage siden";
  textEl.textContent = label;
  badge.classList.remove("loading");
  if (h >= 12) badge.classList.add("stale");
}

// ─── COVERAGE UI ───────────────────────────────────────────────────────────
var COV_MAP = {
  fiber: { label: "Fiber",  cls: "inet-cov-chip fiber" },
  "5g":  { label: "5G",    cls: "inet-cov-chip fiveg" },
  "4g":  { label: "4G",    cls: "inet-cov-chip fourg" },
  coax:  { label: "Coax",  cls: "inet-cov-chip coax"  }
};

function showCoverage(types) {
  document.getElementById("coverageLoading").style.display = "none";
  var wrap  = document.getElementById("coverageWrap");
  var chips = document.getElementById("coverageChips");
  wrap.style.display = "block";

  if (!types || types.length === 0) {
    chips.innerHTML = '<span class="inet-cov-chip none">Ingen bredbåndsdækning fundet</span>';
    return;
  }

  var order = ["fiber", "coax", "5g", "4g"];
  var html  = "";
  for (var i = 0; i < order.length; i++) {
    var t = order[i];
    if (types.indexOf(t) !== -1) {
      html += '<span class="' + COV_MAP[t].cls + '">✓ ' + COV_MAP[t].label + '</span>';
    }
  }
  chips.innerHTML = html;
}

// ─── TJEKDITNET ────────────────────────────────────────────────────────────
function lookupCoverage(husnummerId) {
  document.getElementById("coverageLoading").style.display = "block";
  document.getElementById("coverageWrap").style.display    = "none";

  var url = TJEKDITNET_BASE + "?uid=" + TJEKDITNET_UID
    + "&adgadrid=" + encodeURIComponent(husnummerId) + "&format=json";

  fetch(url)
    .then(function(r) { if (!r.ok) throw new Error(); return r.json(); })
    .then(function(data) {
      availableTypes = parseTjekditnetTypes(data);
      showCoverage(availableTypes);
      render();
    })
    .catch(function() {
      // CORS fallback: show all plans
      availableTypes = ["fiber","coax","5g","4g"];
      document.getElementById("coverageLoading").style.display = "none";
      document.getElementById("coverageWrap").style.display    = "block";
      document.getElementById("coverageChips").innerHTML =
        '<span class="inet-cov-chip none">Dækning kunne ikke hentes — viser alle tilbud</span>';
      render();
    });
}

// ─── BBR LOOKUP ────────────────────────────────────────────────────────────
var BBR_TYPE_MAP = {
  "110": "Stuehus", "120": "Parcelhus", "121": "Parcelhus", "122": "Parcelhus",
  "130": "Rækkehus", "131": "Dobbelthus", "132": "Dobbelthus",
  "140": "Lejlighed", "150": "Kollegium", "160": "Midlertidig bolig",
  "190": "Bolig", "510": "Sommerhus", "585": "Anneks",
  "910": "Sommerhus", "920": "Sommerhus"
};

function lookupBBR(adgangsadresseid) {
  fetch(BBR_URL + "?adgangsadresseid=" + encodeURIComponent(adgangsadresseid))
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (!data || !data.length) return;
      var b = data[0];
      var typeCode = b.BYG_ANVEND_KODE || b.byg_anvend_kode || "";
      var areal    = b.BEBO_ARL        || b.bebo_arl        || 0;
      var typeLabel = BBR_TYPE_MAP[String(typeCode)] || null;

      var strip = document.getElementById("propertyStrip");
      var typeEl = document.getElementById("propertyType");
      var areaEl = document.getElementById("propertyArea");
      var areaDivider = document.getElementById("propertyAreaDivider");

      if (!typeLabel && !areal) return;

      if (typeLabel) {
        typeEl.textContent = typeLabel;
        typeEl.closest(".inet-prop-item").style.display = "";
      } else {
        typeEl.closest(".inet-prop-item").style.display = "none";
      }

      if (areal > 0) {
        areaEl.textContent = areal + " kvm";
        areaEl.closest(".inet-prop-item").style.display = "";
        if (areaDivider) areaDivider.style.display = typeLabel ? "" : "none";
      } else {
        areaEl.closest(".inet-prop-item").style.display = "none";
        if (areaDivider) areaDivider.style.display = "none";
      }

      strip.style.display = "flex";
    })
    .catch(function() { /* silent fail */ });
}

// ─── ADDRESS AUTOCOMPLETE ──────────────────────────────────────────────────
var debounceTimer    = null;
var highlightedIndex = 0;

function getItems() {
  return document.querySelectorAll("#addressDropdown .inet-dropdown-item");
}

function setHighlight(index) {
  var items = getItems();
  if (!items.length) return;
  highlightedIndex = Math.max(0, Math.min(index, items.length - 1));
  items.forEach(function(el, i) {
    el.classList.toggle("highlighted", i === highlightedIndex);
  });
}

function selectItem(item) {
  if (!item) return;
  var id  = item.getAttribute("data-id");
  var txt = item.getAttribute("data-txt");
  var input    = document.getElementById("addressInput");
  var dropdown = document.getElementById("addressDropdown");
  var clearBtn = document.getElementById("addressClear");
  input.value = txt;
  dropdown.style.display = "none";
  clearBtn.style.display = "block";
  if (id) {
    lookupCoverage(id);
    lookupBBR(id);
  }
}

function setupAddress() {
  var input    = document.getElementById("addressInput");
  var dropdown = document.getElementById("addressDropdown");
  var clearBtn = document.getElementById("addressClear");

  input.addEventListener("input", function() {
    var q = input.value.trim();
    clearTimeout(debounceTimer);
    clearBtn.style.display = q.length > 0 ? "block" : "none";
    if (q.length < 2) { dropdown.style.display = "none"; return; }

    debounceTimer = setTimeout(function() {
      fetch(DAWA_AUTOCOMPLETE + "?q=" + encodeURIComponent(q) + "&per_side=6&caretpos=" + q.length)
        .then(function(r) { return r.json(); })
        .then(function(results) {
          if (!results || !results.length) { dropdown.style.display = "none"; return; }
          var html = "";
          for (var i = 0; i < results.length; i++) {
            var r   = results[i];
            var txt = r.tekst || "";
            var id  = r.adresse && r.adresse.adgangsadresseid ? r.adresse.adgangsadresseid : "";
            html += '<div class="inet-dropdown-item" data-id="' + id + '" data-txt="' + txt.replace(/"/g,"&quot;") + '">' + txt + '</div>';
          }
          dropdown.innerHTML = html;
          dropdown.style.display = "block";
          // auto-highlight første resultat
          highlightedIndex = 0;
          setHighlight(0);
        })
        .catch(function() { dropdown.style.display = "none"; });
    }, 150);
  });

  input.addEventListener("keydown", function(e) {
    if (dropdown.style.display === "none") return;
    var items = getItems();
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight(highlightedIndex + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight(highlightedIndex - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      selectItem(items[highlightedIndex]);
    } else if (e.key === "Escape") {
      dropdown.style.display = "none";
    }
  });

  dropdown.addEventListener("click", function(e) {
    var item = e.target.closest(".inet-dropdown-item");
    if (item) selectItem(item);
  });

  clearBtn.addEventListener("click", function() {
    input.value = "";
    dropdown.style.display = "none";
    clearBtn.style.display = "none";
    availableTypes = null;
    document.getElementById("coverageWrap").style.display    = "none";
    document.getElementById("coverageLoading").style.display = "none";
    document.getElementById("propertyStrip").style.display   = "none";
    render();
  });

  document.addEventListener("click", function(e) {
    if (!input.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.style.display = "none";
    }
  });
}

// ─── PRICE CHIPS ───────────────────────────────────────────────────────────
function setupPriceChips() {
  var chips       = document.getElementById("priceChips");
  var customWrap  = document.getElementById("customPriceWrap");
  var customInput = document.getElementById("customPriceInput");

  chips.addEventListener("click", function(e) {
    var c = e.target.closest("[data-price]");
    if (!c) return;
    chips.querySelectorAll(".mobile-chip").forEach(function(ch) { ch.classList.remove("active"); });
    c.classList.add("active");
    var val = c.getAttribute("data-price");
    if (val === "custom") {
      customWrap.style.display = "block";
      filters.maxPrice = 9999;
      customInput.focus();
    } else {
      customWrap.style.display = "none";
      filters.maxPrice = parseInt(val, 10);
      render();
    }
  });

  customInput.addEventListener("input", function() {
    var v = parseInt(this.value, 10);
    filters.maxPrice = v > 0 ? v : 9999;
    render();
  });
}

// ─── BINDING CHIPS ─────────────────────────────────────────────────────────
function setupBindingChips() {
  var chips = document.getElementById("bindingChips");
  chips.addEventListener("click", function(e) {
    var c = e.target.closest("[data-binding]");
    if (!c) return;
    chips.querySelectorAll(".data-chip").forEach(function(ch) { ch.classList.remove("active"); });
    c.classList.add("active");
    filters.binding = c.getAttribute("data-binding");
    render();
  });
}

// ─── SORT CHIPS ────────────────────────────────────────────────────────────
function setupSortChips() {
  document.getElementById("sortChips").addEventListener("click", function(e) {
    var c = e.target.closest("[data-sort]");
    if (!c) return;
    document.querySelectorAll(".inet-sort-chip").forEach(function(ch) { ch.classList.remove("active"); });
    c.classList.add("active");
    sortBy = c.getAttribute("data-sort");
    render();
  });
}

// ─── SCROLL TO TOP (mobil) ─────────────────────────────────────────────────
(function() {
  var btn = document.createElement("button");
  btn.innerHTML = "↑ Filtrer";
  btn.style.cssText = "display:none;position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#1A4F8B;color:#fff;border:none;border-radius:99px;padding:12px 22px;font-size:14px;font-weight:700;cursor:pointer;box-shadow:0 4px 16px rgba(26,79,139,0.35);z-index:999;";
  document.body.appendChild(btn);
  btn.addEventListener("click", function() { window.scrollTo({ top: 0, behavior: "smooth" }); });
  window.addEventListener("scroll", function() {
    if (window.innerWidth > 768) { btn.style.display = "none"; return; }
    btn.style.display = window.scrollY > 600 ? "block" : "none";
  });
})();

// ─── ERROR ─────────────────────────────────────────────────────────────────
function showError(msg) {
  document.getElementById("plansList").innerHTML = '<div class="inet-empty"><p>' + msg + '</p></div>';
  document.getElementById("resultsCount").textContent = "Fejl";
  var badge = document.getElementById("lastUpdatedBadge");
  badge.classList.remove("loading"); badge.classList.add("stale");
  document.getElementById("lastUpdatedText").textContent = "Kunne ikke hente priser";
}

// ─── FETCH ─────────────────────────────────────────────────────────────────
var CACHE_KEY = "inet_plans_cache";
var CACHE_TTL = 60 * 60 * 1000; // 1 time

function applyData(data) {
  allPlans = data.units || [];
  if (!allPlans.length) { showError("⚠️ Ingen tilbud fundet"); return; }
  updateLastUpdated(data.lastUpdated);
  render();
  setupAddress();
  setupPriceChips();
  setupBindingChips();
  setupSortChips();
}

// Vis cached data straks hvis den findes og er < 1 time gammel
try {
  var cached = JSON.parse(localStorage.getItem(CACHE_KEY));
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    applyData(cached.data);
  }
} catch (e) {}

// Hent altid friske data i baggrunden
var fetchTimeout = setTimeout(function() {
  if (!allPlans.length) showError("⚠️ Timeout — prøv igen.");
}, 8000);

fetch(ADTRACTION_URL)
  .then(function(r) {
    clearTimeout(fetchTimeout);
    if (!r.ok) throw new Error("HTTP " + r.status);
    return r.json();
  })
  .then(function(data) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: data }));
    } catch (e) {}
    applyData(data);
  })
  .catch(function(err) {
    clearTimeout(fetchTimeout);
    if (!allPlans.length) showError("⚠️ " + err.message);
  });
