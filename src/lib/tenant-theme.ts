/**
 * Builds a tenant's full colour theme from the two brand colours in its public settings
 * (GET /api/v1/tenants/by-slug/{slug}: primary and secondary). The platform theme (globals.css) is
 * a Maskani-style plum and gold; a tenant's theme keeps the same structure (tinted neutrals, accent,
 * focus ring, dark mode) but derives every token from the tenant's colours, so a customer signing in
 * to Urban Loft sees Urban Loft's palette throughout, not Codevertex's.
 *
 * Output is a stylesheet with a light and a dark block, injected for the lifetime of a tenant scope
 * (components/providers/tenant-brand-scope.tsx). Pure functions, no DOM.
 */

/** The platform's own brand colours: the default theme and the fallback for anything a tenant leaves unset. */
export const PLATFORM_PRIMARY = '#9100B0';
export const PLATFORM_SECONDARY = '#ea8022';

export interface Hsl { h: number; s: number; l: number }

const HEX = /^#?([0-9a-f]{6})$/i;

export function parseHex(hex: string | null | undefined): string | null {
  const m = HEX.exec((hex ?? '').trim());
  return m ? `#${m[1].toLowerCase()}` : null;
}

export function hexToHsl(hex: string): Hsl {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  const l = (max + min) / 2;
  if (d === 0) return { h: 0, s: 0, l: l * 100 };
  const s = d / (1 - Math.abs(2 * l - 1));
  let h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h = (h * 60 + 360) % 360;
  return { h, s: s * 100, l: l * 100 };
}

function hslToRgb({ h, s, l }: Hsl): [number, number, number] {
  const S = s / 100, L = l / 100;
  const c = (1 - Math.abs(2 * L - 1)) * S, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = L - c / 2;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

function luminance(c: Hsl): number {
  const f = (v: number) => { const x = v / 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); };
  const [r, g, b] = hslToRgb(c);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function contrast(a: Hsl, b: Hsl): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const triplet = ({ h, s, l }: Hsl) => `${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}%`;
const rgbTriplet = (c: Hsl) => hslToRgb(c).join(' ');
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

const WHITE: Hsl = { h: 0, s: 0, l: 100 };

/** Text that reads on a filled brand surface: near-black on a light brand colour, white otherwise. */
function readableOn(fill: Hsl): Hsl {
  const dark: Hsl = { h: fill.h, s: 40, l: 10 };
  return contrast(fill, WHITE) >= contrast(fill, dark) ? WHITE : dark;
}

/** Darkens a colour until it holds `min` contrast on white, so brand-coloured text stays legible. */
function legibleOnLight(c: Hsl, min = 4.5): Hsl {
  let out = { ...c };
  for (let i = 0; i < 40 && contrast(out, WHITE) < min; i++) out = { ...out, l: out.l - 1.5 };
  return out;
}

export interface TenantThemeInput {
  primary: string | null | undefined;
  secondary?: string | null | undefined;
}

/** True when the tenant has a usable primary colour; otherwise the platform theme applies. */
export function hasTenantTheme(input: TenantThemeInput): boolean {
  return parseHex(input.primary) !== null;
}

export function buildTenantThemeCss(input: TenantThemeInput): string {
  const primaryHex = parseHex(input.primary);
  if (!primaryHex) return '';
  const base = hexToHsl(primaryHex);
  // Very grey brands (black, grey) would give colourless tints; keep a whisper of hue for warmth.
  const tintS = (n: number) => clamp(base.s, 12, 60) * (n / 100) + 0;
  const secondaryHex = parseHex(input.secondary);
  // No secondary colour: fall back to the Codevertex orange, the platform's accent.
  const accent = hexToHsl(secondaryHex ?? PLATFORM_SECONDARY);

  // Light theme
  const primary = legibleOnLight({ ...base, s: clamp(base.s, 8, 100) });
  const primaryDark: Hsl = { ...primary, l: clamp(primary.l - 9, 8, 90) };
  const gold = legibleOnLight(accent, 3);
  const light = {
    background: { h: base.h, s: 20, l: 98.5 },
    foreground: { h: base.h, s: 30, l: 13 },
    secondary: { h: base.h, s: clamp(tintS(36), 8, 24), l: 94 },
    secondaryFg: { h: base.h, s: 45, l: 20 },
    muted: { h: base.h, s: clamp(tintS(26), 6, 18), l: 95 },
    mutedFg: { h: 223, s: 7, l: 40 },
    border: { h: base.h, s: clamp(tintS(24), 6, 16), l: 89 },
    input: { h: base.h, s: clamp(tintS(24), 6, 16), l: 86 },
    sidebar: { h: 30, s: 20, l: 98.5 },
    sidebarHover: { h: base.h, s: clamp(tintS(24), 6, 16), l: 93.5 },
    sidebarBorder: { h: base.h, s: clamp(tintS(20), 6, 14), l: 90 },
  };

  // Dark theme: a lighter brand so text and buttons keep contrast on the dark canvas.
  const darkPrimary: Hsl = { h: base.h, s: clamp(base.s, 25, 62), l: clamp(Math.max(base.l, 62), 62, 72) };
  const dark = {
    background: { h: base.h, s: 30, l: 8 },
    card: { h: base.h, s: 28, l: 11 },
    foreground: { h: base.h, s: 25, l: 95 },
    secondary: { h: base.h, s: 22, l: 18 },
    muted: { h: base.h, s: 18, l: 16 },
    mutedFg: { h: base.h, s: 10, l: 70 },
    border: { h: base.h, s: 18, l: 22 },
    input: { h: base.h, s: 18, l: 25 },
    sidebar: { h: base.h, s: 40, l: 7 },
    sidebarHover: { h: base.h, s: 30, l: 15 },
    sidebarBorder: { h: base.h, s: 25, l: 14 },
  };
  const darkGold: Hsl = { ...accent, s: clamp(accent.s, 40, 75), l: clamp(Math.max(accent.l, 62), 62, 74) };

  return `:root{
--primary:${triplet(primary)};--primary-dark:${triplet(primaryDark)};--primary-foreground:${triplet(readableOn(primary))};--ring:${triplet(primary)};
--background:${triplet(light.background)};--foreground:${triplet(light.foreground)};--card-foreground:${triplet(light.foreground)};--popover-foreground:${triplet(light.foreground)};
--secondary:${triplet(light.secondary)};--secondary-foreground:${triplet(light.secondaryFg)};--accent:${triplet(light.secondary)};--accent-foreground:${triplet(light.secondaryFg)};
--muted:${triplet(light.muted)};--muted-foreground:${triplet(light.mutedFg)};--border:${triplet(light.border)};--input:${triplet(light.input)};
--gold:${triplet(gold)};--gold-foreground:${triplet(readableOn(gold))};
--sidebar:${triplet(light.sidebar)};--sidebar-foreground:${triplet(light.foreground)};--sidebar-border:${triplet(light.sidebarBorder)};--sidebar-hover:${triplet(light.sidebarHover)};
--chart-1:${triplet(primary)};--chart-2:${triplet(gold)};--chart-4:${triplet({ ...primary, s: primary.s * 0.6, l: 62 })};
--tenant-primary:${primaryHex};--tenant-secondary:${secondaryHex ?? '#c8963e'};
--brand-primary:${rgbTriplet(primary)};--brand-emphasis:${rgbTriplet(gold)};--brand-dark:${rgbTriplet(primaryDark)};
}
.dark{
--primary:${triplet(darkPrimary)};--primary-dark:${triplet({ ...darkPrimary, l: darkPrimary.l - 10 })};--primary-foreground:${triplet(readableOn(darkPrimary))};--ring:${triplet(darkPrimary)};
--background:${triplet(dark.background)};--card:${triplet(dark.card)};--popover:${triplet(dark.card)};--foreground:${triplet(dark.foreground)};--card-foreground:${triplet(dark.foreground)};--popover-foreground:${triplet(dark.foreground)};
--secondary:${triplet(dark.secondary)};--secondary-foreground:${triplet(dark.foreground)};--accent:${triplet(dark.secondary)};--accent-foreground:${triplet(dark.foreground)};
--muted:${triplet(dark.muted)};--muted-foreground:${triplet(dark.mutedFg)};--border:${triplet(dark.border)};--input:${triplet(dark.input)};
--gold:${triplet(darkGold)};--gold-foreground:${triplet(readableOn(darkGold))};
--sidebar:${triplet(dark.sidebar)};--sidebar-foreground:${triplet(dark.foreground)};--sidebar-border:${triplet(dark.sidebarBorder)};--sidebar-hover:${triplet(dark.sidebarHover)};
--chart-1:${triplet(darkPrimary)};--chart-2:${triplet(darkGold)};
--brand-primary:${rgbTriplet(darkPrimary)};--brand-emphasis:${rgbTriplet(darkGold)};--brand-dark:${rgbTriplet({ ...darkPrimary, l: darkPrimary.l - 10 })};
}`;
}
