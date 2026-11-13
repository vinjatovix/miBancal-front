import { renderBedSheet } from '../../../../src/services/pdf/renderers/renderBedSheet';
import { renderSpeciesTable } from '../../../../src/services/pdf/renderers/renderSpeciesTable';
import type {
  BedPdfSheetData,
  SpeciesSummaryItem
} from '../../../../src/types/Export/BedPdfExport';
import type { ContentArea } from '../../../../src/services/pdf/utils/pdfGeometry';
import {
  LINE_WEIGHT_CONTOUR_MM,
  PDF_INK,
  PDF_PAPER
} from '../../../../src/services/pdf/utils/pdfTheme';
import { buildBedPdfExportOptions } from '../../../fixtures/pdf/buildBedPdfExport';
import { createPdfDocMock } from '../pdfDocMock';
import '../../../../src/i18n/messages/beds';

const MIN_SECONDARY_FONT_PT = 8;
const MIN_PRIMARY_FONT_PT = 10;

function buildOptions() {
  return buildBedPdfExportOptions({
    includeLocationLayout: false,
    showCompass: false
  });
}

function buildSheet(): BedPdfSheetData {
  return {
    bedId: 'bed-1',
    bedName: 'Bancal Sur',
    locationName: 'Huerto Norte',
    widthCm: 400,
    heightCm: 200,
    northAngle: 0,
    bedAzimuth: null,
    orientation: 'landscape',
    markers: [
      {
        cropId: 'c1',
        speciesKey: '1',
        xCm: 50,
        yCm: 50,
        vitalRadiusCm: 25,
        commonName: 'Tomate'
      }
    ],
    speciesSummary: [],
    isEmpty: false
  };
}

function colorArgs(args: readonly unknown[]): readonly number[] {
  return args.map(Number);
}

describe('PDF contrast and readability', () => {
  it('draws the bed contour with the heavy dark stroke weight', () => {
    const mock = createPdfDocMock();

    renderBedSheet(mock.doc, buildSheet(), buildOptions());

    expect(mock.callsOf('setLineWidth').map((call) => call.args[0])).toContain(
      LINE_WEIGHT_CONTOUR_MM
    );
    const inkStroke = mock
      .callsOf('setDrawColor')
      .some((call) => colorArgs(call.args).join(',') === PDF_INK.join(','));
    expect(inkStroke).toBe(true);
  });

  it('renders a color-independent badge on a paper fill with dark ink text', () => {
    const mock = createPdfDocMock();

    renderBedSheet(mock.doc, buildSheet(), buildOptions());

    const paperFill = mock
      .callsOf('setFillColor')
      .some((call) => colorArgs(call.args).join(',') === PDF_PAPER.join(','));
    const inkText = mock
      .callsOf('setTextColor')
      .some((call) => colorArgs(call.args).join(',') === PDF_INK.join(','));
    expect(paperFill).toBe(true);
    expect(inkText).toBe(true);
  });

  it('keeps every table font at or above the legibility minimums', () => {
    const mock = createPdfDocMock();
    const area: ContentArea = {
      xMm: 12,
      yMm: 150,
      widthMm: 186,
      heightMm: 120
    };
    const summary: SpeciesSummaryItem[] = [
      {
        key: '1',
        plantId: 'tomato',
        commonName: 'Tomate',
        scientificName: 'Solanum lycopersicum',
        familyName: 'Solanáceas',
        count: 3
      }
    ];

    renderSpeciesTable(mock.doc, area, summary, false);

    const fontSizes = mock
      .callsOf('setFontSize')
      .map((call) => Number(call.args[0]));
    expect(Math.min(...fontSizes)).toBeGreaterThanOrEqual(
      MIN_SECONDARY_FONT_PT
    );
    const headerSize = fontSizes[0];
    expect(headerSize).toBeGreaterThanOrEqual(MIN_PRIMARY_FONT_PT);
  });
});
