import { renderResourceQrGrid } from '../../../../src/services/pdf/renderers/renderResourceQrGrid';
import { createPdfFlow } from '../../../../src/services/pdf/utils/pdfFlow';
import type { ResourceQrEntry } from '../../../../src/types/Export/PlantPdfExport';
import { createPdfDocMock, textStrings } from '../pdfDocMock';
import { buildResourceQrEntry } from '../../../fixtures/pdf/buildPlantPdfExport';
import '../../../../src/i18n/messages/plant';

function entries(count: number): ResourceQrEntry[] {
  return Array.from({ length: count }, (_, index) =>
    buildResourceQrEntry({
      url: `https://example.org/resource-${index}`,
      title: `Recurso ${index}`,
      domain: 'example.org'
    })
  );
}

describe('renderResourceQrGrid', () => {
  it('draws a heading and a labelled cell per entry', async () => {
    const mock = createPdfDocMock();
    const flow = createPdfFlow(mock.doc);

    await renderResourceQrGrid(mock.doc, flow, {
      entries: [
        buildResourceQrEntry({
          title: 'Guía',
          type: 'article',
          domain: 'a.org'
        })
      ]
    });

    const texts = textStrings(mock);
    expect(texts).toContain('RECURSOS');
    expect(texts).toContain('Guía');
    expect(texts.some((line) => line.includes('Artículo'))).toBe(true);
    expect(texts.some((line) => line.includes('a.org'))).toBe(true);
    expect(mock.callsOf('rect').length).toBeGreaterThan(0);
  });

  it('stamps the absence message when there are no entries', async () => {
    const mock = createPdfDocMock();
    const flow = createPdfFlow(mock.doc);

    await renderResourceQrGrid(mock.doc, flow, { entries: [] });

    expect(textStrings(mock)).toContain('Sin recursos con enlace disponibles.');
  });

  it('flows onto a new page without splitting a cell when space runs out', async () => {
    const mock = createPdfDocMock();
    const flow = createPdfFlow(mock.doc);

    flow.advance(flow.area.heightMm - 40);
    await renderResourceQrGrid(mock.doc, flow, { entries: entries(6) });

    expect(mock.callsOf('addPage').length).toBeGreaterThanOrEqual(1);
  });
});
