import {
  createQrMatrix,
  drawQrMatrix
} from '../../../../src/services/pdf/utils/qrCode';
import {
  PDF_INK,
  PDF_PAPER
} from '../../../../src/services/pdf/utils/pdfTheme';
import { createPdfDocMock } from '../pdfDocMock';

describe('createQrMatrix', () => {
  it('builds a square boolean matrix that encodes the url', async () => {
    const matrix = await createQrMatrix('https://example.org/guia');

    expect(matrix.length).toBeGreaterThan(0);
    expect(matrix.every((row) => row.length === matrix.length)).toBe(true);
    expect(matrix.some((row) => row.some((cell) => cell === true))).toBe(true);
  });

  it('differs for different urls', async () => {
    const first = await createQrMatrix('https://example.org/a');
    const second = await createQrMatrix('https://example.org/b');

    expect(JSON.stringify(first)).not.toBe(JSON.stringify(second));
  });
});

describe('drawQrMatrix', () => {
  it('paints a paper background and an ink rectangle per active module', () => {
    const mock = createPdfDocMock();
    const matrix = [
      [true, false],
      [false, true]
    ];

    drawQrMatrix(mock.doc, matrix, 10, 20, 8);

    const fillColors = mock
      .callsOf('setFillColor')
      .map((call) => call.args as number[]);
    expect(fillColors).toContainEqual([...PDF_PAPER]);
    expect(fillColors).toContainEqual([...PDF_INK]);

    const rects = mock.callsOf('rect');
    expect(rects).toHaveLength(3);
    expect(rects[0].args).toEqual([10, 20, 8, 8, 'F']);
    expect(rects[1].args).toEqual([10, 20, 4, 4, 'F']);
    expect(rects[2].args).toEqual([14, 24, 4, 4, 'F']);
  });

  it('does nothing for an empty matrix', () => {
    const mock = createPdfDocMock();

    drawQrMatrix(mock.doc, [], 0, 0, 10);

    expect(mock.callsOf('rect')).toHaveLength(0);
  });
});
