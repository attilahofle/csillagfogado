/* Csillag Fogadó – látnivalók oldal: tartalomjegyzék aktív eleme görgetéskor */
(function () {
  'use strict';
  var links = Array.prototype.slice.call(document.querySelectorAll('.toc a[href^="#"]'));
  var pairs = links.map(function (a) { return { link: a, target: document.querySelector(a.getAttribute('href')) }; })
    .filter(function (p) { return p.target; });
  if (!pairs.length) return;

  function update() {
    var line = window.innerHeight * 0.35, current = pairs[0];
    pairs.forEach(function (p) { if (p.target.getBoundingClientRect().top <= line) current = p; });
    pairs.forEach(function (p) { p.link.classList.toggle('is-active', p === current); });
  }
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();
