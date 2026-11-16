import { renderSpeciesTable } from '../../../../src/services/pdf/renderers/renderSpeciesTable';
import type { SpeciesSummaryItem } from '../../../../src/types/Export/BedPdfExport';
import type { ContentArea } from '../../../../src/services/pdf/utils/pdfGeometry';
import { createPdfDocMock, textStrings } from '../pdfDocMock';
import '../../../../src/i18n/messages/beds';

function buildArea(): ContentArea {
  return { xMm: 12, yMm: 150, widthMm: 186, heightMm: 120 };
}

function buildSpecies(
  overrides: Partial<SpeciesSummaryItem> = {}
): SpeciesSummaryItem {
  return {
    key: '1',
    plantId: 'tomato',
    commonName: 'Tomate',
    scientificName: 'Solanum lycopersicum',
    familyName: null,
    count: 4,
    ...overrides
  };
}

describe('renderSpeciesTable', () => {
  it('renders header labels and species rows', () => {
    const mock = createPdfDocMock();

    renderSpeciesTable(
      mock.doc,
      buildArea(),
      [
        buildSpecies(),
        buildSpecies({ key: '2', commonName: 'Lechuga', count: 2 })
      ],
      false
    );

    const texts = textStrings(mock);
    expect(texts).toContain('Clave');
    expect(texts).toContain('Tomate');
    expect(texts).toContain('Lechuga');
    expect(texts).toContain('4');
  });

  it('prints the botanical family name when the species provides it', () => {
    const mock = createPdfDocMock();

    renderSpeciesTable(
      mock.doc,
      buildArea(),
      [buildSpecies({ familyName: 'Solanáceas' })],
      false
    );

    expect(textStrings(mock)).toContain('Solanáceas');
  });

  it('shows a dash when a taxonomic field is missing', () => {
    const mock = createPdfDocMock();

    renderSpeciesTable(
      mock.doc,
      buildArea(),
      [buildSpecies({ scientificName: null, familyName: null })],
      false
    );

    expect(textStrings(mock).filter((text) => text === '—').length).toBe(2);
  });

  it('renders the empty-bed notice without a header for empty beds', () => {
    const mock = createPdfDocMock();

    const result = renderSpeciesTable(mock.doc, buildArea(), [], true);

    expect(textStrings(mock)).toContain(
      'Sin cultivos sembrados (plantilla de campo en blanco)'
    );
    expect(textStrings(mock)).not.toContain('Clave');
    expect(result.rowsPerColumn).toBe(0);
  });

  it('returns the vertical cursor after the last row', () => {
    const mock = createPdfDocMock();

    const result = renderSpeciesTable(
      mock.doc,
      buildArea(),
      [buildSpecies()],
      false
    );

    expect(result.endYMm).toBeGreaterThan(150);
  });
});
