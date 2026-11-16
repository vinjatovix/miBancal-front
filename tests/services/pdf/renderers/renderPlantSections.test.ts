import { renderPlantSections } from '../../../../src/services/pdf/renderers/renderPlantSections';
import { createPdfFlow } from '../../../../src/services/pdf/utils/pdfFlow';
import type { PlantPdfContentBlock } from '../../../../src/types/Export/PlantPdfExport';
import { createPdfDocMock, textStrings } from '../pdfDocMock';

function block(
  overrides: Partial<PlantPdfContentBlock> = {}
): PlantPdfContentBlock {
  return {
    section: 'quickFacts',
    title: 'Datos clave',
    rows: [{ label: 'Ciclo de vida', value: 'Bienal' }],
    ...overrides
  };
}

describe('renderPlantSections', () => {
  it('stamps the title and the label/value rows of each block', () => {
    const mock = createPdfDocMock();
    const flow = createPdfFlow(mock.doc);

    renderPlantSections(mock.doc, flow, [
      block({
        rows: [
          { label: 'Ciclo de vida', value: 'Bienal' },
          { label: 'Altura', value: '20–40 cm' }
        ]
      })
    ]);

    const texts = textStrings(mock);
    expect(texts).toContain('DATOS CLAVE');
    expect(texts).toContain('Ciclo de vida');
    expect(texts).toContain('Bienal');
    expect(texts).toContain('20–40 cm');
  });

  it('renders label-less rows with a bullet marker', () => {
    const mock = createPdfDocMock();
    const flow = createPdfFlow(mock.doc);

    renderPlantSections(mock.doc, flow, [
      block({
        section: 'notes',
        title: 'Notas',
        rows: [{ label: '', value: 'Resiste heladas' }]
      })
    ]);

    const texts = textStrings(mock);
    expect(texts).toContain('–');
    expect(texts).toContain('Resiste heladas');
  });

  it('advances the cursor as it renders blocks', () => {
    const mock = createPdfDocMock();
    const flow = createPdfFlow(mock.doc);
    const startY = flow.y;

    renderPlantSections(mock.doc, flow, [
      block(),
      block({ section: 'safety' })
    ]);

    expect(flow.y).toBeGreaterThan(startY);
  });

  it('keeps a block atomic by reserving its space before drawing', () => {
    const mock = createPdfDocMock();
    const flow = createPdfFlow(mock.doc);
    const tallRows = Array.from({ length: 24 }, (_, index) => ({
      label: `Fila ${index}`,
      value: `Valor ${index}`
    }));

    flow.advance(flow.area.heightMm - 20);
    renderPlantSections(mock.doc, flow, [block({ rows: tallRows })]);

    expect(mock.callsOf('addPage')).toHaveLength(1);
  });

  it('paginates rows when a single block is taller than a page', () => {
    const mock = createPdfDocMock();
    const flow = createPdfFlow(mock.doc);
    const overflowingRows = Array.from({ length: 80 }, (_, index) => ({
      label: `Fila ${index}`,
      value: `Valor ${index}`
    }));

    renderPlantSections(mock.doc, flow, [block({ rows: overflowingRows })]);

    expect(mock.callsOf('addPage').length).toBeGreaterThanOrEqual(1);
  });
});
