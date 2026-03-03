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

let providersData = [];

async function fetchProviders() {
    try {
        const response = await fetch('./data/providers.json');
        providersData = await response.json();
    } catch (e) { console.error("Kunne ikke hente udbydere", e); }
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

// Normaliser entry — streng → objekt, og sæt default valgmulighed hvis valgmuligheder findes
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

// Hent den aktive entry (løser valgmuligheder til én flad entry)
function resolveEntry(entry) {
    if (entry.valgmuligheder) {
        const valg = entry.valgmuligheder[entry._aktivtValg ?? 0];
        return { id: entry.id, ...valg };
    }
    return entry;
}

// Hent pris-objekt for én tjeneste
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

// ─── FÆLLES HJÆLPER: beregn currentCostForCovered og separateCost ────────────

function calcBaseCosts(coveredEntries, selectedServices) {
    let currentCostForCovered = 0;
    let separateCost = 0;
    coveredEntries.forEach(entry => {
        const id = entry.id;
        if (selectedServices[id]) {
            currentCostForCovered += selectedServices[id].price;
            separateCost          += selectedServices[id].price;
        } else {
            const resolved = resolveEntry(entry);
            const plan     = getServicePlan(id, resolved.planIndex ?? 0);
            separateCost  += plan ? plan.price : 0;
        }
    });
    return { currentCostForCovered, separateCost };
}

// ─── BEREGNER: Norlys Pick-One ────────────────────────────────────────────────
// Prisstruktur: én tjeneste gratis i N måneder (pick-one),
// resten er individuelle addon-priser med egne intro-perioder.

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
        // Brug priceAfter hvis det findes (prisen efter gratis-perioden), ellers partnerNormalPrice eller listpris
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
    const separateYearlyCost   = (separateCost + currentMobile) * 12;

    let realYearlyCost = 0;
    for (let m = 1; m <= 12; m++) {
        const pickPrice = m <= freeMonths ? 0 : pickOneNormalPrice;
        let addPrice    = addonNormalPrice;
        if (addonHasIntro && addonIntroMonths && m <= addonIntroMonths) addPrice = addonIntroPrice;
        realYearlyCost += mobileNormal + pickPrice + addPrice;
    }

    const realYearlySavings = separateYearlyCost - realYearlyCost;

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

    return {
        totalSavings:          Math.round(realYearlySavings / 12),
        yearlySavings:         realYearlySavings,
        finalPrice:            normalPriceTotal,
        streamingNormalPrice,
        streamingIntroPrice:   0,
        streamingIntroMonths:  freeMonths,
        introPriceTotal:       priceTiers[0]?.total ?? normalPriceTotal,
        introMonths:           null,
        priceTiers,
        currentCostForCovered,
        separateCost,
        separateMonthly:       separateCost + currentMobile,
        extraIfSeparate:       (separateCost + currentMobile) - normalPriceTotal,
        extraIfSeparateYearly: separateYearlyCost - realYearlyCost,
    };
}

// ─── BEREGNER: CBB Mix ────────────────────────────────────────────────────────
// Prisstruktur: streaming prissættes som en pulje — basispris for 2 tjenester,
// +50 kr. pr. ekstra. Upgrade-tillæg per tjeneste. Intro = 50% rabat på basispuljen.

function calculateCbbMix(bundle, coveredEntries, selectedServices, currentMobile) {
    const { currentCostForCovered, separateCost } = calcBaseCosts(coveredEntries, selectedServices);

    const num = coveredEntries.length;
    if (num < 2) return null;

    let upgradeSum = 0;
    coveredEntries.forEach(entry => {
        const resolved = resolveEntry(entry);
        const label    = resolved.label || '';
        if (entry.id === 'netflix' && resolved.planIndex === 2)               upgradeSum += 40;
        if (entry.id === 'tv2play' && label.includes('Favorit + Sport'))      upgradeSum += 150;
        else if (entry.id === 'tv2play' && label.includes('Favorit'))         upgradeSum += 80;
        if (entry.id === 'deezer'  && label.includes('Family'))               upgradeSum += 70;
        if (entry.id === 'mofibo'  && label.includes('100 timer'))            upgradeSum += 60;
        else if (entry.id === 'mofibo' && label.includes('50 timer'))         upgradeSum += 30;
    });

    const basisNormal        = 180 + (Math.max(0, num - 2) * 50);
    const basisIntro         = Math.round(basisNormal * 0.5);
    const streamingNormalPrice = basisNormal + upgradeSum;
    const streamingIntroPrice  = basisIntro  + upgradeSum;

    const mobileNormal      = bundle.mobileBasePrice || bundle.normalPrice || 0;
    const mobileIntro       = bundle.introPriceMobile ?? mobileNormal;
    const mobileIntroMonths = bundle.introMonths ?? 0;
    const normalPriceTotal  = mobileNormal + streamingNormalPrice;
    const introPriceTotal   = mobileIntro  + streamingIntroPrice;

    // CBB har altid streaming-intro (ingen separat streamingIntroMonths — kun mobilintro styrer faser)
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
        const streaming = streamingNormalPrice; // streaming-intro følger mobilintro-perioden hos CBB
        realYearlyCost += mob + streaming;
    }

    const separateYearlyCost    = (separateCost + currentMobile) * 12;
    const realYearlySavings     = separateYearlyCost - realYearlyCost;
    const monthlySavings        = (separateCost + currentMobile) - normalPriceTotal;
    const separateMonthly       = separateCost + currentMobile;
    const extraIfSeparate       = separateMonthly - normalPriceTotal;
    const extraIfSeparateYearly = separateYearlyCost - realYearlyCost;

    return {
        totalSavings: monthlySavings,
        yearlySavings: realYearlySavings,
        finalPrice: normalPriceTotal,
        streamingNormalPrice,
        streamingIntroPrice,
        streamingIntroMonths,
        introPriceTotal,
        introMonths: bundle.introMonths ?? null,
        priceTiers,
        currentCostForCovered,
        separateCost,
        separateMonthly,
        extraIfSeparate,
        extraIfSeparateYearly,
    };
}

// ─── BEREGNER: Standard ───────────────────────────────────────────────────────
// Prisstruktur: mobilpris + individuelle partnerpriser per tjeneste,
// eventuelt med partnerIntroPrice/partnerIntroMonths.
// Dækker: CallMe, Telmore og øvrige udbydere uden særlig pulje-logik.

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
            // Gem streaming-introperiode (tager den første/laveste der findes)
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

    // ── Kronologiske prisfaser ───────────────────────────────────────────────
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

    // Beregn reel årlig besparelse måned for måned
    let realYearlyCost = 0;
    for (let m = 1; m <= 12; m++) {
        const mob       = (mobileIntroMonths > 0 && m <= mobileIntroMonths) ? mobileIntro : mobileNormal;
        const streaming = (hasAnyStreamingIntro && streamingIntroMonths && m <= streamingIntroMonths)
            ? streamingIntroPrice
            : streamingNormalPrice;
        realYearlyCost += mob + streaming;
    }

    const separateYearlyCost    = (separateCost + currentMobile) * 12;
    const realYearlySavings     = separateYearlyCost - realYearlyCost;
    const monthlySavings        = (separateCost + currentMobile) - normalPriceTotal;
    const separateMonthly       = separateCost + currentMobile;
    const extraIfSeparate       = separateMonthly - normalPriceTotal;
    const extraIfSeparateYearly = separateYearlyCost - realYearlyCost;

    return {
        totalSavings:         monthlySavings,
        yearlySavings:        realYearlySavings,
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
// Alt andet i koden kalder stadig calculateSavings — dispatcher'en sender
// videre til den rigtige beregner baseret på bundle.type.
//
// Oversigt over bundle-typer og hvilken beregner de bruger:
//
//   "norlys-pick-one" → calculateNorlysPickOne
//      Én tjeneste gratis i N måneder (pick-one), resten individuelle addon-priser.
//      Bruges af: Norlys (norlys-one, norlys-smart20, norlys-smart60, norlys-smart200)
//
//   "cbb-mix"         → calculateCbbMix
//      Streaming som pulje: basispris for 2 tjenester + 50 kr./ekstra. Intro = 50% rabat på basis.
//      Bruges af: CBB (cbb-mix-100gb, cbb-mix-200gb, cbb-mix-fri)
//
//   "fixed"           → calculateStandard
//      Streaming fast inkluderet i mobilprisen (partnerNormalPrice: 0), eller med partnerpriser.
//      Bruges af: Oister (alle bundter), CallMe (alle), Telmore fixed-bundter
//
//   "telmore-play"    → calculateStandard
//      Brugeren vælger N tjenester frit (streamingChoiceCount). Alle med partnerNormalPrice: 0.
//      Bruges af: Telmore (telmore-play-3, -4, -5, -alle)
//
// Ny udbyder med samme struktur som fixed/telmore-play? Ingen kodeændring nødvendig.
// Ny udbyder med anderledes prisstruktur? Lav en ny beregner og tilføj en if-blok herunder.

function calculateSavings(bundle, coveredEntries, selectedServices, currentMobile) {
    if (bundle.type === "norlys-pick-one") {
        return calculateNorlysPickOne(bundle, coveredEntries, selectedServices, currentMobile);
    }
    if (bundle.type === "cbb-mix") {
        return calculateCbbMix(bundle, coveredEntries, selectedServices, currentMobile);
    }
    // Håndterer: "fixed" (Oister, CallMe, Telmore fixed) og "telmore-play"
    return calculateStandard(bundle, coveredEntries, selectedServices, currentMobile);
}

// ─── RENDER ───────────────────────────────────────────────────────────────────

const INITIAL_SHOW  = 4;
const LOAD_MORE_STEP = 4; // ← antal ekstra tilbud per klik

async function renderBundles(selectedServices) {
    const grid          = document.getElementById("bundleGrid");
    const bundleSection = document.getElementById("bundleSection");
    if (!grid) return;

    if (providersData.length === 0) await fetchProviders();

    // Ryd op: fjern evt. gammel "Vis flere"-knap fra forrige render
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

    // DATA FILTER
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
            // For Norlys pick-one: find hvilken af de valgte tjenester der er pick-one (første match),
            // og byg coveredEntries så pick-one får pris 0 og resten bruger addon-priser fra streamingIncluded.
            let coveredEntries;
            if (bundle.type === "norlys-pick-one" && bundle.freeStreamingPickOne) {
                const pickOneIds = bundle.freeStreamingPickOne.map(e => e.id);
                // Brug bundle._activePickOneId hvis sat (bruger har skiftet), ellers første match
                if (!bundle._activePickOneId || !pickOneIds.includes(bundle._activePickOneId) || !selectedIds.includes(bundle._activePickOneId)) {
                    bundle._activePickOneId = selectedIds.find(id => pickOneIds.includes(id)) || null;
                }
                const pickedId = bundle._activePickOneId;
                const entries = [];
                if (pickedId) {
                    // Pick-one entry: hent fra freeStreamingPickOne (partnerNormalPrice: 0)
                    const pickEntry = normalizeEntry(bundle.freeStreamingPickOne.find(e => e.id === pickedId));
                    entries.push(pickEntry);
                }
                // Alle andre valgte tjenester: hent fra streamingIncluded (med korrekte addon-priser)
                const normalizedAll = normalizeIncluded(bundle.streamingIncluded);
                normalizedAll.forEach(entry => {
                    if (!selectedIds.includes(entry.id)) return;
                    if (entry.id === pickedId) return; // spring pick-one over — allerede tilføjet
                    entries.push(entry);
                });
                coveredEntries = entries;
            } else {
                const normalized = normalizeIncluded(bundle.streamingIncluded);
                coveredEntries   = normalized.filter(entry => selectedIds.includes(entry.id));
            }

            // Telmore Play-bundles: brugeren vælger præcis streamingChoiceCount tjenester.
            // Vis kun bundlen hvis brugeren har valgt MINDST streamingChoiceCount tjenester
            // der er tilgængelige i bundlen, og begræns visningen til streamingChoiceCount.
            if (bundle.streamingChoiceCount) {
                if (coveredEntries.length < bundle.streamingChoiceCount) return; // ikke nok matches
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

    // ── SORTERING ───────────────────────���────────────────────────────────────
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

        // Vis de første INITIAL_SHOW tilbud
        results.slice(0, INITIAL_SHOW).forEach(item => grid.appendChild(createBundleCard(item)));

        // Hvis der er flere: vis "Indlæs flere tilbud"-knap (loader LOAD_MORE_STEP ad gangen)
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
            loadMoreBtn.onmouseenter = () => {
                loadMoreBtn.style.background = '#eff6ff';
            };
            loadMoreBtn.onmouseleave = () => {
                loadMoreBtn.style.background = 'white';
            };
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

            // Indsæt knappen EFTER grid (ikke inde i grid)
            grid.parentNode.insertBefore(loadMoreBtn, grid.nextSibling);
        }
    } else {
        if (bundleSection) bundleSection.hidden = true;
    }
}

// ─── PRIS-FASER RENDERER ─────────────────────────────────────────────────────
// Viser kronologiske prisfaser korrekt, fx:
//   64 kr./md de første 2 mdr.
//   401 kr./md i mdr. 3
//   Herefter 466 kr./md
function buildPriceTiersHtml(savings) {
    const tiers = savings.priceTiers;

    // Kun ét trin = ingen intro
    if (!tiers || tiers.length <= 1) {
        const price = (tiers && tiers[0]) ? tiers[0].total : savings.finalPrice;
        return `<strong class="price-normal" style="font-size:22px;font-weight:800;color:#111;">
                  ${price} kr<span style="font-size:14px;font-weight:400;color:#6b7280;">/md</span>
                </strong>`;
    }

    // Flere trin: intro-rækker + normalpris til sidst
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
        const hasValg   = !!entry.valgmuligheder;

        const listPrice = plan ? plan.price : 0;
        let priceHtml;
        if (p.hasIntro && p.introMonths > 0) {
            priceHtml = `
              <span style="font-size:11px;color:#15803d;font-weight:700;white-space:nowrap;">
                ${p.introPrice === 0 ? 'Gratis' : p.introPrice + ' kr.'} i ${p.introMonths} mdr.
              </span>
              <span style="font-size:11px;color:#9ca3af;white-space:nowrap;">→ ${p.normalPrice} kr./md</span>`;
        } else if (p.normalPrice === 0 && listPrice > 0) {
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
            : `<span style="font-size:12px;color:#374151;">${planName}</span>`;

        return `
          <div class="service-row valg-wrap" data-service-id="${entry.id}" style="margin-bottom:8px;position:relative;">
            <div style="display:grid;grid-template-columns:52px 1fr 90px;align-items:center;gap:8px;">
              <img src="${src}" alt="${entry.id}" style="height:32px;width:32px;object-fit:contain;border-radius:8px;">
              <div style="min-width:0;">${labelHtml}</div>
              <div style="text-align:right;">${priceHtml}</div>
            </div>
          </div>`;
    }).join('');

    const hasIntro        = savings.introPriceTotal !== null;
    const introPriceTotal = savings.introPriceTotal;
    const expiryLabel     = getExpiryLabel(bundle.expiryDate);

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
          <span>Streaming i bundlen (gratis i ${savings.streamingIntroMonths || savings.introMonths || ''} mdr.):</span>
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

/* CSS injiceres dynamisk */
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