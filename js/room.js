/* Csillag Fogadó – szobaoldal (galéria, árkalkulátor) */
(function () {
  'use strict';

  /* --- Galéria + nagyítás --- */
  var items = Array.prototype.slice.call(document.querySelectorAll('[data-lb]'));
  var dlg = document.getElementById('lightbox');
  var gallery = document.getElementById('gallery');
  var counter = document.getElementById('g-counter');
  var idx = 0;

  function show(i) {
    idx = (i + items.length) % items.length;
    var img = dlg.querySelector('img');
    img.src = items[idx].getAttribute('href');
    img.alt = items[idx].dataset.alt || '';
    dlg.querySelector('figcaption').textContent = (items[idx].dataset.alt || '') + ' · ' + (idx + 1) + ' / ' + items.length;
  }
  if (dlg && typeof dlg.showModal === 'function') {
    items.forEach(function (a, i) {
      a.addEventListener('click', function (e) { e.preventDefault(); show(i); dlg.showModal(); });
    });
    dlg.querySelector('.lb-close').addEventListener('click', function () { dlg.close(); });
    dlg.querySelector('.lb-prev').addEventListener('click', function () { show(idx - 1); });
    dlg.querySelector('.lb-next').addEventListener('click', function () { show(idx + 1); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
  }

  /* Mobil: aktuális fotó sorszáma */
  if (gallery && counter) {
    gallery.addEventListener('scroll', function () {
      var w = items[0].offsetWidth + 8;
      var i = Math.min(items.length - 1, Math.round(gallery.scrollLeft / w));
      counter.textContent = (i + 1) + ' / ' + items.length;
    }, { passive: true });
  }

  /* --- Árkalkulátor (a dátumok alapértékét a main.js állítja be) --- */
  var PRICE = 26000;
  var inEl = document.getElementById('checkin');
  var outEl = document.getElementById('checkout');
  var guestsEl = document.getElementById('guests');
  var calc = document.getElementById('b-calc');
  var sub = document.getElementById('b-sub');
  var total = document.getElementById('b-total');
  if (!inEl || !outEl || !guestsEl) return;

  function ft(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' Ft'; }
  function update() {
    var nights = Math.round((new Date(outEl.value + 'T12:00') - new Date(inEl.value + 'T12:00')) / 864e5);
    var guests = parseInt(guestsEl.value, 10) || 1;
    if (!(nights > 0)) { calc.textContent = 'Válasszon dátumot'; sub.textContent = '–'; total.textContent = '–'; return; }
    var sum = PRICE * guests * nights;
    calc.textContent = ft(PRICE) + ' × ' + guests + ' fő × ' + nights + ' éj';
    sub.textContent = ft(sum);
    total.textContent = ft(sum);
  }
  [inEl, outEl, guestsEl].forEach(function (el) { el.addEventListener('change', update); });
  update();
})();
