// Generates richer SVG placeholders for the demo seed.
// Each project gets a distinct visual treatment so the grid feels varied
// the way a real portfolio would. Run with: node scripts/gen-placeholders.mjs

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = resolve(__dirname, '..');

const BASE = 1600;
const dim = (rw, rh) => ({ w: BASE, h: Math.round((BASE * rh) / rw) });

const wrap = (w, h, body) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" font-family="Helvetica, Arial, sans-serif">
${body}
</svg>
`;

// ---------- Nine Volt — Concert Posters (poster) ----------

const ninevoltA = ({ w, h }) => wrap(w, h, `
  <rect width="100%" height="100%" fill="#0b3b3a"/>
  <text x="${w * 0.08}" y="${h * 0.28}" fill="#f3eede" font-size="${Math.round(w * 0.16)}" font-weight="700" letter-spacing="-8">NINE</text>
  <text x="${w * 0.08}" y="${h * 0.42}" fill="#f3eede" font-size="${Math.round(w * 0.16)}" font-weight="700" letter-spacing="-8">VOLT</text>
  <text x="${w * 0.08}" y="${h * 0.50}" fill="#d99858" font-size="${Math.round(w * 0.03)}" font-weight="500" letter-spacing="6">/ TOUR · MMXXIV</text>
  <line x1="${w * 0.08}" y1="${h * 0.62}" x2="${w * 0.92}" y2="${h * 0.62}" stroke="#f3eede" stroke-width="2"/>
  <text x="${w * 0.08}" y="${h * 0.72}" fill="#f3eede" font-size="${Math.round(w * 0.022)}" letter-spacing="3">BERLIN · 02.11 — KÖLN · 04.11 — HAMBURG · 06.11</text>
  <text x="${w * 0.08}" y="${h * 0.78}" fill="#f3eede" font-size="${Math.round(w * 0.022)}" letter-spacing="3">VIENNA · 09.11 — ZÜRICH · 11.11 — MILAN · 13.11</text>
`);

const ninevoltB = ({ w, h }) => wrap(w, h, `
  <rect width="100%" height="100%" fill="#d6532a"/>
  <text x="50%" y="${h * 0.5}" text-anchor="middle" fill="#0b0b0b" font-size="${Math.round(w * 0.32)}" font-weight="800" letter-spacing="-16">24</text>
  <text x="50%" y="${h * 0.16}" text-anchor="middle" fill="#0b0b0b" font-size="${Math.round(w * 0.03)}" font-weight="600" letter-spacing="8">NINE VOLT — LIVE</text>
  <text x="50%" y="${h * 0.84}" text-anchor="middle" fill="#0b0b0b" font-size="${Math.round(w * 0.024)}" font-weight="500" letter-spacing="6">AUTUMN TOUR / 12 CITIES / EUROPE</text>
`);

const ninevoltC = ({ w, h }) => wrap(w, h, `
  <rect width="100%" height="100%" fill="#f3eede"/>
  <g fill="#0b0b0b">
    <rect x="${w * 0.08}" y="${h * 0.10}" width="${w * 0.4}" height="${h * 0.36}"/>
    <rect x="${w * 0.52}" y="${h * 0.10}" width="${w * 0.40}" height="${h * 0.16}" fill="#d6532a"/>
    <rect x="${w * 0.52}" y="${h * 0.30}" width="${w * 0.40}" height="${h * 0.16}" fill="#0b3b3a"/>
    <text x="${w * 0.08}" y="${h * 0.56}" font-size="${Math.round(w * 0.10)}" font-weight="700" letter-spacing="-6">SET LIST</text>
    <text x="${w * 0.08}" y="${h * 0.66}" font-size="${Math.round(w * 0.022)}" letter-spacing="2">CIRCUIT — STATIC LOVE — TOWER — NIGHT MODE</text>
    <text x="${w * 0.08}" y="${h * 0.72}" font-size="${Math.round(w * 0.022)}" letter-spacing="2">PALE WATTAGE — CARRIER — VOLTAGE DRIFT</text>
  </g>
`);

// ---------- Ferrous Quarterly Issue 12 (editorial) ----------

const ferrousA = ({ w, h }) => wrap(w, h, `
  <rect width="100%" height="100%" fill="#e9e4d8"/>
  <text x="${w * 0.08}" y="${h * 0.10}" fill="#1b1b1b" font-size="${Math.round(w * 0.022)}" letter-spacing="6">FERROUS QUARTERLY</text>
  <text x="${w * 0.08}" y="${h * 0.14}" fill="#7a4a2a" font-size="${Math.round(w * 0.018)}" letter-spacing="3">— ISSUE Nº 12, SPRING '24</text>
  <text x="${w * 0.08}" y="${h * 0.48}" fill="#1b1b1b" font-size="${Math.round(w * 0.13)}" font-weight="700" letter-spacing="-10">After</text>
  <text x="${w * 0.08}" y="${h * 0.60}" fill="#1b1b1b" font-size="${Math.round(w * 0.13)}" font-weight="700" letter-spacing="-10">Concrete</text>
  <text x="${w * 0.08}" y="${h * 0.86}" fill="#1b1b1b" font-size="${Math.round(w * 0.018)}" letter-spacing="3">ESSAYS · INTERVIEWS · MATERIALS — €18</text>
`);

const ferrousB = ({ w, h }) => {
  const colX1 = w * 0.07;
  const colX3 = w * 0.73;
  const imgX = w * 0.40;
  const imgW = w * 0.30;
  const lines = (x, y, count) =>
    Array.from({ length: count })
      .map((_, i) => `<rect x="${x}" y="${y + i * 24}" width="${w * 0.20}" height="6" fill="#1b1b1b" opacity="${i % 7 === 6 ? 0 : 0.85}"/>`)
      .join('');
  return wrap(w, h, `
    <rect width="100%" height="100%" fill="#e9e4d8"/>
    <text x="${colX1}" y="${h * 0.10}" fill="#1b1b1b" font-size="${Math.round(w * 0.026)}" font-weight="700" letter-spacing="-1">A Field Guide to Rust</text>
    <text x="${colX1}" y="${h * 0.14}" fill="#7a4a2a" font-size="${Math.round(w * 0.014)}" letter-spacing="3">BY R. HOLM — PHOTOGRAPHY: A. BORISOV</text>
    ${lines(colX1, h * 0.20, 22)}
    <rect x="${imgX}" y="${h * 0.20}" width="${imgW}" height="${h * 0.48}" fill="#7a4a2a"/>
    <text x="${imgX + imgW / 2}" y="${h * 0.44}" text-anchor="middle" fill="#e9e4d8" font-size="${Math.round(w * 0.030)}" font-weight="700" letter-spacing="2">PLATE 04</text>
    ${lines(colX3, h * 0.20, 22)}
  `);
};

const ferrousC = ({ w, h }) => wrap(w, h, `
  <rect width="100%" height="100%" fill="#e9e4d8"/>
  <line x1="${w * 0.08}" y1="${h * 0.18}" x2="${w * 0.92}" y2="${h * 0.18}" stroke="#1b1b1b" stroke-width="1"/>
  <text x="${w * 0.08}" y="${h * 0.16}" fill="#1b1b1b" font-size="${Math.round(w * 0.014)}" letter-spacing="4">— PULL QUOTE</text>
  <text x="${w * 0.08}" y="${h * 0.40}" fill="#1b1b1b" font-size="${Math.round(w * 0.060)}" font-style="italic" font-weight="500" letter-spacing="-3">&#8220;The patina is the</text>
  <text x="${w * 0.08}" y="${h * 0.50}" fill="#1b1b1b" font-size="${Math.round(w * 0.060)}" font-style="italic" font-weight="500" letter-spacing="-3">building&#8217;s second</text>
  <text x="${w * 0.08}" y="${h * 0.60}" fill="#1b1b1b" font-size="${Math.round(w * 0.060)}" font-style="italic" font-weight="500" letter-spacing="-3">drawing.&#8221;</text>
  <text x="${w * 0.08}" y="${h * 0.78}" fill="#7a4a2a" font-size="${Math.round(w * 0.018)}" letter-spacing="4">— R. HOLM · ISSUE 12, p. 47</text>
`);

// ---------- Helios Coffee — Identity (logo) ----------

const heliosA = ({ w, h }) => wrap(w, h, `
  <rect width="100%" height="100%" fill="#c46a3c"/>
  <circle cx="50%" cy="50%" r="${Math.min(w, h) * 0.18}" fill="#f6e6c8"/>
  <text x="50%" y="${h * 0.51}" text-anchor="middle" dominant-baseline="middle" fill="#c46a3c" font-size="${Math.round(w * 0.05)}" font-weight="700" letter-spacing="6">HELIOS</text>
  <text x="50%" y="${h * 0.93}" text-anchor="middle" fill="#f6e6c8" font-size="${Math.round(w * 0.018)}" letter-spacing="8">— COFFEE · SINCE MMXX —</text>
`);

const heliosB = ({ w, h }) => wrap(w, h, `
  <rect width="100%" height="100%" fill="#f6e6c8"/>
  <text x="${w * 0.50}" y="${h * 0.45}" text-anchor="middle" fill="#c46a3c" font-size="${Math.round(w * 0.18)}" font-weight="800" letter-spacing="-10">HELIOS</text>
  <line x1="${w * 0.30}" y1="${h * 0.55}" x2="${w * 0.70}" y2="${h * 0.55}" stroke="#c46a3c" stroke-width="3"/>
  <text x="${w * 0.50}" y="${h * 0.66}" text-anchor="middle" fill="#1b1b1b" font-size="${Math.round(w * 0.022)}" letter-spacing="10">SLOW · ROAST · SOLAR</text>
`);

const heliosC = ({ w, h }) => {
  const swatch = (x, y, fill, label) => `
    <rect x="${x}" y="${y}" width="${w * 0.22}" height="${h * 0.40}" fill="${fill}"/>
    <text x="${x + 16}" y="${y + h * 0.40 - 16}" fill="${fill === '#1b1b1b' ? '#f6e6c8' : '#1b1b1b'}" font-size="${Math.round(w * 0.014)}" letter-spacing="2">${label}</text>
  `;
  return wrap(w, h, `
    <rect width="100%" height="100%" fill="#f6e6c8"/>
    <text x="${w * 0.06}" y="${h * 0.12}" fill="#1b1b1b" font-size="${Math.round(w * 0.018)}" letter-spacing="4">PALETTE — HELIOS COFFEE</text>
    ${swatch(w * 0.06, h * 0.20, '#c46a3c', 'SUNSET 060')}
    ${swatch(w * 0.30, h * 0.20, '#7a3a1c', 'EMBER 080')}
    ${swatch(w * 0.54, h * 0.20, '#1b1b1b', 'OBSIDIAN 100')}
    ${swatch(w * 0.78, h * 0.20, '#e9d6a5', 'OAT 020')}
  `);
};

// ---------- Manuscript Press — Series Identity (branding) ----------

const manuscriptA = ({ w, h }) => {
  const book = (x, fill, ink, title, num) => `
    <rect x="${x}" y="${h * 0.10}" width="${w * 0.10}" height="${h * 0.80}" fill="${fill}"/>
    <text transform="translate(${x + w * 0.05}, ${h * 0.55}) rotate(-90)" text-anchor="middle" fill="${ink}" font-size="${Math.round(w * 0.020)}" font-weight="700" letter-spacing="5">${title}</text>
    <text x="${x + w * 0.05}" y="${h * 0.86}" text-anchor="middle" fill="${ink}" font-size="${Math.round(w * 0.014)}" letter-spacing="4">Nº ${num}</text>
  `;
  return wrap(w, h, `
    <rect width="100%" height="100%" fill="#d8d3c7"/>
    ${book(w * 0.16, '#2a3b5c', '#e9e4d8', 'NORTH WIND', '01')}
    ${book(w * 0.30, '#5a3a2a', '#e9e4d8', 'THE QUIET CLOCK', '02')}
    ${book(w * 0.44, '#3d4a2a', '#e9e4d8', 'TWELVE FATHOMS', '03')}
    ${book(w * 0.58, '#1b1b1b', '#e9e4d8', 'BLACK MILK', '04')}
    ${book(w * 0.72, '#a23a3a', '#e9e4d8', 'WILD ESTATE', '05')}
  `);
};

const manuscriptB = ({ w, h }) => wrap(w, h, `
  <rect width="100%" height="100%" fill="#e9e4d8"/>
  <g fill="#1b1b1b">
    <text x="50%" y="${h * 0.45}" text-anchor="middle" font-size="${Math.round(w * 0.10)}" font-weight="700" letter-spacing="-4">MP</text>
    <line x1="${w * 0.42}" y1="${h * 0.55}" x2="${w * 0.58}" y2="${h * 0.55}" stroke="#1b1b1b" stroke-width="2"/>
    <text x="50%" y="${h * 0.68}" text-anchor="middle" font-size="${Math.round(w * 0.018)}" letter-spacing="6">MANUSCRIPT PRESS</text>
    <text x="50%" y="${h * 0.74}" text-anchor="middle" font-size="${Math.round(w * 0.014)}" letter-spacing="4" fill="#5a3a2a">— INDEPENDENT FICTION · EST. 1998</text>
  </g>
`);

const manuscriptC = ({ w, h }) => wrap(w, h, `
  <rect width="100%" height="100%" fill="#2a3b5c"/>
  <rect x="${w * 0.20}" y="${h * 0.10}" width="${w * 0.60}" height="${h * 0.80}" fill="#e9e4d8"/>
  <text x="50%" y="${h * 0.30}" text-anchor="middle" fill="#1b1b1b" font-size="${Math.round(w * 0.015)}" letter-spacing="6">A NOVEL BY HOLLAND VEX</text>
  <text x="50%" y="${h * 0.50}" text-anchor="middle" fill="#1b1b1b" font-size="${Math.round(w * 0.064)}" font-weight="700" letter-spacing="-3">North Wind</text>
  <text x="50%" y="${h * 0.84}" text-anchor="middle" fill="#1b1b1b" font-size="${Math.round(w * 0.014)}" letter-spacing="6">MANUSCRIPT PRESS · Nº 01</text>
`);

// ---------- Vela & Linden — Wine Label (packaging) ----------

const velaA = ({ w, h }) => wrap(w, h, `
  <rect width="100%" height="100%" fill="#3a0d12"/>
  <rect x="${w * 0.28}" y="${h * 0.14}" width="${w * 0.44}" height="${h * 0.72}" fill="#e9d8b0"/>
  <text x="50%" y="${h * 0.28}" text-anchor="middle" fill="#3a0d12" font-size="${Math.round(w * 0.020)}" letter-spacing="8">VELA &amp; LINDEN</text>
  <line x1="${w * 0.34}" y1="${h * 0.32}" x2="${w * 0.66}" y2="${h * 0.32}" stroke="#3a0d12" stroke-width="1"/>
  <text x="50%" y="${h * 0.48}" text-anchor="middle" fill="#3a0d12" font-size="${Math.round(w * 0.050)}" font-style="italic" font-weight="500" letter-spacing="-1">Solstice</text>
  <text x="50%" y="${h * 0.58}" text-anchor="middle" fill="#3a0d12" font-size="${Math.round(w * 0.020)}" letter-spacing="6">— PINOT NOIR · 2023 —</text>
  <line x1="${w * 0.34}" y1="${h * 0.66}" x2="${w * 0.66}" y2="${h * 0.66}" stroke="#3a0d12" stroke-width="1"/>
  <text x="50%" y="${h * 0.74}" text-anchor="middle" fill="#3a0d12" font-size="${Math.round(w * 0.014)}" letter-spacing="6">SONOMA COAST · CA</text>
`);

const velaB = ({ w, h }) => wrap(w, h, `
  <rect width="100%" height="100%" fill="#e9d8b0"/>
  <text x="50%" y="${h * 0.50}" text-anchor="middle" fill="#3a0d12" font-size="${Math.round(w * 0.12)}" font-style="italic" font-weight="600" letter-spacing="-4">Vela &amp; Linden</text>
  <text x="50%" y="${h * 0.62}" text-anchor="middle" fill="#3a0d12" font-size="${Math.round(w * 0.018)}" letter-spacing="14">EST. 2014</text>
`);

const velaC = ({ w, h }) => wrap(w, h, `
  <rect width="100%" height="100%" fill="#e9d8b0"/>
  <rect x="${w * 0.10}" y="${h * 0.10}" width="${w * 0.80}" height="${h * 0.80}" fill="none" stroke="#3a0d12" stroke-width="1"/>
  <text x="50%" y="${h * 0.20}" text-anchor="middle" fill="#3a0d12" font-size="${Math.round(w * 0.016)}" letter-spacing="6">— CHAPTER NOTES —</text>
  <text x="50%" y="${h * 0.40}" text-anchor="middle" fill="#3a0d12" font-size="${Math.round(w * 0.026)}" font-style="italic">cherry · cedar · violet</text>
  <text x="50%" y="${h * 0.50}" text-anchor="middle" fill="#3a0d12" font-size="${Math.round(w * 0.026)}" font-style="italic">forest floor · cocoa</text>
  <text x="50%" y="${h * 0.78}" text-anchor="middle" fill="#3a0d12" font-size="${Math.round(w * 0.014)}" letter-spacing="6">12.5% alc. — 750 ml</text>
`);

// ---------- Atlas Records — Annual Report 2024 (art-direction) ----------

const atlasA = ({ w, h }) => wrap(w, h, `
  <defs>
    <linearGradient id="atlasG1" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1a2a4a"/>
      <stop offset="1" stop-color="#a33a45"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#atlasG1)"/>
  <text x="${w * 0.06}" y="${h * 0.16}" fill="#f0e6d2" font-size="${Math.round(w * 0.018)}" letter-spacing="6">ATLAS RECORDS</text>
  <text x="${w * 0.06}" y="${h * 0.20}" fill="#f0e6d2" font-size="${Math.round(w * 0.014)}" letter-spacing="3" opacity="0.7">— ANNUAL REPORT, MMXXIV</text>
  <text x="${w * 0.06}" y="${h * 0.72}" fill="#f0e6d2" font-size="${Math.round(w * 0.034)}" font-weight="500" letter-spacing="-1">Eighteen records,</text>
  <text x="${w * 0.06}" y="${h * 0.80}" fill="#f0e6d2" font-size="${Math.round(w * 0.034)}" font-weight="500" letter-spacing="-1">two cities,</text>
  <text x="${w * 0.06}" y="${h * 0.88}" fill="#f0e6d2" font-size="${Math.round(w * 0.034)}" font-weight="500" letter-spacing="-1">one bad year.</text>
`);

const atlasB = ({ w, h }) => wrap(w, h, `
  <rect width="100%" height="100%" fill="#0e1424"/>
  <rect x="0" y="0" width="${w * 0.50}" height="${h}" fill="#a33a45"/>
  <text x="${w * 0.04}" y="${h * 0.20}" fill="#f0e6d2" font-size="${Math.round(w * 0.020)}" letter-spacing="6">— SECTION 03</text>
  <text x="${w * 0.04}" y="${h * 0.38}" fill="#f0e6d2" font-size="${Math.round(w * 0.054)}" font-weight="700" letter-spacing="-2">A list of</text>
  <text x="${w * 0.04}" y="${h * 0.46}" fill="#f0e6d2" font-size="${Math.round(w * 0.054)}" font-weight="700" letter-spacing="-2">losses.</text>
  <text x="${w * 0.54}" y="${h * 0.30}" fill="#f0e6d2" font-size="${Math.round(w * 0.014)}" letter-spacing="3">REVENUE — 12,400</text>
  <text x="${w * 0.54}" y="${h * 0.36}" fill="#f0e6d2" font-size="${Math.round(w * 0.014)}" letter-spacing="3">COSTS — 14,920</text>
  <text x="${w * 0.54}" y="${h * 0.42}" fill="#f0e6d2" font-size="${Math.round(w * 0.014)}" letter-spacing="3">NET — (2,520)</text>
  <line x1="${w * 0.54}" y1="${h * 0.46}" x2="${w * 0.92}" y2="${h * 0.46}" stroke="#f0e6d2" stroke-width="1" opacity="0.4"/>
  <text x="${w * 0.54}" y="${h * 0.54}" fill="#f0e6d2" font-size="${Math.round(w * 0.014)}" letter-spacing="3">— A YEAR OF BUILDING</text>
  <text x="${w * 0.54}" y="${h * 0.60}" fill="#f0e6d2" font-size="${Math.round(w * 0.014)}" letter-spacing="3">RATHER THAN PROFIT.</text>
`);

const atlasC = ({ w, h }) => wrap(w, h, `
  <rect width="100%" height="100%" fill="#a33a45"/>
  <text x="${w * 0.08}" y="${h * 0.20}" fill="#f0e6d2" font-size="${Math.round(w * 0.016)}" letter-spacing="6">— ON FAILURE</text>
  <text x="${w * 0.08}" y="${h * 0.40}" fill="#f0e6d2" font-size="${Math.round(w * 0.044)}" font-style="italic" font-weight="500" letter-spacing="-2">&#8220;We have learned more</text>
  <text x="${w * 0.08}" y="${h * 0.48}" fill="#f0e6d2" font-size="${Math.round(w * 0.044)}" font-style="italic" font-weight="500" letter-spacing="-2">from the records that</text>
  <text x="${w * 0.08}" y="${h * 0.56}" fill="#f0e6d2" font-size="${Math.round(w * 0.044)}" font-style="italic" font-weight="500" letter-spacing="-2">didn&#8217;t sell than the</text>
  <text x="${w * 0.08}" y="${h * 0.64}" fill="#f0e6d2" font-size="${Math.round(w * 0.044)}" font-style="italic" font-weight="500" letter-spacing="-2">ones that did.&#8221;</text>
  <text x="${w * 0.08}" y="${h * 0.80}" fill="#f0e6d2" font-size="${Math.round(w * 0.014)}" letter-spacing="6" opacity="0.8">— K. ATLAS, FOUNDER</text>
`);

// ---------- Project plate ----------

const projects = [
  { slug: '_example-poster',        ratios: [[3, 4], [3, 4], [3, 4]],    gens: [ninevoltA, ninevoltB, ninevoltC] },
  { slug: '_example-editorial',     ratios: [[3, 4], [16, 10], [3, 4]],  gens: [ferrousA, ferrousB, ferrousC] },
  { slug: '_example-logo',          ratios: [[1, 1], [16, 9], [4, 3]],   gens: [heliosA, heliosB, heliosC] },
  { slug: '_example-branding',      ratios: [[16, 9], [4, 3], [1, 1]],   gens: [manuscriptA, manuscriptB, manuscriptC] },
  { slug: '_example-packaging',     ratios: [[3, 4], [1, 1], [4, 5]],    gens: [velaA, velaB, velaC] },
  { slug: '_example-art-direction', ratios: [[16, 9], [3, 4], [4, 5]],   gens: [atlasA, atlasB, atlasC] },
];

for (const { slug, ratios, gens } of projects) {
  const dir = resolve(root, 'public', 'projects', slug);
  mkdirSync(dir, { recursive: true });
  ratios.forEach(([rw, rh], i) => {
    const size = dim(rw, rh);
    writeFileSync(resolve(dir, `0${i + 1}.svg`), gens[i](size));
  });
}

console.log('Demo-seed placeholders generated.');
