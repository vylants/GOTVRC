var SITE = {
  name: 'The Seven Kingdoms',
  short: 'A Game of Thrones Roleplay',
  tagline: 'We Do Not Sow',
  discord: 'https://discord.gg/2j9Zs5wPbV',
  era: 'The Long Night looms. The Iron Throne waits.'
};

const SHIELD = 'M60 6 L102 14 L102 70 C102 98 82 118 60 128 C38 118 18 98 18 70 L18 14 Z';

function shieldGradient(id, a, b, degTail) {
  return '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0" stop-color="' + a + '"/>' +
    '<stop offset="1" stop-color="' + b + '"/>' +
    '</linearGradient>';
}

const DEVICES = {
  kraken: function () {
    return '<g fill="none" stroke="#d8b34e" stroke-width="5" stroke-linecap="round">' +
      '<path d="M50 55 C44 44 36 38 28 36"/>' +
      '<path d="M50 55 C57 43 67 39 78 42"/>' +
      '<path d="M50 55 C40 63 33 70 22 72"/>' +
      '<path d="M50 55 C60 63 69 70 73 82"/>' +
      '<path d="M50 55 C47 66 52 80 44 88"/>' +
      '<path d="M50 55 C55 66 66 72 78 68"/>' +
      '<path d="M50 55 C42 48 32 50 26 56"/>' +
      '</g>' +
      '<circle cx="50" cy="55" r="6.5" fill="#d8b34e"/>';
  },

  wolf: function () {
    return '<g fill="#aeb6bd" stroke="#5c6570" stroke-width="2" stroke-linejoin="round">' +
      '<path d="M24 78 L22 62 L26 50 L34 30 L40 44 L52 36 L54 46 L66 54 L60 62 L46 66 L40 74 Z"/>' +
      '<path d="M54 46 L66 54 L52 58 Z" fill="#d7dce1"/>' +
      '<path d="M60 62 L46 66 L52 70 Z" fill="#8f9aa3"/>' +
      '<polygon points="48,50 52,46 56,50 52,54" fill="#14181d"/>' +
      '<circle cx="63" cy="52" r="2" fill="#14181d"/>' +
      '</g>';
  },

  lion: function () {
    return '<g fill="#e6c15c">' +
      '<circle cx="34" cy="34" r="7"/><circle cx="66" cy="34" r="7"/>' +
      '<circle cx="50" cy="55" r="31"/>' +
      '<circle cx="50" cy="55" r="22" fill="#6e1118"/>' +
      '<circle cx="50" cy="56" r="11.5"/>' +
      '<circle cx="45" cy="55" r="2.6" fill="#6e1118"/>' +
      '<circle cx="55" cy="55" r="2.6" fill="#6e1118"/>' +
      '<path d="M50 61 L44 68 L56 68 Z" fill="#6e1118"/>' +
      '</g>';
  },

  stag: function () {
    return '<g fill="#d8b34e">' +
      '<path d="M43 30 L41 20 L49 26 Z"/>' +
      '<path d="M44 54 C39 45 42 38 49 34 L52 34 C57 39 59 46 54 54 C52 58 52 63 50 69 C48 63 47 58 44 54 Z"/>' +
      '<circle cx="53" cy="42" r="2.4" fill="#11110f"/>' +
      '</g>' +
      '<g stroke="#d8b34e" stroke-width="4.5" stroke-linecap="round" fill="none">' +
      '<path d="M45 38 C36 34 30 24 33 13"/>' +
      '<path d="M39 27 L30 21"/><path d="M35 19 L27 13"/><path d="M33 13 L25 8"/>' +
      '<path d="M55 38 C62 32 68 24 65 13"/>' +
      '<path d="M61 27 L69 20"/><path d="M65 19 L72 12"/><path d="M65 13 L73 7"/>' +
      '</g>';
  },

  dragons: function () {
    const h = function () {
      return '<path d="M-9 8 L9 8 L5 2 C5 -11 1 -17 1 -17 C1 -17 -5 -11 -5 2 Z" fill="#a31624"/>' +
        '<path d="M-5 2 L5 2 L0 11 Z" fill="#d14850"/>' +
        '<circle cx="-1" cy="-8" r="1.5" fill="#16090b"/>' +
        '<path d="M-3 -12 L-1 -18 L2 -11 Z" fill="#a31624"/>';
    };
    return '<g>' +
      '<g transform="translate(50 40) scale(1.15)">' + h() + '</g>' +
      '<g transform="translate(30 64) scale(0.82) rotate(-24)">' + h() + '</g>' +
      '<g transform="translate(70 64) scale(0.82) rotate(24)">' + h() + '</g>' +
      '</g>';
  },

  falcon: function () {
    return '<path fill-rule="evenodd" d="M14 18 a 46 46 0 1 0 72 72 a 42 42 0 1 1 -72 -72" fill="#e8edf1"/>' +
      '<g fill="#cfd6dd" stroke="#98a3ac" stroke-width="1.5">' +
      '<path d="M42 44 L18 32 L34 47 Z"/>' +
      '<path d="M58 44 L82 32 L66 47 Z"/>' +
      '<ellipse cx="50" cy="54" rx="9" ry="17" transform="rotate(14 50 54)"/>' +
      '<circle cx="59" cy="41" r="5.5"/>' +
      '<path d="M47 67 L57 67 L63 78 L50 75 Z"/>' +
      '<circle cx="61" cy="40" r="1" fill="#33383c"/>' +
      '</g>';
  },

  fish: function () {
    return '<g fill="#c9d2d9" stroke="#8fa0ac" stroke-width="1.5" stroke-linejoin="round">' +
      '<ellipse cx="48" cy="52" rx="25" ry="11" transform="rotate(16 48 52)"/>' +
      '<path d="M68 48 L86 40 L81 58 Z"/>' +
      '<path d="M38 44 L50 28 L54 44 Z"/>' +
      '<circle cx="25" cy="48" r="2" fill="#2a343a"/>' +
      '<path d="M30 47 L40 45" stroke="#8fa0ac" stroke-width="1" fill="none"/>' +
      '</g>';
  },

  rose: function () {
    let out = '<g>';
    for (let i = 0; i < 8; i++) {
      const alt = i % 2 ? '#cfa52c' : '#debc5c';
      out += '<ellipse cx="50" cy="52" rx="13" ry="21" transform="rotate(' + (i * 45) + ' 50 52)" fill="' + alt + '" opacity="0.9"/>';
    }
    out += '<circle cx="50" cy="52" r="8" fill="#f0d689"/>' +
      '<path d="M50 60 L44 74 L56 74 Z" fill="#7a5c18"/>' +
      '</g>';
    return out;
  },

  empty: function () {
    return '';
  }
};

function sigilSvg(house, uid) {
  const id = 'sg-' + uid;
  const field = house.device.field;
  const generator = house.device.svg ? null : DEVICES[house.device.type];
  const device = house.device.svg || (generator ? generator() : '');
  return '<svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + house.name + ' sigil">' +
    '<defs>' + shieldGradient(id, field[0], field[1]) +
    '<filter id="sh-' + id + '" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="#000" flood-opacity="0.5"/></filter>' +
    '</defs>' +
    '<g filter="url(#sh-' + id + ')">' +
    '<path d="' + SHIELD + '" fill="url(#' + id + ')"/>' +
    '<path d="' + SHIELD + '" fill="none" stroke="#c9a227" stroke-width="3"/>' +
    '<path d="' + SHIELD + '" fill="none" stroke="#e6c15c" stroke-width="1" opacity="0.5" transform="translate(60 70) scale(0.88) translate(-60 -70)"/>' +
    '<g transform="translate(60 82) scale(0.95) translate(-50 -50)">' + device + '</g>' +
    '</g></svg>';
}
