import { renderBedCompass } from '../../../../src/services/pdf/renderers/renderBedCompass';
import { createPdfDocMock, textStrings } from '../pdfDocMock';
import '../../../../src/i18n/messages/beds';

const CENTER = { xMm: 50, yMm: 50 };

describe('renderBedCompass', () => {
  it('draws the rose circle and the north arrowhead', () => {
    const mock = createPdfDocMock();

    renderBedCompass(mock.doc, CENTER, 8, 0);

    expect(mock.callsOf('circle')).toHaveLength(1);
    expect(mock.callsOf('triangle')).toHaveLength(1);
  });

  it('labels the north direction', () => {
    const mock = createPdfDocMock();

    renderBedCompass(mock.doc, CENTER, 8, 45);

    expect(textStrings(mock)).toContain('N');
  });

  it('annotates the azimuth in degrees when provided', () => {
    const mock = createPdfDocMock();

    renderBedCompass(mock.doc, CENTER, 8, -60, 120);

    expect(textStrings(mock)).toContain('120°');
  });

  it('normalizes a negative azimuth before annotating it', () => {
    const mock = createPdfDocMock();

    renderBedCompass(mock.doc, CENTER, 8, 0, -60);

    expect(textStrings(mock)).toContain('300°');
  });

  it('omits the degree annotation when no azimuth is provided', () => {
    const mock = createPdfDocMock();

    renderBedCompass(mock.doc, CENTER, 8, 45);

    expect(textStrings(mock).some((text) => text.includes('°'))).toBe(false);
  });

  it('points the arrow straight up when no north angle is provided', () => {
    const mock = createPdfDocMock();

    renderBedCompass(mock.doc, CENTER, 10, null);

    const line = mock.callsOf('line')[0];
    const tipX = Number(line.args[2]);
    const tipY = Number(line.args[3]);
    expect(tipX).toBeCloseTo(CENTER.xMm, 5);
    expect(tipY).toBeLessThan(CENTER.yMm);
  });

  it('draws a solid arrowhead whose tip touches the rose at the north bearing', () => {
    const mock = createPdfDocMock();

    renderBedCompass(mock.doc, CENTER, 10, 90);

    const [tipX, tipY, leftX, leftY, rightX, rightY] = mock
      .callsOf('triangle')[0]
      .args.map(Number);
    const doubledArea = Math.abs(
      (leftX - tipX) * (rightY - tipY) - (rightX - tipX) * (leftY - tipY)
    );
    expect(tipX).toBeCloseTo(CENTER.xMm + 10, 5);
    expect(tipY).toBeCloseTo(CENTER.yMm, 5);
    expect(doubledArea).toBeGreaterThan(1);
  });
});
