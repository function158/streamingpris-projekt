// ---- DESKTOP DROPDOWNS (hover med delay så man kan nå ned) ----
document.querySelectorAll(".nav-links > li").forEach((li) => {
  let closeTimer;

  li.addEventListener("mouseenter", () => {
    clearTimeout(closeTimer);
    // Luk alle andre
    document.querySelectorAll(".nav-links > li").forEach((other) => {
      if (other !== li) other.classList.remove("open");
    });
    li.classList.add("open");
  });

  li.addEventListener("mouseleave", () => {
    closeTimer = setTimeout(() => {
      li.classList.remove("open");
    }, 120); // lille delay så man kan nå ned i dropdown
  });
});

// Luk desktop dropdowns ved klik udenfor
document.addEventListener("click", (e) => {
  if (!e.target.closest(".nav-links")) {
    document.querySelectorAll(".nav-links > li").forEach((li) =>
      li.classList.remove("open")
    );
  }
});

// ---- BURGER MENU ----
const burger = document.getElementById("burgerBtn");
const mobileMenu = document.getElementById("mobileMenu");

burger.addEventListener("click", (e) => {
  e.stopPropagation();
  burger.classList.toggle("active");
  mobileMenu.classList.toggle("active");
});

// Luk mobilmenu ved klik udenfor
document.addEventListener("click", (e) => {
  if (!burger.contains(e.target) && !mobileMenu.contains(e.target)) {
    burger.classList.remove("active");
    mobileMenu.classList.remove("active");
  }
});

// ---- MOBIL SUB-MENUS (klik for at åbne/lukke) ----
document.querySelectorAll(".mobile-dd-toggle").forEach((btn) => {
  btn.addEventListener("click", () => {
    const targetId = btn.dataset.target;
    const sub = document.getElementById(targetId);
    btn.classList.toggle("open");
    sub.classList.toggle("open");
  });
});

// ---- ACCORDION – Kun én åben ad gangen (alle sider) ----
(function () {
  function initAccordion() {
    document.querySelectorAll('.extra-info details').forEach(detail => {
      detail.addEventListener('click', () => {
        if (detail.open) return;
        const parent = detail.closest('.extra-info');
        if (!parent) return;
        parent.querySelectorAll('details').forEach(other => {
          if (other !== detail) other.open = false;
        });
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAccordion);
  } else {
    initAccordion();
  }
})();