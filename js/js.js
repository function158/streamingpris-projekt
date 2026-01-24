const services = [
  {
    id: "netflix",
    name: "Netflix",
    logo: "./images/netlfix_logo.png",
    plans: [
      { name: "Basis", price: 89 },
      { name: "Standard (HD)", price: 129 },
      { name: "Premium (Ultra HD)", price: 169 }
    ]
  },
  {
    id: "max",
    name: "Max",
    logo: "./images/max_logo.png",
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
    plans: [
      { name: "Standard med reklamer", price: 59 },
      { name: "Standard", price: 99 },
      { name: "Premium", price: 149 },
    ]
  },
  {
    id: "amazon-prime",
    name: "Amazon Prime",
    logo: "./images/amz-logo.png",
    plans: [
      { name: "Basis", price: 69 }
    ]
  },
  {
    id: "viaplay",
    name: "Viaplay",
    logo: "./images/viaplay-logo.png",
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
    logo: "./images/skyshowtime-logo.svg",
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
    plans: [
      { name: "Basis", price: 69 }
    ]
  },
  {
    id: "spotify",
    name: "Spotify",
    logo: "./images/spotify.svg",
    plans: [
      { name: "Basis", price: 119 }
    ]
  },
  {
    id: "podimo",
    name: "Podimo",
    logo: "./images/podimo.svg",
    plans: [
      { name: "Premium", price: 99 },
      { name: "Premium Plus", price: 129 }
    ]
  },
  {
    id: "mofibo",
    name: "Mofibo",
    logo: "./images/mofibo.svg",
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
    plans: [
      { name: "Premium", price: 119 },
      { name: "Duo", price: 159 },
      { name: "Family", price: 199 },
      { name: "Flex", price: 89 }
    ]
  }
];

document.addEventListener("DOMContentLoaded", () => {

  const resetBtn = document.getElementById("resetBtn");
  const cardsEl = document.getElementById("cards");
  const monthlyEl = document.getElementById("monthly");
  const yearlyEl = document.getElementById("yearly");
  const insightEl = document.getElementById("insight");

  const selected = {};

  function render() {
    cardsEl.innerHTML = "";

    services.forEach(service => {
      const card = document.createElement("div");
      card.className = "sub-card" + (selected[service.id] ? " selected" : "");

      card.innerHTML = `
        ${selected[service.id] ? `<div class="check">✓</div>` : ""}
        <img src="${service.logo}" alt="${service.name}">
      `;

      card.addEventListener("click", () => {
        if (!selected[service.id]) {
          selected[service.id] = service.plans[0];
        } else {
          delete selected[service.id];
        }
        render();
        calculate();
      });

      if (selected[service.id]) {
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
            selected[service.id] = plan;
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

      cardsEl.appendChild(card);
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
  }

  resetBtn.addEventListener("click", () => {
    Object.keys(selected).forEach(key => delete selected[key]);
    render();
    calculate();
  });

  render();
  calculate();
});

