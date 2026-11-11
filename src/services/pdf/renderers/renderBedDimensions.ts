import type { jsPDF } from 'jspdf';

import { t } from '../../../i18n/core/t';
import type { ScaledBox } from '../utils/pdfGeometry';
import {
  FONT_FAMILY,
  FONT_SIZE_DIMENSION_PT,
  LINE_WEIGHT_DIMENSION_MM,
  PDF_INK_SOFT
} from '../utils/pdfTheme';

const OFFSET_MM = 7;
const EXTENSION_GAP_MM = 1.5;
const TICK_MM = 1.6;
const HEIGHT_LABEL_CLEARANCE_MM = 6;

export const DIMENSION_GUTTER_LEFT_MM = OFFSET_MM + HEIGHT_LABEL_CLEARANCE_MM;
export const DIMENSION_GUTTER_BOTTOM_MM = OFFSET_MM + TICK_MM + 1;

function dimensionLabel(valueCm: number): string {
  return t('bed.export.pdf_dimension_cm', { value: Math.round(valueCm) });
}

function tick(doc: jsPDF, x: number, y: number): void {
  doc.line(x - TICK_MM, y - TICK_MM, x + TICK_MM, y + TICK_MM);
}

function renderWidthDimension(
  doc: jsPDF,
  box: ScaledBox,
  widthCm: number
): void {
  const left = box.offsetXMm;
  const right = box.offsetXMm + box.widthMm;
  const bedBottom = box.offsetYMm + box.heightMm;
  const lineY = bedBottom + OFFSET_MM;

  doc.line(left, bedBottom + EXTENSION_GAP_MM, left, lineY + TICK_MM);
  doc.line(right, bedBottom + EXTENSION_GAP_MM, right, lineY + TICK_MM);
  doc.line(left, lineY, right, lineY);
  tick(doc, left, lineY);
  tick(doc, right, lineY);

  const label = dimensionLabel(widthCm);
  doc.text(label, (left + right) / 2, lineY - 1.5, { align: 'center' });
}

function renderHeightDimension(
  doc: jsPDF,
  box: ScaledBox,
  heightCm: number
): void {
  const top = box.offsetYMm;
  const bottom = box.offsetYMm + box.heightMm;
  const bedLeft = box.offsetXMm;
  const lineX = bedLeft - OFFSET_MM;

  doc.line(bedLeft - EXTENSION_GAP_MM, top, lineX - TICK_MM, top);
  doc.line(bedLeft - EXTENSION_GAP_MM, bottom, lineX - TICK_MM, bottom);
  doc.line(lineX, top, lineX, bottom);
  tick(doc, lineX, top);
  tick(doc, lineX, bottom);

  const label = dimensionLabel(heightCm);
  doc.text(label, lineX - 2, (top + bottom) / 2, {
    angle: 90,
    align: 'center'
  });
}

export function renderBedDimensions(
  doc: jsPDF,
  box: ScaledBox,
  widthCm: number,
  heightCm: number
): void {
  doc.setDrawColor(...PDF_INK_SOFT);
  doc.setTextColor(...PDF_INK_SOFT);
  doc.setLineWidth(LINE_WEIGHT_DIMENSION_MM);
  doc.setFontSize(FONT_SIZE_DIMENSION_PT);
  doc.setFont(FONT_FAMILY, 'normal');

  renderWidthDimension(doc, box, widthCm);
  renderHeightDimension(doc, box, heightCm);
}
