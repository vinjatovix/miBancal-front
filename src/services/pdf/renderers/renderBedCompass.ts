import type { jsPDF } from 'jspdf';

import { t } from '../../../i18n/core/t';
import { normalizeAngle } from '../../../components/beds/layout/utils/cardinalGeometry';
import {
  FONT_FAMILY,
  FONT_SIZE_HEADING_PT,
  FONT_SIZE_LABEL_PT,
  LINE_WEIGHT_MARKER_MM,
  PDF_INK,
  PDF_INK_MUTED
} from '../utils/pdfTheme';

export interface CompassCenter {
  readonly xMm: number;
  readonly yMm: number;
}

const ARROW_HALF_WIDTH_MM = 1.4;
const ARROW_LENGTH_MM = 3.2;
const LABEL_GAP_MM = 2.2;
const DEGREES_GAP_MM = 2.4;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function pointAt(
  center: CompassCenter,
  angleDeg: number,
  distanceMm: number
): { x: number; y: number } {
  const radians = toRadians(angleDeg);
  return {
    x: center.xMm + Math.sin(radians) * distanceMm,
    y: center.yMm - Math.cos(radians) * distanceMm
  };
}

export function renderBedCompass(
  doc: jsPDF,
  center: CompassCenter,
  radiusMm: number,
  northAngleDeg: number | null,
  azimuthDeg: number | null = null
): void {
  const angle = northAngleDeg ?? 0;
  doc.setDrawColor(...PDF_INK);
  doc.setFillColor(...PDF_INK);
  doc.setLineWidth(LINE_WEIGHT_MARKER_MM);
  doc.setLineDashPattern([], 0);

  doc.circle(center.xMm, center.yMm, radiusMm, 'S');

  const tip = pointAt(center, angle, radiusMm);
  const tail = pointAt(center, angle + 180, radiusMm * 0.55);
  doc.line(tail.x, tail.y, tip.x, tip.y);

  const arrowBase = pointAt(center, angle, radiusMm - ARROW_LENGTH_MM);
  const shoulderLeft = pointAt(
    { xMm: arrowBase.x, yMm: arrowBase.y },
    angle - 90,
    ARROW_HALF_WIDTH_MM
  );
  const shoulderRight = pointAt(
    { xMm: arrowBase.x, yMm: arrowBase.y },
    angle + 90,
    ARROW_HALF_WIDTH_MM
  );
  doc.triangle(
    tip.x,
    tip.y,
    shoulderLeft.x,
    shoulderLeft.y,
    shoulderRight.x,
    shoulderRight.y,
    'F'
  );

  const label = pointAt(center, angle, radiusMm + LABEL_GAP_MM + 2);
  doc.setTextColor(...PDF_INK);
  doc.setFontSize(FONT_SIZE_HEADING_PT);
  doc.setFont(FONT_FAMILY, 'bold');
  doc.text(t('bed.export.pdf_north_label'), label.x, label.y, {
    align: 'center',
    baseline: 'middle'
  });

  if (azimuthDeg !== null) {
    doc.setTextColor(...PDF_INK_MUTED);
    doc.setFontSize(FONT_SIZE_LABEL_PT);
    doc.setFont(FONT_FAMILY, 'normal');
    doc.text(
      t('bed.export.pdf_azimuth_degrees', {
        value: Math.round(normalizeAngle(azimuthDeg))
      }),
      center.xMm,
      center.yMm + radiusMm + DEGREES_GAP_MM + 2,
      { align: 'center', baseline: 'middle' }
    );
  }
}
