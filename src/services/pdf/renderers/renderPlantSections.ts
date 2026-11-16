import type { jsPDF } from 'jspdf';

import type {
  PlantPdfContentBlock,
  PlantPdfContentRow
} from '../../../types/Export/PlantPdfExport';
import type { PdfFlow } from '../utils/pdfFlow';
import {
  FONT_FAMILY,
  FONT_SIZE_SECTION_PT,
  FONT_SIZE_TABLE_BODY_PT,
  LINE_WEIGHT_DIMENSION_MM,
  PDF_ACCENT,
  PDF_HAIRLINE,
  PDF_INK,
  PDF_INK_MUTED,
  PDF_INK_SOFT
} from '../utils/pdfTheme';

const SECTION_GAP_MM = 7;
const TITLE_HEIGHT_MM = 7;
const TITLE_RULE_LENGTH_MM = 16;
const TITLE_RULE_WEIGHT_MM = 0.8;
const LINE_HEIGHT_MM = 5.2;
const ROW_PADDING_MM = 1.6;
const LABEL_WIDTH_MM = 50;
const BULLET_INDENT_MM = 5;
const BASELINE_OFFSET_MM = 3.4;
const BULLET = '–';

interface RowLayout {
  readonly valueXMm: number;
  readonly lines: readonly string[];
  readonly heightMm: number;
}

function layoutRow(
  doc: jsPDF,
  flow: PdfFlow,
  row: PlantPdfContentRow
): RowLayout {
  const hasLabel = row.label.length > 0;
  const valueXMm = hasLabel
    ? flow.area.xMm + LABEL_WIDTH_MM
    : flow.area.xMm + BULLET_INDENT_MM;
  const valueWidthMm = flow.area.xMm + flow.area.widthMm - valueXMm;
  doc.setFontSize(FONT_SIZE_TABLE_BODY_PT);
  const lines = doc.splitTextToSize(row.value, valueWidthMm);
  return {
    valueXMm,
    lines,
    heightMm: lines.length * LINE_HEIGHT_MM + ROW_PADDING_MM
  };
}

function measureBlock(
  doc: jsPDF,
  flow: PdfFlow,
  block: PlantPdfContentBlock
): number {
  return block.rows.reduce(
    (total, row) => total + layoutRow(doc, flow, row).heightMm,
    SECTION_GAP_MM + TITLE_HEIGHT_MM
  );
}

function drawTitle(doc: jsPDF, flow: PdfFlow, title: string): void {
  flow.advance(SECTION_GAP_MM);
  doc.setFont(FONT_FAMILY, 'bold');
  doc.setFontSize(FONT_SIZE_SECTION_PT);
  doc.setTextColor(...PDF_ACCENT);
  doc.text(title.toUpperCase(), flow.area.xMm, flow.y + BASELINE_OFFSET_MM);

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

function drawKeyedRow(
  doc: jsPDF,
  flow: PdfFlow,
  row: PlantPdfContentRow,
  layout: RowLayout,
  isLast: boolean
): void {
  const baselineMm = flow.y + BASELINE_OFFSET_MM;
  doc.setFontSize(FONT_SIZE_TABLE_BODY_PT);
  doc.setFont(FONT_FAMILY, 'bold');
  doc.setTextColor(...PDF_INK_MUTED);
  doc.text(row.label, flow.area.xMm, baselineMm);

  doc.setFont(FONT_FAMILY, 'normal');
  doc.setTextColor(...PDF_INK);
  layout.lines.forEach((line, index) => {
    doc.text(line, layout.valueXMm, baselineMm + index * LINE_HEIGHT_MM);
  });

  if (!isLast) {
    const dividerYMm = flow.y + layout.heightMm - ROW_PADDING_MM / 2;
    doc.setDrawColor(...PDF_HAIRLINE);
    doc.setLineWidth(LINE_WEIGHT_DIMENSION_MM);
    doc.line(
      flow.area.xMm,
      dividerYMm,
      flow.area.xMm + flow.area.widthMm,
      dividerYMm
    );
  }
  flow.advance(layout.heightMm);
}

function drawBulletRow(doc: jsPDF, flow: PdfFlow, layout: RowLayout): void {
  const baselineMm = flow.y + BASELINE_OFFSET_MM;
  doc.setFontSize(FONT_SIZE_TABLE_BODY_PT);
  doc.setFont(FONT_FAMILY, 'bold');
  doc.setTextColor(...PDF_ACCENT);
  doc.text(BULLET, flow.area.xMm, baselineMm);

  doc.setFont(FONT_FAMILY, 'normal');
  doc.setTextColor(...PDF_INK_SOFT);
  layout.lines.forEach((line, index) => {
    doc.text(line, layout.valueXMm, baselineMm + index * LINE_HEIGHT_MM);
  });
  flow.advance(layout.heightMm);
}

function drawRows(
  doc: jsPDF,
  flow: PdfFlow,
  rows: readonly PlantPdfContentRow[]
): void {
  rows.forEach((row, index) => {
    const layout = layoutRow(doc, flow, row);
    flow.ensureSpace(layout.heightMm);
    if (row.label.length > 0) {
      drawKeyedRow(doc, flow, row, layout, index === rows.length - 1);
    } else {
      drawBulletRow(doc, flow, layout);
    }
  });
}

export function renderPlantSections(
  doc: jsPDF,
  flow: PdfFlow,
  blocks: readonly PlantPdfContentBlock[]
): void {
  for (const block of blocks) {
    flow.ensureSpace(measureBlock(doc, flow, block));
    drawTitle(doc, flow, block.title);
    drawRows(doc, flow, block.rows);
  }
}
