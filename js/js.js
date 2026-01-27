const categories = {
  film: "Film & serier",
  audio: "Musik og podcasts",
  books: "Lydbøger"
};


const services = [
  {
    id: "netflix",
    name: "Netflix",
    logo: "./images/netflix-logo.svg",
    category: "film",
    plans: [
      { name: "Basis", price: 89 },
      { name: "Standard (HD)", price: 129 },
      { name: "Premium (Ultra HD)", price: 169 }
    ]
  },
  {
    id: "max",
    name: "Max",
    logo: "./images/hbo-max-logo.svg",
    category: "film",
    plans: [
      { name: "Basis med reklamer", price: 79 },
      { name: "Standard", price: 129 },
      { name: "Premium", price: 169 }
    ]
  },
  {
    id: "disney",
    name: "Disney",
    logo: "./images/disney_plus.svg",
    category: "film",
    plans: [
      { name: "Standard med reklamer", price: 59 },
      { name: "Standard", price: 99 },
      { name: "Premium", price: 149 },
    ]
  },
  {
    id: "amazon-prime",
    name: "Amazon Prime",
    logo: "./images/amazon-prime-logo.svg",
    category: "film",
    plans: [
      { name: "Basis", price: 69 }
    ]
  },
  {
    id: "viaplay",
    name: "Viaplay",
    logo: "./images/viaplay-logo.svg",
    category: "film",
    plans: [
      { name: "Film & Serier", price: 149 },
      { name: "Champions League, Film & Serier", price: 299 },
      { name: "Dansk Fodbold, Film & Serier", price: 299 },
      { name: "Premium", price: 499 }
    ]
  },
  {
    id: "skyshowtime",
    name: "SkyShowTime",
    logo: "./images/skyshowtime.svg",
    category: "film",
    plans: [
      { name: "Standard", price: 89 },
      { name: "Premium", price: 129 },
      { name: "Standard med reklamer", price: 49 }
    ]
  },
  {
    id: "tv2play",
    name: "TV2 Play",
    logo: "./images/tv2play.webp",
    category: "film",
    plans: [
      { name: "Basis med reklamer", price: 69 },
      { name: "Basis uden reklamer", price: 99 },
      { name: "Favorit med reklamer", price: 149 },
      { name: "Favorit uden reklamer", price: 179 },
      { name: "Favorit + Sport med reklamer", price: 219 },
      { name: "Favorit + Sport uden reklamer", price: 249 }
    ]
  },
  {
    id: "nordiskfilmplus",
    name: "Nordisk Film Plus",
    logo: "./images/nordiskfilmplus.png",
    category: "film",
    plans: [
      { name: "Basis", price: 69 }
    ]
  },
  {
    id: "spotify",
    name: "Spotify",
    logo: "./images/spotify.svg",
    category: "audio",
    plans: [
      { name: "Basis", price: 119 }
    ]
  },
  {
    id: "podimo",
    name: "Podimo",
    logo: "./images/podimo-logo.svg",
    category: "audio",
    plans: [
      { name: "Premium", price: 99 },
      { name: "Premium Plus", price: 129 }
    ]
  },
  {
    id: "mofibo",
    name: "Mofibo",
    logo: "./images/mofibo.svg",
    category: "books",
    plans: [
      { name: "Premium", price: 129 },
      { name: "Unlimited", price: 159 },
      { name: "Family", price: 179 },
      { name: "Flex", price: 89 }
    ]
  },
  {
    id: "deezer",
    name: "Deezer",
    logo: "./images/deezer.svg",
    category: "audio",
    plans: [
      { name: "Premium", price: 119 },
      { name: "Duo", price: 159 },
      { name: "Family", price: 199 },
      { name: "Flex", price: 89 }
    ]
  },
  {
    id: "bookbeat",
    name: "BookBeat",
    logo: "./images/bookbeat-logo.svg",
    category: "books",
    plans: [
      { name: "Basic", price: 59 },
      { name: "Standard", price: 99 },
      { name: "Premium", price: 129 }
    ]
  },
  {
    id: "saxo",
    name: "Saxo",
    logo: "./images/saxo-logo.svg",
    category: "books",
    plans: [
      { name: "Saxo Premium", price: 99 },
      { name: "Saxo Streaming", price: 79 },
      { name: "Saxo Ung", price: 59 }
    ]
  }
  
];

document.addEventListener("DOMContentLoaded", () => {

  const resetBtn = document.getElementById("resetBtn");
  const cardsEl = document.getElementById("cards");
  const monthlyEl = document.getElementById("monthly");
  const yearlyEl = document.getElementById("yearly");
  const insightEl = document.getElementById("insight");
  const feedbackBox = document.getElementById("feedbackBox");
  const feedbackThanks = document.getElementById("feedbackThanks");
  const feedbackActions = feedbackBox?.querySelector(".feedback-actions");
  const feedbackButtons = feedbackBox?.querySelectorAll(".feedback-btn");


  const selected = {};

  function render() {
    cardsEl.innerHTML = "";
  
    Object.entries(categories).forEach(([categoryKey, categoryLabel]) => {
      const servicesInCategory = services.filter(
        service => service.category === categoryKey
      );
  
      if (servicesInCategory.length === 0) return;
  
      // Section (bryder grid-kontekst)
      const section = document.createElement("section");
      section.className = "category-section";
  
      // Titel
      const heading = document.createElement("h2");
      heading.className = "category-title";
      heading.textContent = categoryLabel;
      section.appendChild(heading);
  
      // Grid for cards
      const grid = document.createElement("div");
      grid.className = "card-grid";
  
      servicesInCategory.forEach(service => {
        const card = document.createElement("div");
        const isSelected = !!selected[service.id];
  
        card.className = "sub-card" + (isSelected ? " selected" : "");
        card.innerHTML = `
          ${isSelected ? `<div class="check">✓</div>` : ""}
          <img src="${service.logo}" alt="${service.name} logo">
        `;
  
        // CARD CLICK (vælg / fravælg)
        card.addEventListener("click", () => {
          if (!selected[service.id]) {
            const plan = service.plans[0];
            selected[service.id] = plan;
  
            // TRACK: service valgt
            if (window.umami) {
              umami.track("card-selected", {
                service_id: service.id,
                service_name: service.name,
                plan: plan.name,
                price: plan.price
              });
            }
          } else {
            delete selected[service.id];
          }
  
          render();
          calculate();
        });
  
        // PLAN VALG (kun hvis valgt)
        if (isSelected) {
          const pill = document.createElement("button");
          pill.className = "plan-pill";
          pill.innerHTML = `
            ${selected[service.id].name} – ${selected[service.id].price} kr
            <span>▾</span>
          `;
  
          const menu = document.createElement("div");
          menu.className = "plan-menu";
  
          service.plans.forEach(plan => {
            const option = document.createElement("div");
            option.className = "plan-option";
            option.textContent = `${plan.name} – ${plan.price} kr`;
  
            option.addEventListener("click", e => {
              e.stopPropagation();
  
              const previousPlan = selected[service.id];
              selected[service.id] = plan;
  
              // TRACK: plan ændret
              if (
                window.umami &&
                previousPlan.name !== plan.name
              ) {
                umami.track("plan-changed", {
                  service_id: service.id,
                  service_name: service.name,
                  from_plan: previousPlan.name,
                  to_plan: plan.name,
                  price: plan.price
                });
              }
  
              render();
              calculate();
            });
  
            menu.appendChild(option);
          });
  
          pill.addEventListener("click", e => {
            e.stopPropagation();
            menu.classList.toggle("active");
          });
  
          card.appendChild(pill);
          card.appendChild(menu);
        }
  
        grid.appendChild(card);
      });
  
      section.appendChild(grid);
      cardsEl.appendChild(section);
    });
  }
  
  
  

  function updateInsight() {
    const count = Object.keys(selected).length;

    if (count === 0) {
      insightEl.textContent =
        "Vælg dine streamingtjenester for at få et overblik.";
      return;
    }

    const monthly = Object.values(selected)
      .reduce((sum, s) => sum + s.price, 0);

    const daily = Math.round((monthly / 30) * 10) / 10;

    insightEl.innerHTML = `
      Du har <strong>${count} streamingtjenester</strong> og bruger cirka
      <strong>${daily} kr om dagen</strong>.
      <br>
    `;
  }

  function calculate() {
    const monthly = Object.values(selected)
      .reduce((sum, s) => sum + s.price, 0);
  
    monthlyEl.textContent = monthly + " kr";
    yearlyEl.textContent = (monthly * 12) + " kr";
  
    updateInsight();
  
    // 👉 VIS feedback KUN når brugeren har valgt noget
    if (feedbackBox) {
      feedbackBox.hidden = monthly === 0;
    }
  }
  

  resetBtn.addEventListener("click", () => {
    Object.keys(selected).forEach(key => delete selected[key]);
    render();
    calculate();
  
    if (feedbackActions) feedbackActions.style.display = "flex";
    if (feedbackThanks) feedbackThanks.hidden = true;
  });
  

  render();
  calculate();

  feedbackButtons?.forEach(btn => {
    btn.addEventListener("click", () => {
      const answer = btn.dataset.answer;
  
      // Skjul knapper, vis tak
      if (feedbackActions) feedbackActions.style.display = "none";
      if (feedbackThanks) feedbackThanks.hidden = false;
  
      // Track i Umami
      if (window.umami) {
        umami.track("feedback_overblik", {
          answer: answer
        });
      }
    });
  });
  
  
});

