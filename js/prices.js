(function () {
  fetch('/data/services.json')
    .then(function (res) { return res.json(); })
    .then(function (services) {
      var map = {};
      services.forEach(function (service) {
        service.plans.forEach(function (plan, index) {
          map[service.id + '.' + index] = plan.price;
        });
      });

      // Direkte priser
      document.querySelectorAll('[data-price]').forEach(function (el) {
        var key = el.getAttribute('data-price');
        if (Object.prototype.hasOwnProperty.call(map, key)) {
          el.textContent = map[key];
        }
      });

      // Årspris: data-price-year="key" → pris × 12, formateret med punktum-tusindtalsseparator
      document.querySelectorAll('[data-price-year]').forEach(function (el) {
        var key = el.getAttribute('data-price-year');
        if (Object.prototype.hasOwnProperty.call(map, key)) {
          var yearly = map[key] * 12;
          el.textContent = yearly.toLocaleString('da-DK');
        }
      });

      // Per-person: data-price-per="key" data-per="N" → pris / N, afrundet
      document.querySelectorAll('[data-price-per]').forEach(function (el) {
        var key = el.getAttribute('data-price-per');
        var n   = parseInt(el.getAttribute('data-per'), 10) || 1;
        if (Object.prototype.hasOwnProperty.call(map, key)) {
          el.textContent = Math.round(map[key] / n);
        }
      });
    })
    .catch(function () {
      // Fejl ved hentning – fallback-tekst i elementerne bevares
    });
})();
