// Boring-avatars style SVG generation — runs fully client-side, no CDN needed

function hashCode(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

// Seeded value in [0, max) — avoids JS bit-shift overflow issues
function sv(h: number, index: number, max: number): number {
  let v = (h ^ Math.imul(index + 1, 0x9e3779b9)) >>> 0;
  v = (v ^ (v >>> 16)) >>> 0;
  v = Math.imul(v, 0x45d9f3b) >>> 0;
  v = (v ^ (v >>> 16)) >>> 0;
  return v % max;
}

function col(palette: string[], h: number, offset: number): string {
  const raw = palette[(h + offset) % palette.length];
  return raw.startsWith("#") ? raw : "#" + raw;
}

function uid(seed: string, h: number): string {
  return (seed + h).replace(/[^a-zA-Z0-9]/g, "").slice(0, 12);
}

function toUri(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

// ─── BEAM (emoji face) ───────────────────────────────────────────────────────
function beam(seed: string, palette: string[]): string {
  const h = hashCode(seed);
  const id = uid(seed, h);

  const bg = col(palette, h, 0);
  const face = col(palette, h, 1);
  const detail = col(palette, h, 2);

  const isCircle = sv(h, 0, 2);
  const rx = isCircle ? "18" : "7";
  const wTx = sv(h, 1, 9) - 4;
  const wTy = sv(h, 2, 9) - 4;
  const wRot = sv(h, 3, 360);
  const wSc = 1 + sv(h, 4, 4) * 0.06;

  const eyeSp = sv(h, 5, 3) + 1;
  const eyeY = 13 + sv(h, 6, 3);
  const mouthY = 21 + sv(h, 7, 3);
  const mOpen = sv(h, 8, 2);
  const mW = 4 + sv(h, 9, 3);

  const fRot = sv(h, 10, 21) - 10;
  const fTx = sv(h, 11, 5) - 2;
  const fTy = sv(h, 12, 5) - 2;

  const mouth = mOpen
    ? `<path d="M${18 - mW} ${mouthY} a${mW} ${1 + sv(h, 13, 2)} 0 0 0 ${mW * 2} 0" fill="${detail}"/>`
    : `<path d="M${18 - mW} ${mouthY} q${mW} ${1 + sv(h, 13, 2)} ${mW * 2} 0" stroke="${detail}" stroke-width="1.5" fill="none" stroke-linecap="round"/>`;

  return toUri(`<svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
<defs><clipPath id="b${id}"><rect width="36" height="36" rx="18"/></clipPath></defs>
<rect width="36" height="36" fill="${bg}"/>
<g clip-path="url(#b${id})">
<rect x="0" y="0" width="36" height="36" rx="${rx}" transform="translate(${wTx} ${wTy}) rotate(${wRot} 18 18) scale(${wSc})" fill="${face}"/>
<g transform="translate(${fTx} ${fTy}) rotate(${fRot} 18 18)">
<rect x="${18 - eyeSp - 2}" y="${eyeY}" width="1.5" height="2" rx="1" fill="${detail}"/>
<rect x="${18 + eyeSp}" y="${eyeY}" width="1.5" height="2" rx="1" fill="${detail}"/>
${mouth}
</g>
</g>
</svg>`);
}

// ─── RING (concentric rings) ─────────────────────────────────────────────────
function ring(seed: string, palette: string[]): string {
  const h = hashCode(seed);
  const n = palette.length;

  const rings = [16, 13, 10, 7, 4]
    .map((r, i) => {
      const c = "#" + palette[(h + i) % n].replace("#", "");
      return `<circle cx="18" cy="18" r="${r}" stroke="${c}" stroke-width="${i === 0 ? 4 : 3}" fill="none"/>`;
    })
    .join("");

  const bg = "#" + palette[h % n].replace("#", "");
  const center = "#" + palette[(h + 3) % n].replace("#", "");

  return toUri(`<svg viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
<circle cx="18" cy="18" r="18" fill="${bg}"/>
${rings}
<circle cx="18" cy="18" r="3" fill="${center}"/>
</svg>`);
}

// ─── PIXEL (pixel art grid) ──────────────────────────────────────────────────
function pixel(seed: string, palette: string[]): string {
  const h = hashCode(seed);
  const id = uid(seed, h);
  const n = palette.length;
  const G = 6;
  const S = 6;

  const cells = [];
  for (let r = 0; r < G; r++) {
    for (let c = 0; c < G; c++) {
      const ci = sv(h, r * G + c, n);
      cells.push(
        `<rect x="${c * S}" y="${r * S}" width="${S}" height="${S}" fill="#${palette[ci].replace("#", "")}"/>`,
      );
    }
  }

  return toUri(`<svg viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
<defs><clipPath id="p${id}"><circle cx="18" cy="18" r="18"/></clipPath></defs>
<g clip-path="url(#p${id})">${cells.join("")}</g>
</svg>`);
}

// ─── SUNSET (horizontal color bands) ─────────────────────────────────────────
function sunset(seed: string, palette: string[]): string {
  const h = hashCode(seed);
  const id = uid(seed, h);
  const n = palette.length;
  const bH = 36 / n;

  const bands = palette
    .map((_, i) => {
      const c = "#" + palette[(h + i) % n].replace("#", "");
      return `<rect x="0" y="${i * bH}" width="36" height="${bH + 0.5}" fill="${c}"/>`;
    })
    .join("");

  const sunX = 6 + sv(h, 20, 20);
  const sunY = 6 + sv(h, 21, 14);
  const sunR = 4 + sv(h, 22, 4);

  return toUri(`<svg viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
<defs><clipPath id="s${id}"><circle cx="18" cy="18" r="18"/></clipPath></defs>
<g clip-path="url(#s${id})">
${bands}
<circle cx="${sunX}" cy="${sunY}" r="${sunR}" fill="rgba(255,255,255,0.22)"/>
</g>
</svg>`);
}

// ─── MARBLE (overlapping blobs) ───────────────────────────────────────────────
function marble(seed: string, palette: string[]): string {
  const h = hashCode(seed);
  const id = uid(seed, h);
  const n = palette.length;
  const bg = "#" + palette[h % n].replace("#", "");

  const blobs = Array.from({ length: 4 }, (_, i) => {
    const cx = 4 + sv(h, i * 6, 24);
    const cy = 4 + sv(h, i * 6 + 1, 24);
    const rx = 7 + sv(h, i * 6 + 2, 12);
    const ry = 5 + sv(h, i * 6 + 3, 10);
    const rot = sv(h, i * 6 + 4, 180);
    const c = "#" + palette[(h + i + 1) % n].replace("#", "");
    return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${c}" opacity="0.8" transform="rotate(${rot} ${cx} ${cy})"/>`;
  }).join("");

  return toUri(`<svg viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
<defs><clipPath id="m${id}"><circle cx="18" cy="18" r="18"/></clipPath></defs>
<circle cx="18" cy="18" r="18" fill="${bg}"/>
<g clip-path="url(#m${id})">${blobs}</g>
</svg>`);
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const PALETTES = [
  ["a855f7", "7c3aed", "4f46e5", "06b6d4", "10b981"], // cosmic
  ["264653", "2a9d8f", "e9c46a", "f4a261", "e76f51"], // earth
  ["ff006e", "fb5607", "ffbe0b", "8338ec", "3a86ff"], // neon
  ["386641", "6a994e", "a7c957", "bc4749", "f2e8cf"], // forest
  ["c9184a", "ff4d6d", "ff758c", "ffb3c1", "ff0054"], // rose
  ["03045e", "0077b6", "00b4d8", "90e0ef", "caf0f8"], // ocean
];

export type AvatarVariant = "beam" | "ring" | "pixel" | "sunset" | "marble";

const GEN: Record<AvatarVariant, (seed: string, p: string[]) => string> = {
  beam,
  ring,
  pixel,
  sunset,
  marble,
};

export function generateAvatar(
  variant: AvatarVariant,
  seed: string,
  paletteIndex: number,
): string {
  return GEN[variant](seed, PALETTES[paletteIndex % PALETTES.length]);
}

export function generateDefaultAvatar(seed: string): string {
  return beam(seed, PALETTES[0]);
}
