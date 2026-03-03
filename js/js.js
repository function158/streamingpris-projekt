const categories = {
  film: "Film & serier",
  audio: "Musik og podcasts",
  books: "Lydbøger"
};
let services = [];
const selected = {};
window.selected = selected;

document.addEventListener("DOMContentLoaded", async () => {
  const cardsEl = document.getElementById("cards");
  const monthlyEl = document.getElementById("monthly");
  const yearlyEl = document.getElementById("yearly");
  const insightEl = document.getElementById("insight");
  const resetBtn = document.getElementById("resetBtn");
  const mobileInput = document.getElementById("currentMobile");

  // 1. HENT SERVICES FRA JSON
  try {
    const response = await fetch('./data/services.json');
    if (!response.ok) throw new Error("Kunne ikke hente services.json");
    services = await response.json();
    window.services = services;
    render();
    calculate();
  } catch (error) {
    console.error("Fejl:", error);
    if (cardsEl) cardsEl.innerHTML = "<p>Fejl ved indlæsning af data.</p>";
    return;
  }

  // 2. RENDER FUNKTION
  function render() {
    if (!cardsEl) return;
    cardsEl.innerHTML = "";

    Object.entries(categories).forEach(([categoryKey, categoryLabel]) => {
      const servicesInCategory = services.filter(s => s.category === categoryKey && s.id !== 'spotify');
      if (servicesInCategory.length === 0) return;

      const section = document.createElement("section");
      section.className = "category-section";
      section.innerHTML = `<h2 class="category-title">${categoryLabel}</h2>`;

      const grid = document.createElement("div");
      grid.className = "card-grid";

      servicesInCategory.forEach(service => {
        const isSelected = !!selected[service.id];
        const card = document.createElement("div");
        card.className = "sub-card" + (isSelected ? " selected" : "");
        card.innerHTML = `
          ${isSelected ? `<div class="check">✓</div>` : ""}
          <img src="${service.logo}" alt="${service.name} logo">
        `;

        let touchStartY = 0;
        let touchStartX = 0;
        let hasTouched = false;

        card.addEventListener("touchstart", (e) => {
          touchStartY = e.touches[0].clientY;
          touchStartX = e.touches[0].clientX;
          hasTouched = false;
        }, { passive: true });

        card.addEventListener("touchend", (e) => {
          if (e.target.closest(".plan-pill") || e.target.closest(".plan-menu")) return;
          const deltaY = Math.abs(e.changedTouches[0].clientY - touchStartY);
          const deltaX = Math.abs(e.changedTouches[0].clientX - touchStartX);
          // Kun aktiver hvis det er et tap og ikke en scroll (max 10px bevægelse)
          if (deltaY < 10 && deltaX < 10) {
            hasTouched = true;
            toggleService(service);
          }
        }, { passive: true });

        // Desktop click – undgå double-fire på mobil via hasTouched-flag
        card.addEventListener("click", (e) => {
          if (e.target.closest(".plan-pill") || e.target.closest(".plan-menu")) return;
          if (hasTouched) {
            hasTouched = false; // reset flag, ignorer dette syntetiske click
            return;
          }
          toggleService(service);
        });
        // ── SLUT MOBIL SCROLL FIX ─────────────────────────────────────

        if (isSelected) {
          const hasMultiplePlans = service.plans.length > 1;
          const pill = document.createElement("div");
          pill.className = "plan-pill";
          pill.style.cssText = hasMultiplePlans ? "cursor:pointer;" : "cursor:default;pointer-events:none;";
          pill.innerHTML = `
            <span style="display:flex;flex-direction:column;align-items:flex-start;line-height:1.3;flex:1;overflow:visible;">
              <span style="font-size:10px;color:#999;font-weight:600;text-transform:uppercase;letter-spacing:0.4px;white-space:normal;">${selected[service.id].name}</span>
              <strong style="font-size:13px;color:#111;font-weight:700;white-space:normal;">${selected[service.id].price} kr</strong>
            </span>
            ${hasMultiplePlans ? `<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="10" fill="#f0f2ff"/>
              <path d="M7 9l3 3 3-3" stroke="#2B3EFF" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>` : ''}`;

          card.appendChild(pill);

          if (hasMultiplePlans) {
            const menu = document.createElement("div");
            menu.className = "plan-menu";

            service.plans.forEach(plan => {
              // Skjul den allerede valgte plan
              if (plan.name === selected[service.id]?.name) return;
              const option = document.createElement("div");
              option.className = "plan-option";
              option.textContent = `${plan.name} – ${plan.price} kr`;
              option.addEventListener("click", e => {
                e.stopPropagation();
                selected[service.id] = plan;
                render();
                calculate();
              });
              menu.appendChild(option);
            });

            pill.addEventListener("click", e => {
              e.stopPropagation();
              const isOpen = menu.classList.contains("active");
              // Luk alle andre
              document.querySelectorAll(".plan-menu.active").forEach(m => {
                m.classList.remove("active");
                m.closest(".sub-card")?.classList.remove("dropdown-open");
              });
              if (!isOpen) {
                menu.classList.add("active");
                card.classList.add("dropdown-open");
              }
            });

            card.appendChild(menu);
          }
        }

        grid.appendChild(card);
      });

      section.appendChild(grid);
      cardsEl.appendChild(section);
    });
  }

  // Hjælpefunktion til at toggle en tjeneste til/fra
  function toggleService(service) {
    if (!selected[service.id]) {
      selected[service.id] = service.plans[0];
    } else {
      delete selected[service.id];
    }
    render();
    calculate();
  }

  // 3. LUK DROPDOWN VED KLIK UDENFOR
  document.addEventListener("click", () => {
    document.querySelectorAll(".plan-menu.active").forEach(menu => {
      menu.classList.remove("active");
      menu.closest(".sub-card")?.classList.remove("dropdown-open");
    });
  });

  // 4. BEREGN OG OPDATER
  function calculate() {
    const selectedList = Object.values(selected);
    const monthly = selectedList.reduce((sum, s) => sum + s.price, 0);
    if (monthlyEl) monthlyEl.textContent = monthly + " kr";
    if (yearlyEl) yearlyEl.textContent = (monthly * 12) + " kr";
    // Insight er nu tømt for dagspris-snak
    if (insightEl) {
      insightEl.innerHTML = "";
    }
    // INTEGRATION TIL BUNDLES.JS
    if (typeof renderBundles === "function") {
      renderBundles(selected);
    }
  }

  // EVENT LISTENERS
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      Object.keys(selected).forEach(key => delete selected[key]);
      render();
      calculate();
    });
  }

  if (mobileInput) {
    mobileInput.addEventListener("input", () => calculate());
  }
});

/**
 * MOBILE PICKER
 * Chip-baseret mobilpris-vælger
 */
function initMobilePicker() {
  const chips = document.querySelectorAll('.mobile-chip');
  const customWrap = document.getElementById('mobileCustomInput');
  const customInput = document.getElementById('currentMobile');
  const hiddenInput = document.getElementById('currentMobileValue');
  if (!chips.length) return;

  // Sæt "Ved ikke" som default aktiv
  const defaultChip = document.querySelector('.mobile-chip[data-value="0"]');
  if (defaultChip) defaultChip.classList.add('active');

  function setMobileValue(value) {
    if (hiddenInput) hiddenInput.value = value;
    // Trigger bundles.js beregning
    if (typeof renderBundles === 'function') {
      renderBundles(window.selected || {});
    }
  }

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      // Fjern aktiv fra alle
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const val = chip.dataset.value;
      if (val === 'custom') {
        // Vis fritekst-felt
        if (customWrap) customWrap.style.display = 'block';
        if (customInput) customInput.focus();
        // Brug hvad der allerede er i feltet, eller 0
        setMobileValue(customInput?.value || 0);
      } else {
        // Skjul fritekst-felt
        if (customWrap) customWrap.style.display = 'none';
        setMobileValue(Number(val));
      }
    });
  });

  // Lyt på fritekst-feltet
  if (customInput) {
    customInput.addEventListener('input', () => {
      setMobileValue(Number(customInput.value) || 0);
    });
  }
}

/**
 * DATA FILTER
 * Chip-baseret datakrav-filter — filtrerer bundle-resultater i bundles.js
 */
function initDataFilter() {
  const chips       = document.querySelectorAll('.data-chip:not(.data-eu-chip)');
  const euToggle    = document.getElementById('dataEuToggle');
  const euChipsWrap = document.getElementById('dataEuChips');
  const euChips     = document.querySelectorAll('.data-eu-chip');

  if (!chips.length) return;

  // Sæt defaults — 0 betyder "ingen krav"
  window.minDataGb = 0;
  window.minEuGb   = 0;

  function triggerRebuild() {
    if (typeof renderBundles === 'function') {
      renderBundles(window.selected || {});
    }
  }

  // DK data chips
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      window.minDataGb = Number(chip.dataset.minGb);
      triggerRebuild();
    });
  });

  // EU toggle — folder EU-chips ud/ind
  if (euToggle) {
    euToggle.addEventListener('click', () => {
      const isActive = euToggle.dataset.active === 'true';
      const nowActive = !isActive;
      euToggle.dataset.active = nowActive.toString();
      if (euChipsWrap) euChipsWrap.style.display = nowActive ? 'flex' : 'none';
      if (!nowActive) {
        // Nulstil EU-krav og sæt 'Ligegyldigt' aktiv igen
        window.minEuGb = 0;
        euChips.forEach(c => c.classList.remove('active'));
        const firstEu = document.querySelector('.data-eu-chip[data-min-eu="0"]');
        if (firstEu) firstEu.classList.add('active');
        triggerRebuild();
      }
    });
  }

  // EU chips
  euChips.forEach(chip => {
    chip.addEventListener('click', () => {
      euChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      window.minEuGb = Number(chip.dataset.minEu);
      triggerRebuild();
    });
  });
}

// Kør begge pickers når DOM er klar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initMobilePicker();
    initDataFilter();
  });
} else {
  initMobilePicker();
  initDataFilter();
}