import type { jsPDF } from 'jspdf';

import { t } from '../../../i18n/core/t';
import type {
  BedPdfExportOptions,
  BedPdfSheetData,
  CropPlanMarker
} from '../../../types/Export/BedPdfExport';
import {
  fitBox,
  getContentArea,
  type ContentArea,
  type ScaledBox
} from '../utils/pdfGeometry';
import {
  FONT_FAMILY,
  FONT_SIZE_LABEL_PT,
  FONT_SIZE_TITLE_PT,
  LINE_WEIGHT_CONTOUR_MM,
  LINE_WEIGHT_MARKER_MM,
  PDF_BED_FILL,
  PDF_INK,
  PDF_INK_MUTED,
  PDF_PAPER
} from '../utils/pdfTheme';
import { renderBedCompass } from './renderBedCompass';
import {
  DIMENSION_GUTTER_BOTTOM_MM,
  DIMENSION_GUTTER_LEFT_MM,
  renderBedDimensions
} from './renderBedDimensions';
import { renderBedGrid } from './renderBedGrid';
import { renderSpeciesTable } from './renderSpeciesTable';

const HEADER_MM = 16;
const PLAN_FRACTION = 0.6;
const COMPASS_RADIUS_MM = 7;
const COMPASS_GAP_MM = 4;
const BADGE_RADIUS_MM = 2.4;

function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
}

function drawHeader(
  doc: jsPDF,
  sheet: BedPdfSheetData,
  area: ContentArea,
  generationDate: Date | null
): void {
  doc.setTextColor(...PDF_INK);
  doc.setFont(FONT_FAMILY, 'bold');
  doc.setFontSize(FONT_SIZE_TITLE_PT);
  doc.text(
    t('bed.export.pdf_sheet_bed', { name: sheet.bedName }),
    area.xMm,
    area.yMm + 5
  );

  doc.setFont(FONT_FAMILY, 'normal');
  doc.setFontSize(FONT_SIZE_LABEL_PT);
  doc.setTextColor(...PDF_INK_MUTED);
  const dimensions = t('bed.export.pdf_sheet_dimensions', {
    width: Math.round(sheet.widthCm),
    height: Math.round(sheet.heightCm)
  });
  const meta = generationDate
    ? `${dimensions}    ${t('bed.export.pdf_sheet_date', {
        date: formatDate(generationDate)
      })}`
    : dimensions;
  doc.text(meta, area.xMm, area.yMm + 11);
}

function drawMarker(doc: jsPDF, marker: CropPlanMarker, box: ScaledBox): void {
  const cx = box.offsetXMm + marker.xCm * box.scale;
  const cy = box.offsetYMm + marker.yCm * box.scale;
  const vitalRadiusMm = marker.vitalRadiusCm * box.scale;

  doc.setDrawColor(...PDF_INK_MUTED);
  doc.setLineWidth(LINE_WEIGHT_MARKER_MM);
  doc.setLineDashPattern([0.5, 0.5], 0);
  if (vitalRadiusMm > BADGE_RADIUS_MM) {
    doc.circle(cx, cy, vitalRadiusMm, 'S');
  }
  doc.setLineDashPattern([], 0);

  doc.setDrawColor(...PDF_INK);
  doc.setFillColor(...PDF_PAPER);
  doc.setLineWidth(LINE_WEIGHT_MARKER_MM);
  doc.circle(cx, cy, BADGE_RADIUS_MM, 'FD');
  doc.setTextColor(...PDF_INK);
  doc.setFont(FONT_FAMILY, 'bold');
  doc.setFontSize(FONT_SIZE_LABEL_PT);
  doc.text(marker.speciesKey, cx, cy, {
    align: 'center',
    baseline: 'middle'
  });
}

function bedDrawingArea(
  area: ContentArea,
  options: BedPdfExportOptions
): ContentArea {
  const left = options.showDimensions ? DIMENSION_GUTTER_LEFT_MM : 0;
  const bottom = options.showDimensions ? DIMENSION_GUTTER_BOTTOM_MM : 0;
  const right = options.showCompass
    ? COMPASS_RADIUS_MM * 2 + COMPASS_GAP_MM
    : 0;
  return {
    xMm: area.xMm + left,
    yMm: area.yMm,
    widthMm: area.widthMm - left - right,
    heightMm: area.heightMm - bottom
  };
}

function drawPlan(
  doc: jsPDF,
  sheet: BedPdfSheetData,
  options: BedPdfExportOptions,
  area: ContentArea
): void {
  const box = fitBox(
    sheet.widthCm,
    sheet.heightCm,
    bedDrawingArea(area, options)
  );

  doc.setFillColor(...PDF_BED_FILL);
  doc.setDrawColor(...PDF_INK);
  doc.setLineWidth(LINE_WEIGHT_CONTOUR_MM);
  doc.setLineDashPattern([], 0);
  doc.rect(box.offsetXMm, box.offsetYMm, box.widthMm, box.heightMm, 'FD');

  if (options.showGrid) {
    renderBedGrid(doc, box, sheet.widthCm, sheet.heightCm, options.gridLayers);
  }
  if (options.showDimensions) {
    renderBedDimensions(doc, box, sheet.widthCm, sheet.heightCm);
  }
  for (const marker of sheet.markers) {
    drawMarker(doc, marker, box);
  }
  if (options.showCompass) {
    renderBedCompass(
      doc,
      {
        xMm: area.xMm + area.widthMm - COMPASS_RADIUS_MM,
        yMm: area.yMm + COMPASS_RADIUS_MM
      },
      COMPASS_RADIUS_MM,
      sheet.northAngle,
      sheet.bedAzimuth
    );
  }
}

function splitAreas(
  content: ContentArea,
  options: BedPdfExportOptions
): { plan: ContentArea | null; table: ContentArea | null } {
  const top = content.yMm + HEADER_MM;
  const height = content.heightMm - HEADER_MM;
  const base = { xMm: content.xMm, widthMm: content.widthMm };
  const wantsPlan = options.includeBedSheets;
  const wantsTable = options.includePlantList;

  if (wantsPlan && wantsTable) {
    const planHeight = height * PLAN_FRACTION;
    return {
      plan: { ...base, yMm: top, heightMm: planHeight },
      table: { ...base, yMm: top + planHeight, heightMm: height - planHeight }
    };
  }
  if (wantsPlan) {
    return { plan: { ...base, yMm: top, heightMm: height }, table: null };
  }
  return { plan: null, table: { ...base, yMm: top, heightMm: height } };
}

function renderTableWithOverflow(
  doc: jsPDF,
  area: ContentArea,
  sheet: BedPdfSheetData,
  generationDate: Date | null
): void {
  let overflow = renderSpeciesTable(
    doc,
    area,
    sheet.speciesSummary,
    sheet.isEmpty
  ).overflow;
  while (overflow.length > 0) {
    doc.addPage('a4', sheet.orientation);
    const content = getContentArea(sheet.orientation);
    drawHeader(doc, sheet, content, generationDate);
    overflow = renderSpeciesTable(
      doc,
      {
        ...content,
        yMm: content.yMm + HEADER_MM,
        heightMm: content.heightMm - HEADER_MM
      },
      overflow,
      false
    ).overflow;
  }
}

export function renderBedSheet(
  doc: jsPDF,
  sheet: BedPdfSheetData,
  options: BedPdfExportOptions,
  generationDate: Date | null = null
): void {
  const content = getContentArea(sheet.orientation);
  drawHeader(doc, sheet, content, generationDate);

  const { plan, table } = splitAreas(content, options);
  if (plan) {
    drawPlan(doc, sheet, options, plan);
  }
  if (table) {
    renderTableWithOverflow(doc, table, sheet, generationDate);
  }
}
