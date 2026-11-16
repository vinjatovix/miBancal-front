import { renderLocationOverviewSheet } from '../../../../src/services/pdf/renderers/renderLocationOverviewSheet';
import type { LocationOverviewPdfData } from '../../../../src/types/Export/BedPdfExport';
import { buildBedPdfExportOptions as buildOptions } from '../../../fixtures/pdf/buildBedPdfExport';
import { createPdfDocMock, textStrings } from '../pdfDocMock';
import '../../../../src/i18n/messages/beds';

function buildData(
  overrides: Partial<LocationOverviewPdfData> = {}
): LocationOverviewPdfData {
  return {
    locationId: 'loc-1',
    locationName: 'Huerto Norte',
    beds: [
      {
        id: 'bed-1',
        name: 'Bancal Sur',
        widthCm: 400,
        heightCm: 200,
        position: { x: 0, y: 0 },
        rotation: 0
      },
      {
        id: 'bed-2',
        name: 'Bancal Este',
        widthCm: 100,
        heightCm: 100,
        position: { x: 500, y: 100 },
        rotation: 0
      }
    ],
    northAngle: 0,
    orientation: 'landscape',
    bounds: { minX: 0, minY: 0, maxX: 600, maxY: 200 },
    ...overrides
  };
}

describe('renderLocationOverviewSheet', () => {
  it('draws the overview title and location metadata', () => {
    const mock = createPdfDocMock();

    renderLocationOverviewSheet(mock.doc, buildData(), buildOptions());

    const texts = textStrings(mock);
    expect(texts).toContain('Plano general de la ubicación');
    expect(texts).toContain('Ubicación: Huerto Norte');
  });

  it('draws every placed bed with its name', () => {
    const mock = createPdfDocMock();

    renderLocationOverviewSheet(mock.doc, buildData(), buildOptions());

    const texts = textStrings(mock);
    expect(texts).toContain('Bancal Sur');
    expect(texts).toContain('Bancal Este');
    expect(mock.callsOf('line').length).toBeGreaterThanOrEqual(8);
  });

  it('omits the compass when the option is disabled', () => {
    const mock = createPdfDocMock();

    renderLocationOverviewSheet(
      mock.doc,
      buildData(),
      buildOptions({ showCompass: false })
    );

    expect(mock.callsOf('circle')).toHaveLength(0);
  });
});
