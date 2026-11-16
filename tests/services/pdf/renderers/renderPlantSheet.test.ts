import { renderPlantSheet } from '../../../../src/services/pdf/renderers/renderPlantSheet';
import type { ResourceQrEntry } from '../../../../src/types/Export/PlantPdfExport';
import { createPdfDocMock, textStrings } from '../pdfDocMock';
import {
  buildPlantPdfPayload,
  buildResourceQrEntry
} from '../../../fixtures/pdf/buildPlantPdfExport';
import '../../../../src/i18n/messages/plant';

function manyEntries(count: number): ResourceQrEntry[] {
  return Array.from({ length: count }, (_, index) =>
    buildResourceQrEntry({ url: `https://example.org/r-${index}` })
  );
}

describe('renderPlantSheet', () => {
  it('stamps the header with common, scientific and family names and the date', async () => {
    const mock = createPdfDocMock();

    await renderPlantSheet(
      mock.doc,
      buildPlantPdfPayload({ imageDataUrl: null, resources: null })
    );

    const texts = textStrings(mock);
    expect(texts).toContain('Perejil');
    expect(texts).toContain('Petroselinum crispum');
    expect(texts.some((line) => line.includes('Apiáceas'))).toBe(true);
    expect(texts.some((line) => line.includes('Fecha:'))).toBe(true);
  });

  it('renders the scientific name in italics', async () => {
    const mock = createPdfDocMock();

    await renderPlantSheet(
      mock.doc,
      buildPlantPdfPayload({ imageDataUrl: null, resources: null })
    );

    const italicFonts = mock
      .callsOf('setFont')
      .filter((call) => call.args[1] === 'italic');
    expect(italicFonts.length).toBeGreaterThan(0);
  });

  it('embeds the image before the sections when an image data url is present', async () => {
    const mock = createPdfDocMock();

    await renderPlantSheet(
      mock.doc,
      buildPlantPdfPayload({
        imageDataUrl: 'data:image/jpeg;base64,AAAA',
        resources: null
      })
    );

    expect(mock.callsOf('addImage')).toHaveLength(1);
  });

  it('does not stamp page numbers for a single-page document', async () => {
    const mock = createPdfDocMock();

    await renderPlantSheet(
      mock.doc,
      buildPlantPdfPayload({ imageDataUrl: null, resources: null })
    );

    expect(
      textStrings(mock).some((line) => /Página \d+ de \d+/.test(line))
    ).toBe(false);
  });

  it('stamps "Página X de Y" on every page when the document spans two pages', async () => {
    const mock = createPdfDocMock();

    await renderPlantSheet(
      mock.doc,
      buildPlantPdfPayload({
        imageDataUrl: null,
        resources: { entries: manyEntries(24) }
      })
    );

    const stamped = textStrings(mock).filter((line) =>
      /Página \d+ de \d+/.test(line)
    );
    expect(mock.doc.getNumberOfPages()).toBeGreaterThanOrEqual(2);
    expect(stamped.length).toBe(mock.doc.getNumberOfPages());
  });
});
