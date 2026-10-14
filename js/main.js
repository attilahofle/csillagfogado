/* Csillag Fogadó – nyitólap interakciók (vanilla JS) */
(function () {
  'use strict';
  var doc = document.documentElement;
  doc.classList.add('js');

  /* --- Mobil menü --- */
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('main-nav');

  function setNav(open) {
    header.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Menü bezárása' : 'Menü megnyitása');
  }
  toggle.addEventListener('click', function () {
    setNav(!header.classList.contains('nav-open'));
  });
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) setNav(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setNav(false);
  });

  /* --- Logó: görgetés az oldal tetejére, #top hash nélkül az URL-ben --- */
  document.querySelectorAll('a[href="#top"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (location.hash) history.replaceState(null, '', location.pathname + location.search);
    });
  });

  /* --- Fejléc árnyék + mobil foglalás gomb görgetéskor --- */
  var cta = document.getElementById('mobile-cta');
  var hero = document.querySelector('.hero');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 8);
    if (cta && hero) cta.classList.toggle('is-visible', y > hero.offsetHeight * 0.8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* --- Aktív menüpont a látható szakasz alapján --- */
  var spy = [];
  nav.querySelectorAll('a[href^="#"]').forEach(function (a) {
    var target = document.querySelector(a.getAttribute('href'));
    if (target) spy.push({ link: a, target: target });
  });
  function updateActive() {
    var line = window.innerHeight * 0.35, current = null;
    spy.forEach(function (s) {
      var r = s.target.getBoundingClientRect();
      if (r.top <= line && r.bottom > line) current = s.link;
    });
    spy.forEach(function (s) { s.link.classList.toggle('is-active', s.link === current); });
  }
  window.addEventListener('scroll', updateActive, { passive: true });
  window.addEventListener('resize', updateActive);
  updateActive();

  /* --- Foglalási sáv: dátumok alapértéke és összefüggése --- */
  var checkin = document.getElementById('checkin');
  var checkout = document.getElementById('checkout');
  function iso(d) {
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + m + '-' + day;
  }
  function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }

  if (checkin && checkout) {
    var today = new Date();
    checkin.min = iso(today);
    checkin.value = iso(addDays(today, 7));
    checkout.min = iso(addDays(today, 8));
    checkout.value = iso(addDays(today, 9));

    checkin.addEventListener('change', function () {
      if (!checkin.value) return;
      var next = addDays(new Date(checkin.value + 'T12:00'), 1);
      checkout.min = iso(next);
      if (!checkout.value || checkout.value <= checkin.value) checkout.value = iso(next);
    });
  }

  /* --- Kapcsolati űrlap (demó: a valós küldést a WordPress űrlap végzi majd) --- */
  var form = document.getElementById('contact-form');
  var note = document.getElementById('form-note');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        note.hidden = false;
        note.textContent = 'Kérjük, adja meg a nevét, egy érvényes e-mail címet és az üzenetét.';
        var bad = form.querySelector(':invalid');
        if (bad) bad.focus();
        return;
      }
      note.hidden = false;
      note.textContent = 'Köszönjük az üzenetét! Hamarosan válaszolunk.';
      form.reset();
    });
  }

  /* --- GYIK: egyszerre csak egy kérdés legyen nyitva --- */
  var faqs = document.querySelectorAll('.faq-list details');
  faqs.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (!d.open) return;
      faqs.forEach(function (o) { if (o !== d) o.open = false; });
    });
  });

  /* --- Finom megjelenés görgetéskor (csak a még nem látható elemeknél) --- */
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce && 'IntersectionObserver' in window) {
    var items = document.querySelectorAll('.reveal');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.remove('is-pending');
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (el, i) {
      var r = el.getBoundingClientRect();
      if (r.top > window.innerHeight) {
        el.classList.add('is-pending');
        el.style.transitionDelay = (i % 3) * 80 + 'ms';
        io.observe(el);
      }
    });
  }

  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
