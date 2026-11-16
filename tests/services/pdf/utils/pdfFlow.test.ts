import { createPdfFlow } from '../../../../src/services/pdf/utils/pdfFlow';
import { getContentArea } from '../../../../src/services/pdf/utils/pdfGeometry';
import { createPdfDocMock } from '../pdfDocMock';

describe('createPdfFlow', () => {
  it('starts the cursor at the top of the portrait content area', () => {
    const mock = createPdfDocMock();
    const area = getContentArea('portrait');

    const flow = createPdfFlow(mock.doc);

    expect(flow.y).toBe(area.yMm);
    expect(flow.area.widthMm).toBe(area.widthMm);
  });

  it('advances the cursor without adding a page when the block fits', () => {
    const mock = createPdfDocMock();
    const flow = createPdfFlow(mock.doc);
    const startY = flow.y;

    flow.ensureSpace(20);
    flow.advance(20);

    expect(mock.callsOf('addPage')).toHaveLength(0);
    expect(flow.y).toBe(startY + 20);
  });

  it('inserts a page and resets the cursor when the block does not fit', () => {
    const mock = createPdfDocMock();
    const area = getContentArea('portrait');
    const flow = createPdfFlow(mock.doc);

    flow.ensureSpace(area.heightMm - 5);
    flow.advance(area.heightMm - 5);
    flow.ensureSpace(20);

    expect(mock.callsOf('addPage')).toHaveLength(1);
    expect(flow.y).toBe(area.yMm);
  });

  it('does not add a page when the block height exceeds a full page', () => {
    const mock = createPdfDocMock();
    const area = getContentArea('portrait');
    const flow = createPdfFlow(mock.doc);

    flow.ensureSpace(area.heightMm + 100);

    expect(mock.callsOf('addPage')).toHaveLength(0);
    expect(flow.y).toBe(area.yMm);
  });
});
