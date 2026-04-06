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

      document.querySelectorAll('[data-price]').forEach(function (el) {
        var key = el.getAttribute('data-price');
        if (Object.prototype.hasOwnProperty.call(map, key)) {
          el.textContent = map[key];
        }
      });
    })
    .catch(function () {
      // Fejl ved hentning – fallback-tekst i elementerne bevares
    });
})();
