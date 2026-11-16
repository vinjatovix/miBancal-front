import type { jsPDF } from 'jspdf';

import { t } from '../../../i18n/core/t';
import type {
  PlantPdfHeader,
  PlantPdfPayload
} from '../../../types/Export/PlantPdfExport';
import {
  createPdfFlow,
  stampPageNumbers,
  type PdfFlow
} from '../utils/pdfFlow';
import {
  FONT_FAMILY,
  FONT_SIZE_DIMENSION_PT,
  FONT_SIZE_DISPLAY_PT,
  FONT_SIZE_SUBTITLE_PT,
  LINE_WEIGHT_DIMENSION_MM,
  PDF_ACCENT,
  PDF_ACCENT_DEEP,
  PDF_HAIRLINE,
  PDF_INK_MUTED,
  PDF_INK_SOFT
} from '../utils/pdfTheme';
import { renderPlantSections } from './renderPlantSections';
import { renderResourceQrGrid } from './renderResourceQrGrid';

const DISPLAY_HEIGHT_MM = 11;
const SCIENTIFIC_HEIGHT_MM = 6;
const META_HEIGHT_MM = 5;
const RULE_GAP_MM = 6;
const RULE_WEIGHT_MM = 1;
const IMAGE_MAX_HEIGHT_MM = 66;
const IMAGE_GAP_MM = 7;

function buildMetaLine(header: PlantPdfHeader): string {
  const parts: string[] = [];
  if (header.familyName) {
    parts.push(t('plant.export.pdf_family', { name: header.familyName }));
  }
  parts.push(header.generationDateLabel);
  return parts.join('   ·   ');
}

function drawHeading(doc: jsPDF, flow: PdfFlow, header: PlantPdfHeader): void {
  doc.setFont(FONT_FAMILY, 'bold');
  doc.setFontSize(FONT_SIZE_DISPLAY_PT);
  doc.setTextColor(...PDF_ACCENT_DEEP);
  doc.text(header.commonName, flow.area.xMm, flow.y + 7);
  flow.advance(DISPLAY_HEIGHT_MM);

  if (header.scientificName) {
    doc.setFont(FONT_FAMILY, 'italic');
    doc.setFontSize(FONT_SIZE_SUBTITLE_PT);
    doc.setTextColor(...PDF_INK_SOFT);
    doc.text(header.scientificName, flow.area.xMm, flow.y + 3.5);
    flow.advance(SCIENTIFIC_HEIGHT_MM);
  }

  doc.setFont(FONT_FAMILY, 'normal');
  doc.setFontSize(FONT_SIZE_DIMENSION_PT);
  doc.setTextColor(...PDF_INK_MUTED);
  doc.text(buildMetaLine(header), flow.area.xMm, flow.y + 3.2);
  flow.advance(META_HEIGHT_MM);

  doc.setDrawColor(...PDF_ACCENT);
  doc.setLineWidth(RULE_WEIGHT_MM);
  doc.line(flow.area.xMm, flow.y, flow.area.xMm + flow.area.widthMm, flow.y);
  flow.advance(RULE_GAP_MM);
}

function drawImage(doc: jsPDF, flow: PdfFlow, dataUrl: string): void {
  const properties = doc.getImageProperties(dataUrl);
  const ratio = properties.width / properties.height;
  const displayWidthMm = Math.min(
    flow.area.widthMm,
    IMAGE_MAX_HEIGHT_MM * ratio
  );
  const displayHeightMm = displayWidthMm / ratio;

  flow.ensureSpace(displayHeightMm + IMAGE_GAP_MM);
  doc.addImage(
    dataUrl,
    'JPEG',
    flow.area.xMm,
    flow.y,
    displayWidthMm,
    displayHeightMm
  );
  doc.setDrawColor(...PDF_HAIRLINE);
  doc.setLineWidth(LINE_WEIGHT_DIMENSION_MM);
  doc.rect(flow.area.xMm, flow.y, displayWidthMm, displayHeightMm);
  flow.advance(displayHeightMm + IMAGE_GAP_MM);
}

export async function renderPlantSheet(
  doc: jsPDF,
  payload: PlantPdfPayload
): Promise<void> {
  const flow = createPdfFlow(doc);
  drawHeading(doc, flow, payload.header);
  if (payload.imageDataUrl) {
    drawImage(doc, flow, payload.imageDataUrl);
  }
  renderPlantSections(doc, flow, payload.sections);
  if (payload.resources) {
    await renderResourceQrGrid(doc, flow, payload.resources);
  }
  stampPageNumbers(doc);
}
