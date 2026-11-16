import type { Plant } from '../../types/Plants/Plant';
import type { PlantPdfExportOptions } from '../../types/Export/PlantPdfExport';
import { hasPlantPdfContentSelected } from './plantPdfContent';
import { buildPlantPdfPayload } from './plantPdfPayloadBuilder';
import { renderPlantSheet } from './renderers/renderPlantSheet';

export interface ExportPlantPdfParams {
  readonly plant: Plant;
  readonly options: PlantPdfExportOptions;
}

export interface ExportPlantPdfResult {
  readonly success: boolean;
  readonly filename: string;
  readonly pageCount: number;
}

export async function exportPlantToPdf(
  params: ExportPlantPdfParams,
  generationDate: Date = new Date()
): Promise<ExportPlantPdfResult> {
  if (!hasPlantPdfContentSelected(params.options)) {
    throw new Error('empty-pdf-selection');
  }

  const payload = buildPlantPdfPayload(
    params.plant,
    params.options,
    generationDate
  );

  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  await renderPlantSheet(doc, payload);
  doc.save(payload.filename);

  return {
    success: true,
    filename: payload.filename,
    pageCount: doc.getNumberOfPages()
  };
}
