import type {
  PlantPdfContentBlock,
  PlantPdfExportOptions,
  PlantPdfHeader,
  PlantPdfPayload,
  PlantPdfResourcesSection,
  ResourceQrEntry
} from '../../../src/types/Export/PlantPdfExport';

export function buildPlantPdfExportOptions(
  overrides: Partial<PlantPdfExportOptions> = {}
): PlantPdfExportOptions {
  return {
    includeImage: true,
    includeQuickFacts: true,
    includeCalendar: true,
    includeSafety: true,
    includeCultivation: true,
    includeEcology: true,
    includeNotes: true,
    includeResources: true,
    imageDataUrl: null,
    ...overrides
  };
}

export function buildPlantPdfHeader(
  overrides: Partial<PlantPdfHeader> = {}
): PlantPdfHeader {
  return {
    commonName: 'Perejil',
    scientificName: 'Petroselinum crispum',
    familyName: 'Apiáceas',
    generationDateLabel: 'Fecha: 09/11/2026',
    ...overrides
  };
}

export function buildPlantPdfContentBlock(
  overrides: Partial<PlantPdfContentBlock> = {}
): PlantPdfContentBlock {
  return {
    section: 'quickFacts',
    title: 'Datos clave',
    rows: [{ label: 'Ciclo de vida', value: 'Bienal' }],
    ...overrides
  };
}

export function buildResourceQrEntry(
  overrides: Partial<ResourceQrEntry> = {}
): ResourceQrEntry {
  return {
    url: 'https://example.org/articulo-perejil',
    title: 'Guía de cultivo del perejil',
    type: 'article',
    domain: 'example.org',
    ...overrides
  };
}

export function buildPlantPdfResourcesSection(
  overrides: Partial<PlantPdfResourcesSection> = {}
): PlantPdfResourcesSection {
  return {
    entries: [buildResourceQrEntry()],
    ...overrides
  };
}

export function buildPlantPdfPayload(
  overrides: Partial<PlantPdfPayload> = {}
): PlantPdfPayload {
  return {
    filename: 'perejil-2026-11-09.pdf',
    generationDate: new Date(2026, 10, 9),
    header: buildPlantPdfHeader(),
    imageDataUrl: null,
    sections: [buildPlantPdfContentBlock()],
    resources: buildPlantPdfResourcesSection(),
    ...overrides
  };
}
