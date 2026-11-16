import type { jsPDF } from 'jspdf';

import type {
  BedPdfExportOptions,
  PdfDocumentPayload,
  SheetOrientation
} from '../../types/Export/BedPdfExport';
import {
  buildPdfPayload,
  type ExportLocationPdfParams
} from './bedPdfPayloadBuilder';
import { renderBedSheet } from './renderers/renderBedSheet';
import { renderLocationOverviewSheet } from './renderers/renderLocationOverviewSheet';

export type { ExportLocationPdfParams };

export interface ExportLocationPdfResult {
  readonly success: boolean;
  readonly filename: string;
  readonly pageCount: number;
}

interface SheetPage {
  readonly orientation: SheetOrientation;
  render(doc: jsPDF): void;
}

function collectPages(
  payload: PdfDocumentPayload,
  options: BedPdfExportOptions
): readonly SheetPage[] {
  const pages: SheetPage[] = [];
  const overview = payload.locationOverview;
  if (overview) {
    pages.push({
      orientation: overview.orientation,
      render: (doc) => renderLocationOverviewSheet(doc, overview, options)
    });
  }
  for (const sheet of payload.bedSheets) {
    pages.push({
      orientation: sheet.orientation,
      render: (doc) =>
        renderBedSheet(doc, sheet, options, payload.generationDate)
    });
  }
  return pages;
}

function renderPages(doc: jsPDF, pages: readonly SheetPage[]): void {
  pages[0].render(doc);
  for (let index = 1; index < pages.length; index += 1) {
    doc.addPage('a4', pages[index].orientation);
    pages[index].render(doc);
  }
}

export async function exportLocationLayoutToPdf(
  params: ExportLocationPdfParams,
  generationDate: Date = new Date()
): Promise<ExportLocationPdfResult> {
  const payload = buildPdfPayload(params, generationDate);
  const pages = collectPages(payload, params.options);
  if (pages.length === 0) {
    throw new Error('empty-pdf-selection');
  }

  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({
    orientation: pages[0].orientation,
    unit: 'mm',
    format: 'a4'
  });
  renderPages(doc, pages);
  doc.save(payload.filename);

  return {
    success: true,
    filename: payload.filename,
    pageCount: doc.getNumberOfPages()
  };
}
