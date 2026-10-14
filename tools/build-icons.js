/*
 * Ikon-sprite generátor: Phosphor Icons (MIT, https://phosphoricons.com) duotone ikonjaiból
 * oldalanként egy inline <symbol> sprite-ot állít elő, csak az adott oldalon használt ikonokkal.
 *
 * Használat:  node tools/build-icons.js
 * A HTML-ben az ikonok így hívhatók meg:  <svg class="ic" aria-hidden="true"><use href="#i-pin"/></svg>
 * A színt a CSS adja (lásd .ic és .ph-d a css/style.css-ben).
 */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const cache = path.join(__dirname, '.icon-cache');
const BASE = 'https://raw.githubusercontent.com/phosphor-icons/core/main/assets/';

// helyi azonosító -> Phosphor név
const MAP = {
  'i-area': 'ruler', 'i-bed': 'bed', 'i-people': 'users-three', 'i-shower': 'shower', 'i-crib': 'baby', 'i-tub': 'bathtub',
  'i-grill': 'fire-simple', 'i-pot': 'cooking-pot', 'i-highchair': 'chair', 'i-fridge': 'thermometer-cold', 'i-micro': 'oven',
  'i-kettle': 'thermometer-hot', 'i-toaster': 'bread', 'i-coffee': 'coffee', 'i-washer': 'washing-machine', 'i-dryer': 'hair-dryer',
  'i-sink': 'drop', 'i-wc': 'toilet', 'i-bottle': 'hand-soap', 'i-wifi': 'wifi-high:regular', 'i-parking': 'letter-circle-p', 'i-sofa': 'couch',
  'i-door': 'door', 'i-tree': 'tree', 'i-clock': 'clock', 'i-key': 'key', 'i-paw': 'paw-print', 'i-nosmoke': 'cigarette-slash',
  'i-cup': 'coffee', 'i-calendar': 'calendar-blank', 'i-check': 'check-circle', 'i-leaf': 'leaf', 'i-wine': 'wine',
  'i-mountain': 'mountains', 'i-car': 'car-simple', 'i-info': 'info', 'i-chat': 'chat-circle', 'i-pin': 'map-pin',
  'i-grid': 'squares-four', 'i-arrow': 'arrow-right', 'i-close': 'x', 'i-alert': 'warning-circle', 'i-globe': 'globe',
  'i-phone': 'phone', 'i-mail': 'envelope-simple', 'i-star': 'star:fill'
};
const PAGES = ['index.html', 'szoba-1/index.html', 'latnivalok/index.html'];

async function svgFor(name) {
  const [n, weight = 'duotone'] = name.split(':');
  const file = path.join(cache, `${n}-${weight}.svg`);
  if (fs.existsSync(file)) return fs.readFileSync(file, 'utf8');
  const url = `${BASE}${weight}/${n}${weight === 'regular' ? '' : '-' + weight}.svg`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  const t = await res.text();
  fs.mkdirSync(cache, { recursive: true });
  fs.writeFileSync(file, t);
  return t;
}

function symbol(id, svg) {
  let inner = svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').trim();
  // a halvány (opacity=".2") réteg kap egy osztályt, a színét a CSS adja
  inner = inner.replace(/<path ([^>]*?)opacity="0\.2"([^>]*?)\/>/g, '<path class="ph-d" $1$2/>').replace(/ +\/>/g, '/>').replace(/ {2,}/g, ' ');
  return `<symbol id="${id}" viewBox="0 0 256 256">${inner}</symbol>`;
}

(async () => {
  for (const page of PAGES) {
    const file = path.join(root, page);
    let html = fs.readFileSync(file, 'utf8');
    const ids = [...new Set([...html.matchAll(/href="#(i-[a-z0-9-]+)"/g)].map(m => m[1]))].sort();
    const missing = ids.filter(i => !MAP[i]);
    if (missing.length) throw new Error(`${page}: ismeretlen ikon: ${missing.join(', ')}`);
    const symbols = [];
    for (const id of ids) symbols.push('    ' + symbol(id, await svgFor(MAP[id])));
    const sprite = `<!-- ICON-SPRITE: Phosphor Icons (MIT) – generálva: node tools/build-icons.js -->\n<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">\n  <defs>\n${symbols.join('\n')}\n  </defs>\n</svg>\n<!-- /ICON-SPRITE -->\n`;
    if (/<!-- ICON-SPRITE[\s\S]*?<!-- \/ICON-SPRITE -->\n/.test(html)) {
      html = html.replace(/<!-- ICON-SPRITE[\s\S]*?<!-- \/ICON-SPRITE -->\n/, sprite);
    } else if (/<svg width="0" height="0"[\s\S]*?<\/svg>\n/.test(html)) {
      html = html.replace(/(?:<!--[^>]*-->\n)?<svg width="0" height="0"[\s\S]*?<\/svg>\n/, sprite);
    } else {
      html = html.replace(/<body([^>]*)>\n/, `<body$1>\n\n${sprite}\n`);
    }
    fs.writeFileSync(file, html);
    console.log(page, ids.length, 'ikon');
  }
})();
