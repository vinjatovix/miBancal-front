import type { jsPDF } from 'jspdf';

import { t } from '../../../i18n/core/t';
import type {
  PlantPdfResourcesSection,
  ResourceQrEntry
} from '../../../types/Export/PlantPdfExport';
import type { PdfFlow } from '../utils/pdfFlow';
import { createQrMatrix, drawQrMatrix, type QrMatrix } from '../utils/qrCode';
import {
  FONT_FAMILY,
  FONT_SIZE_LABEL_PT,
  FONT_SIZE_SECTION_PT,
  FONT_SIZE_TABLE_BODY_PT,
  LINE_WEIGHT_DIMENSION_MM,
  PDF_ACCENT,
  PDF_HAIRLINE,
  PDF_INK,
  PDF_INK_MUTED
} from '../utils/pdfTheme';

const COLUMNS = 2;
const COLUMN_GAP_MM = 8;
const SECTION_GAP_MM = 7;
const TITLE_HEIGHT_MM = 7;
const TITLE_RULE_LENGTH_MM = 16;
const TITLE_RULE_WEIGHT_MM = 0.8;
const BASELINE_OFFSET_MM = 3.4;

const CARD_PADDING_MM = 5;
const QR_SIZE_MM = 30;
const LABEL_GAP_MM = 4;
const LABEL_LINE_MM = 4.2;
const CARD_ROW_GAP_MM = 6;
const CARD_HEIGHT_MM =
  CARD_PADDING_MM * 2 + QR_SIZE_MM + LABEL_GAP_MM + LABEL_LINE_MM * 3;

function columnWidthMm(flow: PdfFlow): number {
  return (flow.area.widthMm - COLUMN_GAP_MM * (COLUMNS - 1)) / COLUMNS;
}

function columnXMm(flow: PdfFlow, column: number): number {
  return flow.area.xMm + column * (columnWidthMm(flow) + COLUMN_GAP_MM);
}

function drawHeading(doc: jsPDF, flow: PdfFlow): void {
  flow.advance(SECTION_GAP_MM);
  flow.ensureSpace(TITLE_HEIGHT_MM + CARD_HEIGHT_MM);
  doc.setFont(FONT_FAMILY, 'bold');
  doc.setFontSize(FONT_SIZE_SECTION_PT);
  doc.setTextColor(...PDF_ACCENT);
  doc.text(
    t('plant.export.pdf_section_resources').toUpperCase(),
    flow.area.xMm,
    flow.y + BASELINE_OFFSET_MM
  );
  const ruleYMm = flow.y + TITLE_HEIGHT_MM - 1.5;
  doc.setDrawColor(...PDF_ACCENT);
  doc.setLineWidth(TITLE_RULE_WEIGHT_MM);
  doc.line(
    flow.area.xMm,
    ruleYMm,
    flow.area.xMm + TITLE_RULE_LENGTH_MM,
    ruleYMm
  );
  flow.advance(TITLE_HEIGHT_MM);
}

function drawEmptyNotice(doc: jsPDF, flow: PdfFlow): void {
  doc.setFont(FONT_FAMILY, 'italic');
  doc.setFontSize(FONT_SIZE_LABEL_PT);
  doc.setTextColor(...PDF_INK_MUTED);
  doc.text(
    t('plant.export.pdf_no_resources'),
    flow.area.xMm,
    flow.y + BASELINE_OFFSET_MM
  );
  flow.advance(LABEL_LINE_MM * 2);
}

function drawCardLabel(
  doc: jsPDF,
  entry: ResourceQrEntry,
  xMm: number,
  topYMm: number,
  widthMm: number
): void {
  doc.setFont(FONT_FAMILY, 'bold');
  doc.setFontSize(FONT_SIZE_TABLE_BODY_PT);
  doc.setTextColor(...PDF_INK);
  const titleLines = doc
    .splitTextToSize(entry.title, widthMm)
    .slice(0, 2) as string[];
  titleLines.forEach((line, index) => {
    doc.text(line, xMm, topYMm + LABEL_LINE_MM * (index + 1));
  });

  doc.setFont(FONT_FAMILY, 'normal');
  doc.setFontSize(FONT_SIZE_LABEL_PT);
  doc.setTextColor(...PDF_INK_MUTED);
  const typeLabel = t(`plant.export.resource_type_${entry.type}`);
  doc.text(
    `${typeLabel}  ·  ${entry.domain}`,
    xMm,
    topYMm + LABEL_LINE_MM * 3.5
  );
}

function drawCard(
  doc: jsPDF,
  flow: PdfFlow,
  entry: ResourceQrEntry,
  matrix: QrMatrix,
  column: number,
  topYMm: number
): void {
  const cardXMm = columnXMm(flow, column);
  const cardWidthMm = columnWidthMm(flow);

  doc.setDrawColor(...PDF_HAIRLINE);
  doc.setLineWidth(LINE_WEIGHT_DIMENSION_MM);
  doc.roundedRect(cardXMm, topYMm, cardWidthMm, CARD_HEIGHT_MM, 2, 2);

  const qrXMm = cardXMm + (cardWidthMm - QR_SIZE_MM) / 2;
  drawQrMatrix(doc, matrix, qrXMm, topYMm + CARD_PADDING_MM, QR_SIZE_MM);
  drawCardLabel(
    doc,
    entry,
    cardXMm + CARD_PADDING_MM,
    topYMm + CARD_PADDING_MM + QR_SIZE_MM + LABEL_GAP_MM,
    cardWidthMm - CARD_PADDING_MM * 2
  );
}

export async function renderResourceQrGrid(
  doc: jsPDF,
  flow: PdfFlow,
  section: PlantPdfResourcesSection
): Promise<void> {
  drawHeading(doc, flow);

  if (section.entries.length === 0) {
    drawEmptyNotice(doc, flow);
    return;
  }

  let column = 0;
  let rowTopYMm = flow.y;
  for (const entry of section.entries) {
    if (column === 0) {
      flow.ensureSpace(CARD_HEIGHT_MM + CARD_ROW_GAP_MM);
      rowTopYMm = flow.y;
    }
    const matrix = await createQrMatrix(entry.url);
    drawCard(doc, flow, entry, matrix, column, rowTopYMm);
    column += 1;
    if (column === COLUMNS) {
      column = 0;
      flow.advance(CARD_HEIGHT_MM + CARD_ROW_GAP_MM);
    }
  }
  if (column !== 0) {
    flow.advance(CARD_HEIGHT_MM + CARD_ROW_GAP_MM);
  }
}
