import type { SheetOrientation } from '../../../types/Export/BedPdfExport';

export const A4_SHORT_SIDE_MM = 210;
export const A4_LONG_SIDE_MM = 297;
export const PAGE_MARGIN_MM = 12;
export const MM_PER_CM = 10;

export interface PageSize {
  readonly widthMm: number;
  readonly heightMm: number;
}

export interface ContentArea {
  readonly xMm: number;
  readonly yMm: number;
  readonly widthMm: number;
  readonly heightMm: number;
}

export interface ScaledBox {
  readonly widthMm: number;
  readonly heightMm: number;
  readonly scale: number;
  readonly offsetXMm: number;
  readonly offsetYMm: number;
}

export function getPageSize(orientation: SheetOrientation): PageSize {
  if (orientation === 'landscape') {
    return { widthMm: A4_LONG_SIDE_MM, heightMm: A4_SHORT_SIDE_MM };
  }
  return { widthMm: A4_SHORT_SIDE_MM, heightMm: A4_LONG_SIDE_MM };
}

export function getContentArea(
  orientation: SheetOrientation,
  marginMm: number = PAGE_MARGIN_MM
): ContentArea {
  const page = getPageSize(orientation);
  return {
    xMm: marginMm,
    yMm: marginMm,
    widthMm: page.widthMm - marginMm * 2,
    heightMm: page.heightMm - marginMm * 2
  };
}

export function resolveOrientation(
  widthCm: number,
  heightCm: number
): SheetOrientation {
  return widthCm >= heightCm ? 'landscape' : 'portrait';
}

export function fitBox(
  contentWidthCm: number,
  contentHeightCm: number,
  area: ContentArea
): ScaledBox {
  const centerX = area.xMm + area.widthMm / 2;
  const centerY = area.yMm + area.heightMm / 2;

  if (contentWidthCm <= 0 || contentHeightCm <= 0) {
    return {
      widthMm: 0,
      heightMm: 0,
      scale: 0,
      offsetXMm: centerX,
      offsetYMm: centerY
    };
  }

  const fitScale = Math.min(
    area.widthMm / contentWidthCm,
    area.heightMm / contentHeightCm
  );
  const scale = Math.min(fitScale, MM_PER_CM);
  const widthMm = contentWidthCm * scale;
  const heightMm = contentHeightCm * scale;

  return {
    widthMm,
    heightMm,
    scale,
    offsetXMm: area.xMm + (area.widthMm - widthMm) / 2,
    offsetYMm: area.yMm + (area.heightMm - heightMm) / 2
  };
}
