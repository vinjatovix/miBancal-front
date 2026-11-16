export interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

function parseHex(hex: string): Rgba {
  const clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return { r, g, b, a: 1 };
  }
  if (clean.length === 4) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    const a = parseInt(clean[3] + clean[3], 16) / 255;
    return { r, g, b, a };
  }
  if (clean.length === 6) {
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return { r, g, b, a: 1 };
  }
  if (clean.length === 8) {
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    const a = parseInt(clean.slice(6, 8), 16) / 255;
    return { r, g, b, a };
  }
  throw new Error(`Invalid hex color: ${hex}`);
}

function parseAlpha(alphaStr: string): number {
  const trimmed = alphaStr.trim();
  if (trimmed.endsWith('%')) {
    return parseFloat(trimmed.slice(0, -1)) / 100;
  }
  return parseFloat(trimmed);
}

function parseRgb(color: string): Rgba {
  const match = color.match(
    /^rgba?\s*\(\s*([\d.]+)\s*[, ]\s*([\d.]+)\s*[, ]\s*([\d.]+)(?:\s*[,/]\s*([\d.%]+))?\s*\)$/i
  );
  if (!match) {
    throw new Error(`Unsupported color format: ${color}`);
  }
  const r = parseFloat(match[1]);
  const g = parseFloat(match[2]);
  const b = parseFloat(match[3]);
  const a = match[4] !== undefined ? parseAlpha(match[4]) : 1;
  return { r, g, b, a };
}

export function parseColor(color: string): Rgba {
  const trimmed = color.trim();
  if (trimmed.startsWith('#')) {
    return parseHex(trimmed);
  }
  if (trimmed.startsWith('rgb')) {
    return parseRgb(trimmed);
  }
  throw new Error(`Unsupported color: ${color}`);
}

export function blendOver(fg: Rgba, bg: Rgb): Rgb {
  return {
    r: fg.r * fg.a + bg.r * (1 - fg.a),
    g: fg.g * fg.a + bg.g * (1 - fg.a),
    b: fg.b * fg.a + bg.b * (1 - fg.a)
  };
}

export function toOpaqueRgb(color: Rgba, baseBg?: Rgb): Rgb {
  if (color.a >= 1) {
    return { r: color.r, g: color.g, b: color.b };
  }
  const base = baseBg ?? { r: 255, g: 255, b: 255 };
  return blendOver(color, base);
}

function channelLuminance(channel255: number): number {
  const c = Math.max(0, Math.min(255, channel255)) / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

export function rgbLuminance(rgb: Rgb): number {
  const rLum = channelLuminance(rgb.r);
  const gLum = channelLuminance(rgb.g);
  const bLum = channelLuminance(rgb.b);
  return 0.2126 * rLum + 0.7152 * gLum + 0.0722 * bLum;
}

export function relativeLuminance(color: string, overBg?: string): number {
  const parsed = parseColor(color);
  const base = overBg ? toOpaqueRgb(parseColor(overBg)) : undefined;
  const opaque = toOpaqueRgb(parsed, base);
  return rgbLuminance(opaque);
}

export function contrastRatio(
  colorA: string,
  colorB: string,
  overBase?: string
): number {
  const baseRgb = overBase
    ? toOpaqueRgb(parseColor(overBase))
    : { r: 255, g: 255, b: 255 };
  const parsedA = parseColor(colorA);
  const parsedB = parseColor(colorB);

  const opaqueB = toOpaqueRgb(parsedB, baseRgb);
  const opaqueA = toOpaqueRgb(parsedA, opaqueB);

  const lumA = rgbLuminance(opaqueA);
  const lumB = rgbLuminance(opaqueB);

  const lighter = Math.max(lumA, lumB);
  const darker = Math.min(lumA, lumB);

  const ratio = (lighter + 0.05) / (darker + 0.05);
  return Math.round(ratio * 100) / 100;
}
