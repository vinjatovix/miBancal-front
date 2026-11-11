import { renderBedDimensions } from '../../../../src/services/pdf/renderers/renderBedDimensions';
import { LINE_WEIGHT_DIMENSION_MM } from '../../../../src/services/pdf/utils/pdfTheme';
import type { ScaledBox } from '../../../../src/services/pdf/utils/pdfGeometry';
import { createPdfDocMock, textStrings } from '../pdfDocMock';
import '../../../../src/i18n/messages/beds';

function buildBox(): ScaledBox {
  return {
    offsetXMm: 20,
    offsetYMm: 20,
    widthMm: 100,
    heightMm: 50,
    scale: 0.25
  };
}

describe('renderBedDimensions', () => {
  it('uses the dimension line weight', () => {
    const mock = createPdfDocMock();

    renderBedDimensions(mock.doc, buildBox(), 400, 200);

    expect(mock.callsOf('setLineWidth')[0].args[0]).toBe(
      LINE_WEIGHT_DIMENSION_MM
    );
  });

  it('renders rounded metric labels for width and height', () => {
    const mock = createPdfDocMock();

    renderBedDimensions(mock.doc, buildBox(), 400, 200);

    const texts = textStrings(mock);
    expect(texts).toContain('400 cm');
    expect(texts).toContain('200 cm');
  });

  it('draws dimension and extension lines on both axes', () => {
    const mock = createPdfDocMock();

    renderBedDimensions(mock.doc, buildBox(), 400, 200);

    expect(mock.callsOf('line')).toHaveLength(10);
  });
});
