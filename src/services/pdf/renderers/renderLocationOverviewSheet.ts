import type { jsPDF } from 'jspdf';

import { t } from '../../../i18n/core/t';
import {
  rotatedRectVertices,
  type Point
} from '../../../components/beds/layout/utils/layoutGeometry';
import { normalizeAngle } from '../../../components/beds/layout/utils/cardinalGeometry';
import type {
  BedPdfExportOptions,
  LocationOverviewBedItem,
  LocationOverviewPdfData
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
  PDF_INK,
  PDF_INK_MUTED
} from '../utils/pdfTheme';
import { renderBedCompass } from './renderBedCompass';

const TITLE_BLOCK_MM = 16;
const COMPASS_RADIUS_MM = 7;

interface PlanMapper {
  readonly box: ScaledBox;
  toPage(point: Point): { x: number; y: number };
}

function createMapper(
  data: LocationOverviewPdfData,
  area: ContentArea
): PlanMapper {
  const widthCm = data.bounds.maxX - data.bounds.minX;
  const heightCm = data.bounds.maxY - data.bounds.minY;
  const box = fitBox(widthCm, heightCm, area);
  return {
    box,
    toPage: (point) => ({
      x: box.offsetXMm + (point.x - data.bounds.minX) * box.scale,
      y: box.offsetYMm + (point.y - data.bounds.minY) * box.scale
    })
  };
}

function drawBed(
  doc: jsPDF,
  bed: LocationOverviewBedItem,
  mapper: PlanMapper
): void {
  const corners = rotatedRectVertices({
    position: bed.position,
    width: bed.widthCm,
    height: bed.heightCm,
    rotation: bed.rotation
  }).map(mapper.toPage);

  doc.setDrawColor(...PDF_INK);
  doc.setLineWidth(LINE_WEIGHT_CONTOUR_MM);
  for (let index = 0; index < corners.length; index += 1) {
    const from = corners[index];
    const to = corners[(index + 1) % corners.length];
    doc.line(from.x, from.y, to.x, to.y);
  }

  const centerX =
    corners.reduce((sum, corner) => sum + corner.x, 0) / corners.length;
  const centerY =
    corners.reduce((sum, corner) => sum + corner.y, 0) / corners.length;
  doc.setTextColor(...PDF_INK_MUTED);
  doc.setFont(FONT_FAMILY, 'normal');
  doc.setFontSize(FONT_SIZE_LABEL_PT);
  doc.text(bed.name, centerX, centerY, {
    align: 'center',
    baseline: 'middle'
  });
}

function drawTitle(
  doc: jsPDF,
  data: LocationOverviewPdfData,
  area: ContentArea
): void {
  doc.setTextColor(...PDF_INK);
  doc.setFont(FONT_FAMILY, 'bold');
  doc.setFontSize(FONT_SIZE_TITLE_PT);
  doc.text(t('bed.export.pdf_overview_title'), area.xMm, area.yMm + 5);
  doc.setFont(FONT_FAMILY, 'normal');
  doc.setFontSize(FONT_SIZE_LABEL_PT);
  doc.setTextColor(...PDF_INK_MUTED);
  doc.text(
    t('bed.export.pdf_sheet_location', { name: data.locationName }),
    area.xMm,
    area.yMm + 11
  );
}

export function renderLocationOverviewSheet(
  doc: jsPDF,
  data: LocationOverviewPdfData,
  options: BedPdfExportOptions
): void {
  const content = getContentArea(data.orientation);
  drawTitle(doc, data, content);

  const planArea: ContentArea = {
    xMm: content.xMm,
    yMm: content.yMm + TITLE_BLOCK_MM,
    widthMm: content.widthMm,
    heightMm: content.heightMm - TITLE_BLOCK_MM
  };
  const mapper = createMapper(data, planArea);
  for (const bed of data.beds) {
    drawBed(doc, bed, mapper);
  }

  if (options.showCompass) {
    renderBedCompass(
      doc,
      {
        xMm: content.xMm + content.widthMm - COMPASS_RADIUS_MM,
        yMm: content.yMm + COMPASS_RADIUS_MM + 2
      },
      COMPASS_RADIUS_MM,
      data.northAngle,
      data.northAngle === null ? null : normalizeAngle(data.northAngle)
    );
  }
}
