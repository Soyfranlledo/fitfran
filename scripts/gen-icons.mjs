import sharp from 'sharp';
import { writeFileSync } from 'node:fs';

const accent = '#b6f23e';
const bg = '#0b0f14';

// Mancuerna minimalista centrada
const dumbbell = (s) => `
  <g transform="translate(${s / 2}, ${s / 2})">
    <g transform="rotate(-30)">
      <rect x="-60" y="-15" width="120" height="30" rx="15" fill="${accent}"/>
      <rect x="-98" y="-50" width="46" height="100" rx="20" fill="${accent}"/>
      <rect x="52" y="-50" width="46" height="100" rx="20" fill="${accent}"/>
      <rect x="-126" y="-32" width="24" height="64" rx="11" fill="${accent}"/>
      <rect x="102" y="-32" width="24" height="64" rx="11" fill="${accent}"/>
    </g>
  </g>`;

function svg(size, { rounded = true, scale = 1 } = {}) {
  const s = 512;
  const radius = rounded ? 112 : 0;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${s} ${s}">
    <rect width="${s}" height="${s}" rx="${radius}" fill="${bg}"/>
    <g transform="translate(${s / 2} ${s / 2}) scale(${scale}) translate(${-s / 2} ${-s / 2})">
      ${dumbbell(s)}
    </g>
  </svg>`;
}

const out = (name, size, opts) =>
  sharp(Buffer.from(svg(size, opts))).png().toFile(`public/${name}`).then(() => console.log('✓', name));

await Promise.all([
  out('pwa-192.png', 192, { rounded: false }),
  out('pwa-512.png', 512, { rounded: false }),
  out('pwa-maskable-512.png', 512, { rounded: false, scale: 0.72 }),
  out('apple-touch-icon.png', 180, { rounded: false }),
]);

// favicon SVG
writeFileSync('public/favicon.svg', svg(512, { rounded: true }));
console.log('✓ favicon.svg');
