import type { jsPDF } from 'jspdf';

import { t } from '../../../i18n/core/t';
import { getContentArea, type ContentArea } from './pdfGeometry';
import { FONT_FAMILY, FONT_SIZE_LABEL_PT, PDF_INK_MUTED } from './pdfTheme';

const PAGE_NUMBER_OFFSET_MM = 6;

export interface PdfFlow {
  readonly area: ContentArea;
  y: number;
  ensureSpace(heightMm: number): void;
  advance(heightMm: number): void;
}

export function createPdfFlow(doc: jsPDF): PdfFlow {
  const area = getContentArea('portrait');
  const bottomMm = area.yMm + area.heightMm;

  const flow: PdfFlow = {
    area,
    y: area.yMm,
    ensureSpace(heightMm: number): void {
      if (heightMm >= area.heightMm) return;
      if (flow.y + heightMm <= bottomMm) return;
      doc.addPage('a4', 'portrait');
      flow.y = area.yMm;
    },
    advance(heightMm: number): void {
      flow.y += heightMm;
    }
  };

  return flow;
}

export function stampPageNumbers(doc: jsPDF): void {
  const total = doc.getNumberOfPages();
  if (total < 2) return;

  const area = getContentArea('portrait');
  const baselineMm = area.yMm + area.heightMm + PAGE_NUMBER_OFFSET_MM;
  const centerXMm = area.xMm + area.widthMm / 2;

  for (let page = 1; page <= total; page += 1) {
    doc.setPage(page);
    doc.setFont(FONT_FAMILY, 'normal');
    doc.setFontSize(FONT_SIZE_LABEL_PT);
    doc.setTextColor(...PDF_INK_MUTED);
    doc.text(
      t('plant.export.pdf_page_number', { current: page, total }),
      centerXMm,
      baselineMm,
      { align: 'center', baseline: 'middle' }
    );
  }
}
