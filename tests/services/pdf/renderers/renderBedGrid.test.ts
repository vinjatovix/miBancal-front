import { renderBedGrid } from '../../../../src/services/pdf/renderers/renderBedGrid';
import { PDF_GRID } from '../../../../src/services/pdf/utils/pdfTheme';
import type { ScaledBox } from '../../../../src/services/pdf/utils/pdfGeometry';
import type { PdfGridLayer } from '../../../../src/types/Export/BedPdfExport';
import { createPdfDocMock } from '../pdfDocMock';

function buildBox(): ScaledBox {
  return {
    offsetXMm: 0,
    offsetYMm: 0,
    widthMm: 400,
    heightMm: 200,
    scale: 1
  };
}

describe('renderBedGrid', () => {
  it('draws interior subdivision lines of a single layer without the perimeter', () => {
    const mock = createPdfDocMock();

    renderBedGrid(mock.doc, buildBox(), 400, 200, [
      { key: 'sfg', stepCm: 100 }
    ]);

    expect(mock.callsOf('line')).toHaveLength(4);
  });

  it('draws a line grid for every active layer at its own step', () => {
    const mock = createPdfDocMock();
    const layers: PdfGridLayer[] = [
      { key: 'sfg', stepCm: 100 },
      { key: 'fine', stepCm: 50 }
    ];

    renderBedGrid(mock.doc, buildBox(), 400, 200, layers);

    const sfgLines = 3 + 1;
    const fineLines = 7 + 3;
    expect(mock.callsOf('line')).toHaveLength(sfgLines + fineLines);
    expect(
      mock
        .callsOf('setDrawColor')
        .some((call) => call.args.map(Number).join(',') === PDF_GRID.join(','))
    ).toBe(true);
  });

  it('draws the coarsest layer solid and finer layers dashed', () => {
    const mock = createPdfDocMock();
    const layers: PdfGridLayer[] = [
      { key: 'fine', stepCm: 50 },
      { key: 'sfg', stepCm: 100 }
    ];

    renderBedGrid(mock.doc, buildBox(), 400, 200, layers);

    const dashPatterns = mock
      .callsOf('setLineDashPattern')
      .map((c) => c.args[0]);
    expect(dashPatterns[0]).toEqual([]);
    expect(dashPatterns[1]).toEqual([1, 1]);
    expect(dashPatterns[dashPatterns.length - 1]).toEqual([]);
  });

  it('renders nothing when no layer is active', () => {
    const mock = createPdfDocMock();

    renderBedGrid(mock.doc, buildBox(), 400, 200, []);

    expect(mock.callsOf('line')).toHaveLength(0);
  });

  it('ignores layers with a non-positive step', () => {
    const mock = createPdfDocMock();

    renderBedGrid(mock.doc, buildBox(), 400, 200, [{ key: 'sfg', stepCm: 0 }]);

    expect(mock.callsOf('line')).toHaveLength(0);
  });
});
