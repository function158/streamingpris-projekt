const SERVICE_ICONS = {
    'netflix':        './images/netflix-icon.svg',
    'disney':         './images/disney-plus-icon.svg',
    'amazon-prime':   './images/amazon-prime-video-icon.svg',
    'max':            './images/hbo-max-logo.svg',
    'tv2play':        './images/tv2play-icon.svg',
    'viaplay':        './images/viaplay-icon.svg',
    'deezer':         './images/deezer-icon.svg',
    'podimo':         './images/podimo-icon.svg',
    'mofibo':         './images/mofibo-icon.svg',
    'nordiskfilmplus':'./images/nordisk-film-plus-icon.svg',
    'saxo':           './images/saxo-icon.svg',
    'skyshowtime':    './images/skyshowtime.svg',
    'telmore-musik':  './images/telmore-logo.svg',
  };
  
  function getServiceIcon(id) {
    return SERVICE_ICONS[id] || getServiceLogo(id);
  }
  
  // ─── SUPABASE CONFIG ─────────────────────────────────────────────────────────
  const SUPABASE_URL  = 'https://jrjwronitlemdnctzkdj.supabase.co';
  const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impyandyb25pdGxlbWRuY3R6a2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNDQyMzgsImV4cCI6MjA4ODYyMDIzOH0.rlvdsZZTPfVIsjzq4IzcsIoMqz7DwgcgZP_RkUiwWYc';
  const SB_HEADERS    = { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` };
  
  let providersData = [];
  
  async function fetchProviders() {
      try {
          const [jsonRes, sbRes] = await Promise.all([
              fetch('./data/providers.json'),
              fetch(
                  `${SUPABASE_URL}/rest/v1/plans` +
                  `?select=*,plan_streaming_options(*)` +
                  `&type=eq.fixed` +
                  `&status=eq.active`,
                  { headers: SB_HEADERS }
              )
          ]);
  
          if (!jsonRes.ok) throw new Error(`providers.json fejlede: ${jsonRes.status}`);
          if (!sbRes.ok)   throw new Error(`Supabase fejlede: ${sbRes.status}`);
  
          const jsonProviders = await jsonRes.json();
          const sbPlans       = await sbRes.json();
  
          const providerMap = {};
          sbPlans.forEach(plan => {
              const pid = plan.provider_id;
              if (!providerMap[pid]) providerMap[pid] = { bundles: [] };
  
              const streamingIncluded = (plan.plan_streaming_options || []).map(opt => ({
                  id: opt.service_id,
                  valgmuligheder: [{
                      label:              opt.label,
                      planIndex:          opt.plan_index,
                      partnerNormalPrice: opt.partner_normal_price  ?? 0,
                      ...(opt.partner_intro_price  != null && { partnerIntroPrice:  opt.partner_intro_price }),
                      ...(opt.partner_intro_months != null && { partnerIntroMonths: opt.partner_intro_months }),
                      ...(opt.upgrade_price        != null && { upgradePrice:       opt.upgrade_price }),
                      ...(opt.price_after          != null && { priceAfter:         opt.price_after }),
                  }]
              }));
  
              providerMap[pid].bundles.push({
                  id:               plan.id,
                  name:             plan.name,
                  type:             'fixed',
                  dataAmount:       plan.data_amount,
                  dataEU:           plan.data_eu        || '',
                  mobileBasePrice:  plan.mobile_base_price,
                  ...(plan.intro_price_mobile != null && { introPriceMobile: plan.intro_price_mobile }),
                  ...(plan.intro_months       != null && { introMonths:      plan.intro_months }),
                  ...(plan.expiry_date        != null && { expiryDate:       plan.expiry_date }),
                  newCustomersOnly: plan.new_customers_only || false,
                  link:             plan.link || '',
                  streamingIncluded,
                  details: {
                      oprettelse: plan.oprettelse || '0 kr.',
                      opsigelse:  plan.opsigelse  || 'Ingen binding',
                  }
              });
          });
  
          let sbProviders = [];
          const providerIds = Object.keys(providerMap);
          if (providerIds.length > 0) {
              const ids = providerIds.map(id => `"${id}"`).join(',');
              const provRes = await fetch(
                  `${SUPABASE_URL}/rest/v1/providers?id=in.(${ids})`,
                  { headers: SB_HEADERS }
              );
              if (provRes.ok) {
                  const provMeta = await provRes.json();
                  sbProviders = provMeta.map(p => ({
                      name:    p.name    || p.id,
                      logo:    p.logo_url || '',
                      network: p.network  || '',
                      bundles: providerMap[p.id]?.bundles || []
                  })).filter(p => p.bundles.length > 0);
              }
          }
  
          providersData = [...jsonProviders, ...sbProviders];
  
      } catch (e) {
          console.error('fetchProviders fejl:', e);
          try {
              const res = await fetch('./data/providers.json');
              if (res.ok) providersData = await res.json();
          } catch (e2) {
              console.error('JSON fallback fejlede også:', e2);
              providersData = [];
          }
      }
  }

  // ─── SERVICE HELPERS ─────────────────────────────────────────────────────────
  
  function getService(id) {
      if (!window.services) return null;
      return window.services.find(x => x.id === id) || null;
  }
  
  function getServiceLogo(id) {
      const s = getService(id);
      return s ? s.logo : '';
  }
  
  function getServicePlan(id, planIndex) {
      const s = getService(id);
      if (!s) return null;
      return s.plans[planIndex] || s.plans[0];
  }
  
  function normalizeEntry(entry) {
      if (typeof entry === 'string') return { id: entry, planIndex: 0 };
      if (entry.valgmuligheder && entry.valgmuligheder.length > 0) {
          return { ...entry, _aktivtValg: entry._aktivtValg ?? 0 };
      }
      return entry;
  }
  
  function normalizeIncluded(streamingIncluded) {
      return streamingIncluded.map(normalizeEntry);
  }
  
  function resolveEntry(entry) {
      if (entry.valgmuligheder) {
          const valg = entry.valgmuligheder[entry._aktivtValg ?? 0];
          return { id: entry.id, ...valg };
      }
      return entry;
  }
  
  function getServiceBundlePrice(entry) {
      const resolved  = resolveEntry(entry);
      const plan      = getServicePlan(resolved.id, resolved.planIndex ?? 0);
      const listPrice = plan ? plan.price : 0;
  
      if (resolved.partnerIntroPrice !== undefined) {
          return {
              normalPrice: resolved.partnerNormalPrice ?? listPrice,
              introPrice:  resolved.partnerIntroPrice,
              introMonths: resolved.partnerIntroMonths ?? 1,
              hasIntro:    true
          };
      }
      if (resolved.partnerNormalPrice !== undefined) {
          return { normalPrice: resolved.partnerNormalPrice, introPrice: null, introMonths: null, hasIntro: false };
      }
      return { normalPrice: listPrice, introPrice: null, introMonths: null, hasIntro: false };
  }
  
  // ─── UDLØBSDATO ──────────────────────────────────────────────────────────────
  
  function getExpiryLabel(dateString) {
      if (!dateString) return null;
      const expiry    = new Date(dateString);
      const diffDays  = Math.ceil((expiry - new Date()) / (1000 * 60 * 60 * 24));
      if (diffDays < 0) return null;
      const formatted = expiry.toLocaleDateString('da-DK', { day: 'numeric', month: 'long' });
      if (diffDays <= 2) return `<span style="color:#dc2626;font-weight:700;">⚠️ Udløber meget snart (${formatted})</span>`;
      if (diffDays <= 7) return `<span style="color:#d97706;font-weight:700;">⏳ Udløber snart (${formatted})</span>`;
      return `<span style="color:#6b7280;">Tilbuddet gælder til ${formatted}</span>`;
  }
  
  // ─── BEREGNING ────────────────────────────────────────────────────────────────
  //
  // VIGTIG DESIGNBESLUTNING — to savings-baselines:
  //
  //   "har"-mode  → sammenlign mod currentCostForCovered (hvad brugeren betaler I DAG
  //                 for de tjenester bundlen dækker, aflæst fra window.selected).
  //                 Bruges til: totalSavings, yearlySavings, filter og sortering.
  //                 Effekt: besparelsen ændrer sig KORREKT når brugeren skifter pakke
  //                 i dropdown'en inde i kortet — fordi bundlens pris stiger/falder
  //                 mens baseline forbliver stabil (brugerens nuværende udgift).
  //
  //   "vil"-mode  → sammenlign mod separateCost (markedsprisen for præcis den pakke
  //                 bundlen aktuelt viser i dropdown'en).
  //                 Bruges til: extraIfSeparate, extraIfSeparateYearly, vil-sortering.
  //                 Effekt: viser hvad det ville koste at købe den valgte pakke separat.
  //
  // Alle tre beregnere returnerer begge sæt, så buildHarSavingsBox og buildVilSavingsBox
  // bruger det rette tal automatisk.
  // ─────────────────────────────────────────────────────────────────────────────

  // ─── FÆLLES HJÆLPER ──────────────────────────────────────────────────────────
  
  function calcBaseCosts(coveredEntries, selectedServices) {
      let currentCostForCovered = 0;
      let separateCost = 0;
      coveredEntries.forEach(entry => {
          const id       = entry.id;
          const resolved = resolveEntry(entry);
          // separateCost: markedsprisen for den pakke bundlen aktuelt viser (bruges til vil-mode).
          // Brug partnerNormalPrice hvis det er sat og > 0, ellers listpris fra services.json.
          const bundlePlan = getServicePlan(id, resolved.planIndex ?? 0);
          const listPrice  = bundlePlan ? bundlePlan.price : 0;
          separateCost += (resolved.partnerNormalPrice !== undefined && resolved.partnerNormalPrice > 0)
              ? resolved.partnerNormalPrice
              : listPrice;
          // currentCostForCovered: hvad brugeren betaler I DAG (stable baseline til har-mode).
          if (selectedServices[id]) {
              currentCostForCovered += selectedServices[id].price;
          }
      });
      return { currentCostForCovered, separateCost };
  }
  
  // ─── BEREGNER: Norlys Pick-One ────────────────────────────────────────────────
  
  function calculateNorlysPickOne(bundle, coveredEntries, selectedServices, currentMobile) {
      const { currentCostForCovered, separateCost } = calcBaseCosts(coveredEntries, selectedServices);
  
      const freeMonths   = bundle.freeStreamingMonths || 6;
      const pickOneIds   = (bundle.freeStreamingPickOne || []).map(e => e.id);
      const pickOneEntry = coveredEntries.find(e => pickOneIds.includes(e.id));
      const addonEntries = coveredEntries.filter(e => e !== pickOneEntry);
  
      let pickOneNormalPrice = 0;
      if (pickOneEntry) {
          const resolved = resolveEntry(pickOneEntry);
          const plan     = getServicePlan(pickOneEntry.id, resolved.planIndex ?? 0);
          pickOneNormalPrice = resolved.priceAfter ?? resolved.partnerNormalPrice ?? (plan ? plan.price : 0);
      }
  
      let addonNormalPrice = 0;
      let addonIntroPrice  = 0;
      let addonHasIntro    = false;
      let addonIntroMonths = null;
      addonEntries.forEach(entry => {
          const p = getServiceBundlePrice(entry);
          addonNormalPrice += p.normalPrice;
          if (p.hasIntro && p.introMonths > 0) {
              addonIntroPrice += p.introPrice;
              addonHasIntro    = true;
              if (addonIntroMonths === null || p.introMonths < addonIntroMonths) addonIntroMonths = p.introMonths;
          } else {
              addonIntroPrice += p.normalPrice;
          }
      });
  
      const streamingNormalPrice = pickOneNormalPrice + addonNormalPrice;
      const mobileNormal         = bundle.mobileBasePrice || 0;
      const normalPriceTotal     = mobileNormal + streamingNormalPrice;
  
      let realYearlyCost = 0;
      for (let m = 1; m <= 12; m++) {
          const pickPrice = m <= freeMonths ? 0 : pickOneNormalPrice;
          let addPrice    = addonNormalPrice;
          if (addonHasIntro && addonIntroMonths && m <= addonIntroMonths) addPrice = addonIntroPrice;
          realYearlyCost += mobileNormal + pickPrice + addPrice;
      }
  
      const phases = [];
      if (addonHasIntro && addonIntroMonths) {
          const phase1End = Math.min(addonIntroMonths, freeMonths);
          phases.push({ from: 1, to: phase1End, total: mobileNormal + 0 + addonIntroPrice });
          if (addonIntroMonths < freeMonths) phases.push({ from: addonIntroMonths + 1, to: freeMonths, total: mobileNormal + 0 + addonNormalPrice });
      } else {
          phases.push({ from: 1, to: freeMonths, total: mobileNormal + 0 + addonNormalPrice });
      }
      phases.push({ from: freeMonths + 1, to: null, total: mobileNormal + pickOneNormalPrice + addonNormalPrice });
  
      const priceTiers = [];
      phases.forEach(ph => {
          const prev = priceTiers[priceTiers.length - 1];
          if (!prev || prev.total !== ph.total) priceTiers.push(ph);
      });

      // ── HAR-mode: baseline = hvad brugeren betaler I DAG ─────────────────────
      const harMonthly        = currentCostForCovered + currentMobile;
      const harYearlySavings  = (harMonthly * 12) - realYearlyCost;
      const harMonthlySavings = harMonthly - normalPriceTotal;

      // ── VIL-mode: baseline = markedsprisen for bundlens valgte pakker ─────────
      const separateMonthly       = separateCost + currentMobile;
      const separateYearlyCost    = separateMonthly * 12;
      const extraIfSeparate       = separateMonthly - normalPriceTotal;
      const extraIfSeparateYearly = separateYearlyCost - realYearlyCost;
  
      return {
          totalSavings:          harMonthlySavings,
          yearlySavings:         harYearlySavings,
          finalPrice:            normalPriceTotal,
          streamingNormalPrice,
          streamingIntroPrice:   0,
          streamingIntroMonths:  freeMonths,
          introPriceTotal:       priceTiers[0]?.total ?? normalPriceTotal,
          introMonths:           null,
          priceTiers,
          currentCostForCovered,
          separateCost,
          separateMonthly,
          extraIfSeparate,
          extraIfSeparateYearly,
      };
  }
  
  // ─── BEREGNER: CBB Mix ────────────────────────────────────────────────────────
  
  function calculateCbbMix(bundle, coveredEntries, selectedServices, currentMobile) {
      const { currentCostForCovered, separateCost } = calcBaseCosts(coveredEntries, selectedServices);
  
      const num = coveredEntries.length;
      if (num < 2) return null;
  
      let upgradeSum = 0;
      coveredEntries.forEach(entry => {
          const resolved = resolveEntry(entry);
          const label    = resolved.label || '';
          if (entry.id === 'netflix' && resolved.label?.includes('Premium')) upgradeSum += 40;
          if (entry.id === 'tv2play' && label.includes('Favorit + Sport'))      upgradeSum += 150;
          else if (entry.id === 'tv2play' && label.includes('Favorit'))         upgradeSum += 80;
          if (entry.id === 'deezer'  && label.includes('Family'))               upgradeSum += 70;
          if (entry.id === 'mofibo'  && label.includes('100 timer'))            upgradeSum += 60;
          else if (entry.id === 'mofibo' && label.includes('50 timer'))         upgradeSum += 30;
      });
  
      const basisNormal          = 180 + (Math.max(0, num - 2) * 50);
      const basisIntro           = Math.round(basisNormal * 0.5);
      const streamingNormalPrice = basisNormal + upgradeSum;
      const streamingIntroPrice  = basisIntro  + upgradeSum;
  
      const mobileNormal      = bundle.mobileBasePrice || bundle.normalPrice || 0;
      const mobileIntro       = bundle.introPriceMobile ?? mobileNormal;
      const mobileIntroMonths = bundle.introMonths ?? 0;
      const normalPriceTotal  = mobileNormal + streamingNormalPrice;
      const introPriceTotal   = mobileIntro  + streamingIntroPrice;
  
      const streamingIntroMonths = null;
      const priceTiers = [];
      if (mobileIntroMonths > 0) {
          priceTiers.push({ from: 1, to: mobileIntroMonths, total: mobileIntro + streamingIntroPrice });
          priceTiers.push({ from: mobileIntroMonths + 1, to: null, total: normalPriceTotal });
      } else {
          priceTiers.push({ from: 1, to: null, total: normalPriceTotal });
      }
  
      let realYearlyCost = 0;
      for (let m = 1; m <= 12; m++) {
          const mob       = (mobileIntroMonths > 0 && m <= mobileIntroMonths) ? mobileIntro : mobileNormal;
          const streaming = streamingNormalPrice;
          realYearlyCost += mob + streaming;
      }

      // ── HAR-mode: baseline = hvad brugeren betaler I DAG ─────────────────────
      // currentCostForCovered er stabil (fra window.selected) og ændres IKKE når
      // brugeren skifter pakke i dropdown'en. Bundlens pris stiger/falder derimod
      // via upgradeSum → besparelsen ændrer sig korrekt.
      const harMonthly        = currentCostForCovered + currentMobile;
      const harYearlySavings  = (harMonthly * 12) - realYearlyCost;
      const harMonthlySavings = harMonthly - normalPriceTotal;

      // ── VIL-mode: baseline = markedsprisen for bundlens valgte pakker ─────────
      const separateMonthly       = separateCost + currentMobile;
      const separateYearlyCost    = separateMonthly * 12;
      const extraIfSeparate       = separateMonthly - normalPriceTotal;
      const extraIfSeparateYearly = separateYearlyCost - realYearlyCost;
  
      return {
          totalSavings:      harMonthlySavings,
          yearlySavings:     harYearlySavings,
          finalPrice:        normalPriceTotal,
          streamingNormalPrice,
          streamingIntroPrice,
          streamingIntroMonths,
          introPriceTotal,
          introMonths:       bundle.introMonths ?? null,
          priceTiers,
          currentCostForCovered,
          separateCost,
          separateMonthly,
          extraIfSeparate,
          extraIfSeparateYearly,
      };
  }
  
  // ─── BEREGNER: Standard ───────────────────────────────────────────────────────
  
  function calculateStandard(bundle, coveredEntries, selectedServices, currentMobile) {
      const { currentCostForCovered, separateCost } = calcBaseCosts(coveredEntries, selectedServices);
  
      let streamingNormalPrice = 0;
      let streamingIntroPrice  = 0;
      let hasAnyStreamingIntro = false;
      let streamingIntroMonths = null;
  
      coveredEntries.forEach(entry => {
          const p = getServiceBundlePrice(entry);
          streamingNormalPrice += p.normalPrice;
          if (p.hasIntro) {
              streamingIntroPrice  += p.introPrice;
              hasAnyStreamingIntro  = true;
              if (p.introMonths && (streamingIntroMonths === null || p.introMonths < streamingIntroMonths)) {
                  streamingIntroMonths = p.introMonths;
              }
          } else {
              streamingIntroPrice += p.normalPrice;
          }
      });
  
      const mobileNormal      = bundle.mobileBasePrice || bundle.normalPrice || 0;
      const mobileIntro       = bundle.introPriceMobile ?? mobileNormal;
      const mobileIntroMonths = bundle.introMonths ?? 0;
      const hasIntro          = hasAnyStreamingIntro || bundle.introPriceMobile !== undefined;
      const normalPriceTotal  = mobileNormal + streamingNormalPrice;
      const introPriceTotal   = hasIntro ? (mobileIntro + streamingIntroPrice) : null;
  
      const priceTiers = [];
      if (hasIntro) {
          const breakpoints = [...new Set([0, mobileIntroMonths, (hasAnyStreamingIntro && streamingIntroMonths) ? streamingIntroMonths : 0].filter(x => x >= 0))].sort((a, b) => a - b);
  
          breakpoints.forEach((bp, i) => {
              const nextBp   = breakpoints[i + 1] ?? Infinity;
              const mobPrice = (mobileIntroMonths > 0 && bp < mobileIntroMonths) ? mobileIntro : mobileNormal;
              const strPrice = (hasAnyStreamingIntro && streamingIntroMonths && bp < streamingIntroMonths)
                  ? streamingIntroPrice : streamingNormalPrice;
              const total    = mobPrice + strPrice;
              const prev     = priceTiers[priceTiers.length - 1];
              if (!prev || prev.total !== total) {
                  priceTiers.push({
                      from:  bp + 1,
                      to:    nextBp === Infinity ? null : nextBp,
                      total, mobPrice, strPrice
                  });
              }
          });
      } else {
          priceTiers.push({ from: 1, to: null, total: normalPriceTotal });
      }
  
      let realYearlyCost = 0;
      for (let m = 1; m <= 12; m++) {
          const mob       = (mobileIntroMonths > 0 && m <= mobileIntroMonths) ? mobileIntro : mobileNormal;
          const streaming = (hasAnyStreamingIntro && streamingIntroMonths && m <= streamingIntroMonths)
              ? streamingIntroPrice
              : streamingNormalPrice;
          realYearlyCost += mob + streaming;
      }

      // ── HAR-mode: baseline = hvad brugeren betaler I DAG ─────────────────────
      const harMonthly        = currentCostForCovered + currentMobile;
      const harYearlySavings  = (harMonthly * 12) - realYearlyCost;
      const harMonthlySavings = harMonthly - normalPriceTotal;

      // ── VIL-mode: baseline = markedsprisen for bundlens valgte pakker ─────────
      const separateMonthly       = separateCost + currentMobile;
      const separateYearlyCost    = separateMonthly * 12;
      const extraIfSeparate       = separateMonthly - normalPriceTotal;
      const extraIfSeparateYearly = separateYearlyCost - realYearlyCost;
  
      return {
          totalSavings:         harMonthlySavings,
          yearlySavings:        harYearlySavings,
          finalPrice:           normalPriceTotal,
          streamingNormalPrice,
          streamingIntroPrice:  hasAnyStreamingIntro ? streamingIntroPrice : null,
          streamingIntroMonths,
          introPriceTotal,
          introMonths:          bundle.introMonths ?? null,
          priceTiers,
          currentCostForCovered,
          separateCost,
          separateMonthly,
          extraIfSeparate,
          extraIfSeparateYearly,
      };
  }
  
  // ─── DISPATCHER ───────────────────────────────────────────────────────────────
  
  function calculateSavings(bundle, coveredEntries, selectedServices, currentMobile) {
      if (bundle.type === "norlys-pick-one") {
          return calculateNorlysPickOne(bundle, coveredEntries, selectedServices, currentMobile);
      }
      if (bundle.type === "cbb-mix") {
          return calculateCbbMix(bundle, coveredEntries, selectedServices, currentMobile);
      }
      return calculateStandard(bundle, coveredEntries, selectedServices, currentMobile);
  }
  
  // ─── RENDER ───────────────────────────────────────────────────────────────────
  
  const INITIAL_SHOW  = 4;
  const LOAD_MORE_STEP = 4;
  
  async function renderBundles(selectedServices) {
      const grid          = document.getElementById("bundleGrid");
      const bundleSection = document.getElementById("bundleSection");
      if (!grid) return;
  
      if (providersData.length === 0) await fetchProviders();
      document.getElementById('loadMoreBundles')?.remove();
  
      grid.innerHTML      = "";
      const selectedIds   = Object.keys(selectedServices);
      const currentMobile = Number(document.getElementById("currentMobileValue")?.value)
          || Number(document.getElementById("currentMobile")?.value) || 0;
  
      if (selectedIds.length === 0) {
          if (bundleSection) bundleSection.hidden = true;
          return;
      }
  
      const isVilMode = window.activeMode === 'vil';
  
      const minDataGb = window.minDataGb ?? 0;
      const minEuGb   = window.minEuGb   ?? 0;
  
      function parseDataGb(str) {
          if (!str) return 0;
          const s = str.toLowerCase().replace(/\s/g, '');
          if (s.includes('fridata') || s === 'fridata') return 99999;
          const m = s.match(/^(\d+)/);
          return m ? parseInt(m[1], 10) : 0;
      }
  
      function bundleMeetsDataReq(bundle) {
          if (minDataGb === 0 && minEuGb === 0) return true;
          const dk = parseDataGb(bundle.dataAmount);
          if (minDataGb === 9999) { if (dk < 9999) return false; }
          else if (dk < minDataGb) return false;
          if (minEuGb > 0) {
              const eu = parseDataGb(bundle.dataEU);
              if (eu < minEuGb) return false;
          }
          return true;
      }

      let results = [];
      providersData.forEach(provider => {
          provider.bundles.forEach(bundle => {
              let coveredEntries;
              if (bundle.type === "norlys-pick-one" && bundle.freeStreamingPickOne) {
                  const pickOneIds = bundle.freeStreamingPickOne.map(e => e.id);
                  if (!bundle._activePickOneId || !pickOneIds.includes(bundle._activePickOneId) || !selectedIds.includes(bundle._activePickOneId)) {
                      bundle._activePickOneId = selectedIds.find(id => pickOneIds.includes(id)) || null;
                  }
                  const pickedId = bundle._activePickOneId;
                  const entries = [];
                  if (pickedId) {
                      const pickEntry = normalizeEntry(bundle.freeStreamingPickOne.find(e => e.id === pickedId));
                      entries.push(pickEntry);
                  }
                  const normalizedAll = normalizeIncluded(bundle.streamingIncluded);
                  normalizedAll.forEach(entry => {
                      if (!selectedIds.includes(entry.id)) return;
                      if (entry.id === pickedId) return;
                      entries.push(entry);
                  });
                  coveredEntries = entries;
              } else {
                  const normalized = normalizeIncluded(bundle.streamingIncluded);
                  coveredEntries   = normalized.filter(entry => selectedIds.includes(entry.id));
              }
              if (bundle.streamingChoiceCount) {
                  if (coveredEntries.length < bundle.streamingChoiceCount) return;
                  coveredEntries = coveredEntries.slice(0, bundle.streamingChoiceCount);
              }
  
              if (coveredEntries.length > 0 && bundleMeetsDataReq(bundle)) {
                  const savings = calculateSavings(bundle, coveredEntries, selectedServices, currentMobile);
                  if (savings) {
                      if (isVilMode || savings.totalSavings > 0) {
                          results.push({ provider, bundle, coveredEntries, savings });
                      }
                  }
              }
          });
      });
  
      if (isVilMode) {
          results.sort((a, b) => {
              const coverageDiff = b.coveredEntries.length - a.coveredEntries.length;
              if (coverageDiff !== 0) return coverageDiff;
              return b.savings.extraIfSeparate - a.savings.extraIfSeparate;
          });
      } else {
          results.sort((a, b) => {
              const coverageDiff = b.coveredEntries.length - a.coveredEntries.length;
              if (coverageDiff !== 0) return coverageDiff;
              return b.savings.totalSavings - a.savings.totalSavings;
          });
      }
  
      if (results.length > 0) {
          if (bundleSection) bundleSection.hidden = false;
  
          results.slice(0, INITIAL_SHOW).forEach(item => grid.appendChild(createBundleCard(item)));
  
          if (results.length > INITIAL_SHOW) {
              let shownCount = INITIAL_SHOW;
  
              const loadMoreBtn = document.createElement('button');
              loadMoreBtn.id = 'loadMoreBundles';
  
              const updateBtn = () => {
                  const remaining = results.length - shownCount;
                  loadMoreBtn.textContent = `Indlæs flere tilbud (${remaining} tilbage) ▾`;
              };
  
              updateBtn();
  
              loadMoreBtn.style.cssText = `
                  display: block;
                  width: 100%;
                  max-width: 480px;
                  margin: 8px auto 32px auto;
                  padding: 14px 0;
                  background: white;
                  color: #2B3EFF;
                  border: 2px solid #2B3EFF;
                  border-radius: 14px;
                  font-size: 15px;
                  font-weight: 700;
                  cursor: pointer;
                  transition: all .2s ease;
              `;
              loadMoreBtn.onmouseenter = () => { loadMoreBtn.style.background = '#eff6ff'; };
              loadMoreBtn.onmouseleave = () => { loadMoreBtn.style.background = 'white'; };
              loadMoreBtn.onclick = () => {
                  const nextBatch = results.slice(shownCount, shownCount + LOAD_MORE_STEP);
                  nextBatch.forEach(item => grid.appendChild(createBundleCard(item)));
                  shownCount += nextBatch.length;
                  if (shownCount >= results.length) {
                      loadMoreBtn.remove();
                  } else {
                      updateBtn();
                  }
              };
              grid.parentNode.insertBefore(loadMoreBtn, grid.nextSibling);
          }
      } else {
          if (bundleSection) {
              bundleSection.hidden = false;
              grid.innerHTML = `
                <div style="grid-column:1/-1;text-align:center;padding:40px 24px;background:#f6f6f4;border-radius:22px;border:1px dashed #d1d5db;max-width:480px;margin:0 auto;">
                  <div style="font-size:36px;margin-bottom:16px;">🔍</div>
                  <h3 style="font-size:18px;font-weight:800;color:#111;margin:0 0 10px;">Ingen tilbud matcher din kombination</h3>
                  <p style="font-size:15px;line-height:1.65;color:#6b7280;margin:0 0 24px;">Vi fandt ingen mobilbundter der dækker præcis de tjenester og det datakrav du har valgt. Prøv at justere dine filtre.</p>
                  <button onclick="window.scrollTo({top:0,behavior:'smooth'})" style="padding:12px 28px;background:#2B3EFF;color:#fff;border:none;border-radius:999px;font-size:15px;font-weight:700;cursor:pointer;">Ændre valgte tjenester</button>
                </div>
              `;
          }
      }
  }

  // ─── PRICE TIERS HTML ────────────────────────────────────────────────────────

  function buildPriceTiersHtml(savings) {
      const tiers = savings.priceTiers;
  
      if (!tiers || tiers.length <= 1) {
          const price = (tiers && tiers[0]) ? tiers[0].total : savings.finalPrice;
          return `<strong class="price-normal" style="font-size:22px;font-weight:800;color:#111;">
                    ${price} kr<span style="font-size:14px;font-weight:400;color:#6b7280;">/md</span>
                  </strong>`;
      }
  
      const introTiers = tiers.slice(0, -1);
      const finalTier  = tiers[tiers.length - 1];
  
      const introRows = introTiers.map((tier, i) => {
          const months  = tier.to ? (tier.to - tier.from + 1) : '?';
          const label   = i === 0
              ? `de første ${months} mdr.`
              : `mdr. ${tier.from}–${tier.to}`;
          return `<div style="color:#15803d;font-weight:800;font-size:15px;margin-bottom:3px;">
                    KUN ${tier.total} kr./md ${label}
                  </div>`;
      }).join('');
  
      return `${introRows}
          <div style="display:flex;align-items:baseline;justify-content:center;gap:5px;margin-top:2px;">
            <span style="font-size:13px;color:#6b7280;font-weight:500;">Herefter</span>
            <strong class="price-normal" style="font-size:22px;font-weight:800;color:#111;">
              ${finalTier.total} kr<span style="font-size:14px;font-weight:400;color:#6b7280;">/md</span>
            </strong>
          </div>`;
  }
  
  // ─── BUNDLE CARD ──────────────────────────────────────────────────────────────
  
  function createBundleCard(item) {
      const { provider, bundle, coveredEntries, savings } = item;
      const card = document.createElement("div");
      card.className      = "bundle-card";
      card.style.alignSelf = "flex-start";
  
      const isVilMode = window.activeMode === 'vil';
  
      const buildServicesHtml = (entries) => entries.map(entry => {
          const resolved  = resolveEntry(entry);
          const src       = getServiceIcon(entry.id);
          const plan      = getServicePlan(entry.id, resolved.planIndex ?? 0);
          const p         = getServiceBundlePrice(entry);
          const planName  = plan ? plan.name : '';
          const hasValg   = !!(entry.valgmuligheder && entry.valgmuligheder.length > 1);
          const listPrice = plan ? plan.price : 0;
  
          const userService  = (window.selected || {})[entry.id];
          const isDowngrade  = userService && listPrice < userService.price;
          const isUpgrade    = userService && listPrice > userService.price;
          const planNoteHtml = isDowngrade
              ? `<span style="font-size:10px;font-weight:600;color:#9ca3af;white-space:nowrap;">↓ Lavere end dit valg</span>`
              : isUpgrade
              ? `<span style="font-size:10px;font-weight:600;color:#16a34a;white-space:nowrap;">↑ Bedre end dit valg</span>`
              : '';
  
          let priceHtml;
          if (p.hasIntro && p.introMonths > 0) {
              priceHtml = `
                <span style="font-size:11px;color:#15803d;font-weight:700;white-space:nowrap;">
                  ${p.introPrice === 0 ? 'Gratis' : p.introPrice + ' kr.'} i ${p.introMonths} mdr.
                </span>
                <span style="font-size:11px;color:#9ca3af;white-space:nowrap;">→ ${p.normalPrice} kr./md</span>`;
          } else if (p.normalPrice === 0 && listPrice > 0) {
              priceHtml = `<span style="font-size:11px;color:#15803d;font-weight:700;white-space:nowrap;">Inkluderet</span> <span style="font-size:11px;color:#9ca3af;text-decoration:line-through;white-space:nowrap;">${listPrice} kr./md</span>`;
          } else if (p.normalPrice == null) {
              priceHtml = `<span style="font-size:11px;color:#15803d;font-weight:700;white-space:nowrap;">Inkluderet</span> <span style="font-size:11px;color:#9ca3af;text-decoration:line-through;white-space:nowrap;">${listPrice} kr./md</span>`;
          } else {
              priceHtml = `<span style="font-size:12px;color:#9ca3af;white-space:nowrap;">${p.normalPrice} kr./md</span>`;
          }
  
          const labelHtml = hasValg
              ? `<button class="valg-trigger" style="background:#f3f4f6;border:1px solid #e5e7eb;border-radius:999px;padding:4px 10px;font-size:12px;font-weight:600;color:#374151;cursor:pointer;display:flex;align-items:center;gap:4px;white-space:nowrap;">
                  ${entry.valgmuligheder[entry._aktivtValg ?? 0].label} <span style="font-size:9px;">▾</span>
                 </button>
                 <div class="valg-menu" style="display:none;position:absolute;z-index:999;background:white;border:1px solid #e5e7eb;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.12);min-width:200px;margin-top:4px;overflow:hidden;">
                   ${entry.valgmuligheder.map((v, i) => {
                       const active = i === (entry._aktivtValg ?? 0);
                       return `<div class="valg-option ${active ? 'valg-option-active' : ''}" data-valg-index="${i}">${v.label}</div>`;
                   }).join('')}
                 </div>`
              : `<span style="background:#f3f4f6;border:1px solid #e5e7eb;border-radius:999px;padding:4px 10px;font-size:12px;font-weight:600;color:#374151;display:inline-block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;">${planName}</span>`;
  
          return `
            <div class="service-row valg-wrap" data-service-id="${entry.id}" style="margin-bottom:14px;position:relative;">
              <div style="display:grid;grid-template-columns:40px 1fr auto;align-items:start;gap:8px;">
                <img src="${src}" alt="${entry.id}" style="height:32px;width:32px;object-fit:contain;border-radius:8px;margin-top:2px;">
                <div style="min-width:0;overflow:hidden;display:flex;flex-direction:column;gap:3px;">
                  ${labelHtml}
                  ${planNoteHtml}
                </div>
                <div style="text-align:right;white-space:nowrap;">${priceHtml}</div>
              </div>
            </div>`;
      }).join('');
  
      const hasIntro    = savings.introPriceTotal !== null;
      const expiryLabel = getExpiryLabel(bundle.expiryDate);
  
      const savingsBoxHtml = isVilMode
          ? buildVilSavingsBox(savings)
          : buildHarSavingsBox(savings);
  
      card.innerHTML = `
        <div class="bundle-top">
          <img src="${provider.logo}" alt="${provider.name}" class="bundle-logo">
          <span class="bundle-network">${provider.network}</span>
        </div>
  
        <div class="bundle-data" style="margin-bottom:5px;">
          <strong style="font-size:20px;">Fri Tale + ${bundle.dataAmount}</strong>
          <div style="display:flex;gap:14px;margin-top:6px;align-items:center;">
            <span style="display:flex;align-items:center;gap:5px;font-size:13px;color:#4b5563;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4b5563" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></svg>
              ${bundle.dataEU || ''}
            </span>
            <span style="display:flex;align-items:center;gap:5px;font-size:13px;font-weight:600;color:#1d4ed8;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              Ingen binding
            </span>
          </div>
        </div>
  
        <div class="bundle-streaming-list" style="background:#f9fafb;padding:12px;border-radius:12px;margin:15px 0;position:relative;">
          <div style="font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;margin-bottom:10px;letter-spacing:.4px;">Inkluderede tjenester:</div>
          <div class="services-list">${buildServicesHtml(coveredEntries)}</div>
        </div>
  
        <div class="bundle-savings-wrap">${savingsBoxHtml}</div>
  
        <div class="bundle-price">
          <div style="font-size:14px;color:#6b7280;margin-bottom:6px;">${isVilMode ? 'Samlet pris med dette bundt' : 'Ny samlet pris'}</div>
          <div class="price-intro-wrap">
            ${buildPriceTiersHtml(savings)}
          </div>
        </div>
  
        <a href="${applyTracking(bundle.link)}" class="bundle-btn" target="_blank" style="margin-top:15px;width:100%;text-align:center;display:block;text-decoration:none;">Hent tilbud</a>
  
        <div style="text-align:center;margin-top:10px;font-size:12px;">${expiryLabel || ''}</div>
  
        <button class="bundle-details-toggle" style="background:none;border:none;color:#6b7280;font-size:13px;width:100%;cursor:pointer;margin-top:12px;">
          Se alle specifikationer <span>▾</span>
        </button>
  
        <div class="bundle-details-content" style="display:none;padding-top:15px;border-top:1px solid #e5e7eb;margin-top:15px;font-size:13px;color:#4b5563;">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
            <span>${isVilMode ? 'Listepris for tjenesterne separat:' : 'Din nuværende pris for disse tjenester:'}</span>
            <strong>${isVilMode ? savings.separateCost : savings.currentCostForCovered} kr./md</strong>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
            <span>Streaming i bundlen (normalpris):</span>
            <strong class="detail-streaming-normal">${savings.streamingNormalPrice} kr./md</strong>
          </div>
          ${savings.streamingIntroPrice !== null ? `
          <div style="display:flex;justify-content:space-between;margin-bottom:6px;color:#15803d;">
            <span>Streaming i bundlen (intro i ${savings.streamingIntroMonths || savings.introMonths || ''} mdr.):</span>
            <strong class="detail-streaming-intro">${savings.streamingIntroPrice} kr./md</strong>
          </div>` : ''}
          <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
            <span>Mobilabonnement normalpris:</span>
            <strong>${bundle.mobileBasePrice || bundle.normalPrice} kr./md</strong>
          </div>
          ${hasIntro ? `
          <div style="display:flex;justify-content:space-between;margin-bottom:6px;color:#15803d;">
            <span>Mobilabonnement intro (${savings.introMonths} mdr.):</span>
            <strong class="detail-intro-total">${bundle.introPriceMobile} kr./md</strong>
          </div>` : ''}
          <div style="display:flex;justify-content:space-between;">
            <span>Oprettelse:</span><strong>${bundle.setupFee ? bundle.setupFee + ' kr.' : (bundle.details?.oprettelse || '0 kr.')}</strong>
          </div>
        </div>
      `;
  
      const toggleBtn = card.querySelector('.bundle-details-toggle');
      const content   = card.querySelector('.bundle-details-content');
      toggleBtn.onclick = (e) => {
          e.preventDefault();
          const isHidden = content.style.display === 'none';
          content.style.display = isHidden ? 'block' : 'none';
          toggleBtn.querySelector('span').innerText = isHidden ? '▴' : '▾';
      };
  
      attachValgListeners(card, coveredEntries, bundle, buildServicesHtml);
  
      document.addEventListener('click', () => {
          card.querySelectorAll('.valg-menu').forEach(m => m.style.display = 'none');
      });
  
      return card;
  }
  
  // ─── SAVINGS BOX BUILDERS ─────────────────────────────────────────────────────
  
  function buildHarSavingsBox(savings) {
      return `
        <div class="bundle-savings" style="background:#2B3EFF;color:white;border-radius:16px;padding:18px;text-align:center;margin-bottom:15px;box-shadow:0 4px 12px rgba(43,62,255,0.2);">
          <span style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;opacity:0.9;">DU SPARER OM ÅRET:</span>
          <div class="savings-yearly" style="font-size:30px;font-weight:900;margin:2px 0;">${Math.round(savings.yearlySavings).toLocaleString('da-DK')} kr.</div>
          <div class="savings-monthly" style="font-size:13px;opacity:0.8;">Svarende til ${Math.round(savings.totalSavings)} kr./md</div>
        </div>`;
  }
  
  function buildVilSavingsBox(savings) {
      const extraMonthly = Math.round(savings.extraIfSeparate);
      const extraYearly  = Math.round(savings.extraIfSeparateYearly);
      if (extraMonthly <= 0) {
          return `
            <div style="background:#f3f4f6;border-radius:16px;padding:16px;text-align:center;margin-bottom:15px;border:1px solid #e5e7eb;">
              <span style="font-size:13px;color:#6b7280;">Omtrent samme pris som enkeltvis – men alt er samlet ét sted.</span>
            </div>`;
      }
      return `
        <div class="bundle-savings" style="background:#111827;color:white;border-radius:16px;padding:18px;text-align:center;margin-bottom:15px;box-shadow:0 4px 12px rgba(0,0,0,0.15);">
          <span style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;opacity:0.7;">VILLE KOSTE MERE SEPARAT:</span>
          <div class="savings-yearly" style="font-size:30px;font-weight:900;margin:2px 0;">${extraYearly.toLocaleString('da-DK')} kr. om året</div>
          <div class="savings-monthly" style="font-size:13px;opacity:0.75;">${extraMonthly} kr. mere om måneden uden bundlen</div>
        </div>`;
  }
  
  // ─── VALGMULIGHEDER ───────────────────────────────────────────────────────────
  
  function attachValgListeners(card, coveredEntries, bundle, buildServicesHtml) {
  
      card.querySelectorAll('.valg-trigger').forEach(trigger => {
          trigger.onclick = (e) => {
              e.stopPropagation();
              const menu = trigger.nextElementSibling;
              if (!menu) return;
              const isOpen = menu.style.display === 'block';
              card.querySelectorAll('.valg-menu').forEach(m => m.style.display = 'none');
              menu.style.display = isOpen ? 'none' : 'block';
          };
      });
  
      card.querySelectorAll('.valg-option').forEach(opt => {
          opt.onclick = (e) => {
              e.stopPropagation();
  
              const row      = opt.closest('.service-row');
              const sid      = row?.dataset.serviceId;
              const entryIdx = coveredEntries.findIndex(en => en.id === sid);
              if (entryIdx === -1) return;
  
              coveredEntries[entryIdx]._aktivtValg = parseInt(opt.dataset.valgIndex);
  
              const selectedServices = window.selected || {};
              const currentMobile    = Number(document.getElementById("currentMobileValue")?.value)
                  || Number(document.getElementById("currentMobile")?.value) || 0;
              const newSavings       = calculateSavings(bundle, coveredEntries, selectedServices, currentMobile);
  
              card.querySelector('.services-list').innerHTML = buildServicesHtml(coveredEntries);
  
              if (newSavings) {
                  const isVilMode = window.activeMode === 'vil';
  
                  const savingsWrap = card.querySelector('.bundle-savings-wrap');
                  if (savingsWrap) {
                      savingsWrap.innerHTML = isVilMode
                          ? buildVilSavingsBox(newSavings)
                          : buildHarSavingsBox(newSavings);
                  }
  
                  const priceWrap = card.querySelector('.price-intro-wrap');
                  if (priceWrap) priceWrap.innerHTML = buildPriceTiersHtml(newSavings);
              }
  
              attachValgListeners(card, coveredEntries, bundle, buildServicesHtml);
          };
      });
  }
  
  window.renderBundles = renderBundles;
  
  (function injectValgCSS() {
      if (document.getElementById('valg-styles')) return;
      const style = document.createElement('style');
      style.id = 'valg-styles';
      style.textContent = `
        .valg-option {
          padding: 10px 14px;
          font-size: 13px;
          color: #374151;
          cursor: pointer;
          border-bottom: 1px solid #f3f4f6;
          transition: background .15s ease;
        }
        .valg-option:last-child { border-bottom: none; }
        .valg-option:hover { background: #f9fafb; }
        .valg-option-active {
          color: #2B3EFF;
          font-weight: 700;
          background: #eff6ff;
        }
        .valg-trigger:hover {
          background: #e5e7eb !important;
        }
      `;
      document.head.appendChild(style);
  })();