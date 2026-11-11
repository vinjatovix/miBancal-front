import { renderBedSheet } from '../../../../src/services/pdf/renderers/renderBedSheet';
import { renderSpeciesTable } from '../../../../src/services/pdf/renderers/renderSpeciesTable';
import type {
  BedPdfSheetData,
  SpeciesSummaryItem
} from '../../../../src/types/Export/BedPdfExport';
import type { ContentArea } from '../../../../src/services/pdf/utils/pdfGeometry';
import { buildBedPdfExportOptions } from '../../../fixtures/pdf/buildBedPdfExport';
import { createPdfDocMock, textStrings } from '../pdfDocMock';
import '../../../../src/i18n/messages/beds';

function buildSummary(count: number): SpeciesSummaryItem[] {
  return Array.from({ length: count }, (_, index) => ({
    key: String(index + 1),
    plantId: `plant-${index}`,
    commonName: `Cultivo ${index}`,
    scientificName: null,
    familyName: null,
    count: 1
  }));
}

function smallArea(): ContentArea {
  return { xMm: 12, yMm: 100, widthMm: 186, heightMm: 25 };
}

function buildOptions() {
  return buildBedPdfExportOptions({
    includeLocationLayout: false,
    includeBedSheets: false,
    showDimensions: false,
    showGrid: false,
    showCompass: false
  });
}

function buildSheet(summary: SpeciesSummaryItem[]): BedPdfSheetData {
  return {
    bedId: 'bed-1',
    bedName: 'Bancal Sur',
    locationName: 'Huerto Norte',
    widthCm: 400,
    heightCm: 200,
    northAngle: null,
    bedAzimuth: null,
    orientation: 'landscape',
    markers: [],
    speciesSummary: summary,
    isEmpty: false
  };
}

describe('species table paging', () => {
  it('splits a large catalog into two columns within one block', () => {
    const mock = createPdfDocMock();

    const result = renderSpeciesTable(
      mock.doc,
      smallArea(),
      buildSummary(5),
      false
    );

    expect(textStrings(mock).filter((text) => text === 'Clave')).toHaveLength(
      2
    );
    expect(result.overflow).toHaveLength(0);
  });

  it('returns the rows that do not fit the available columns', () => {
    const mock = createPdfDocMock();

    const result = renderSpeciesTable(
      mock.doc,
      smallArea(),
      buildSummary(10),
      false
    );

    expect(result.overflow.length).toBeGreaterThan(0);
  });

  it('adds extra pages when the species catalog overflows the sheet', () => {
    const mock = createPdfDocMock();

    renderBedSheet(mock.doc, buildSheet(buildSummary(80)), buildOptions());

    expect(mock.callsOf('addPage').length).toBeGreaterThanOrEqual(1);
  });

  it('repeats the bed header on every continuation page', () => {
    const mock = createPdfDocMock();

    renderBedSheet(mock.doc, buildSheet(buildSummary(80)), buildOptions());

    const pageCount = 1 + mock.callsOf('addPage').length;
    expect(
      textStrings(mock).filter((text) => text === 'Bancal: Bancal Sur')
    ).toHaveLength(pageCount);
  });
});
