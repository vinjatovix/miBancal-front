import { renderBedSheet } from '../../../../src/services/pdf/renderers/renderBedSheet';
import type {
  BedPdfSheetData,
  CropPlanMarker
} from '../../../../src/types/Export/BedPdfExport';
import { buildBedPdfExportOptions as buildOptions } from '../../../fixtures/pdf/buildBedPdfExport';
import { createPdfDocMock, textStrings } from '../pdfDocMock';
import '../../../../src/i18n/messages/beds';

function buildMarker(overrides: Partial<CropPlanMarker> = {}): CropPlanMarker {
  return {
    cropId: 'c1',
    speciesKey: '1',
    xCm: 50,
    yCm: 50,
    vitalRadiusCm: 25,
    commonName: 'Tomate',
    ...overrides
  };
}

function buildSheet(overrides: Partial<BedPdfSheetData> = {}): BedPdfSheetData {
  return {
    bedId: 'bed-1',
    bedName: 'Bancal Sur',
    locationName: 'Huerto Norte',
    widthCm: 400,
    heightCm: 200,
    northAngle: 0,
    bedAzimuth: null,
    orientation: 'landscape',
    markers: [buildMarker()],
    speciesSummary: [
      {
        key: '1',
        plantId: 'tomato',
        commonName: 'Tomate',
        scientificName: 'Solanum lycopersicum',
        familyName: null,
        count: 1
      }
    ],
    isEmpty: false,
    ...overrides
  };
}

describe('renderBedSheet', () => {
  it('draws the bed title, dimensions metadata and the bed contour', () => {
    const mock = createPdfDocMock();

    renderBedSheet(mock.doc, buildSheet(), buildOptions());

    const texts = textStrings(mock);
    expect(texts).toContain('Bancal: Bancal Sur');
    expect(
      texts.some((text) => text.includes('Dimensiones: 400 × 200 cm'))
    ).toBe(true);
    expect(mock.callsOf('rect').length).toBeGreaterThanOrEqual(1);
  });

  it('renders a key badge for each crop marker', () => {
    const mock = createPdfDocMock();

    renderBedSheet(
      mock.doc,
      buildSheet({
        markers: [
          buildMarker({ speciesKey: 'A' }),
          buildMarker({ speciesKey: 'B' })
        ],
        speciesSummary: []
      }),
      buildOptions()
    );

    const texts = textStrings(mock);
    expect(texts.filter((text) => text === 'A')).toHaveLength(1);
    expect(texts.filter((text) => text === 'B')).toHaveLength(1);
  });

  it('skips the plan when only the plant list is requested', () => {
    const mock = createPdfDocMock();

    renderBedSheet(
      mock.doc,
      buildSheet(),
      buildOptions({ includeBedSheets: false, includePlantList: true })
    );

    expect(mock.callsOf('circle')).toHaveLength(0);
    expect(textStrings(mock)).toContain('Clave');
  });

  it('renders the empty notice for an empty bed', () => {
    const mock = createPdfDocMock();

    renderBedSheet(
      mock.doc,
      buildSheet({ markers: [], speciesSummary: [], isEmpty: true }),
      buildOptions()
    );

    expect(textStrings(mock)).toContain(
      'Sin cultivos sembrados (plantilla de campo en blanco)'
    );
  });

  it('keeps the width dimension label above the species table header', () => {
    const mock = createPdfDocMock();

    renderBedSheet(mock.doc, buildSheet(), buildOptions());

    const widthLabel = mock
      .callsOf('text')
      .find((call) => call.args[0] === '400 cm');
    const [, bedTopMm, , bedHeightMm] = mock
      .callsOf('rect')[0]
      .args.map(Number);
    const tableHeaderTopMm = Number(mock.callsOf('rect')[1].args[1]);
    expect(Number(widthLabel?.args[2])).toBeGreaterThan(bedTopMm + bedHeightMm);
    expect(Number(widthLabel?.args[2])).toBeLessThan(tableHeaderTopMm);
  });

  it('draws the active SFG subgrid layers selected in the layout view', () => {
    const mock = createPdfDocMock();

    renderBedSheet(
      mock.doc,
      buildSheet({ markers: [] }),
      buildOptions({
        gridLayers: [
          { key: 'sfg', stepCm: 30 },
          { key: 'fine', stepCm: 5 }
        ]
      })
    );

    const singleLayerMock = createPdfDocMock();
    renderBedSheet(
      singleLayerMock.doc,
      buildSheet({ markers: [] }),
      buildOptions({ gridLayers: [{ key: 'sfg', stepCm: 30 }] })
    );

    expect(mock.callsOf('line').length).toBeGreaterThan(
      singleLayerMock.callsOf('line').length
    );
  });

  it('annotates the bed azimuth next to the compass rose', () => {
    const mock = createPdfDocMock();

    renderBedSheet(
      mock.doc,
      buildSheet({ markers: [], bedAzimuth: 120 }),
      buildOptions()
    );

    expect(textStrings(mock)).toContain('120°');
  });

  it('keeps the bed contour clear of the compass rose', () => {
    const mock = createPdfDocMock();

    renderBedSheet(
      mock.doc,
      buildSheet({ markers: [], widthCm: 400, heightCm: 100 }),
      buildOptions()
    );

    const [bedLeftMm, , bedWidthMm] = mock.callsOf('rect')[0].args.map(Number);
    const [compassXMm, , compassRadiusMm] = mock
      .callsOf('circle')[0]
      .args.map(Number);
    expect(bedLeftMm + bedWidthMm).toBeLessThan(compassXMm - compassRadiusMm);
  });
});
