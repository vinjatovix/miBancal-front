import { formatPlantPdfFilename } from '../../../src/services/pdf/plantPdfFilename';
import { buildPlant } from '../../fixtures/plants/buildPlant';

describe('formatPlantPdfFilename', () => {
  it('prefers the plant slug and appends the date', () => {
    const plant = buildPlant({ slug: 'perejil-rizado' });

    const filename = formatPlantPdfFilename(plant, new Date(2026, 10, 9));

    expect(filename).toBe('perejil-rizado-2026-11-09.pdf');
  });

  it('slugifies the primary name when the slug is missing', () => {
    const base = buildPlant({ slug: undefined });
    const plant = {
      ...base,
      identity: {
        ...base.identity,
        name: { ...base.identity.name, primary: 'Judía Verde' }
      }
    };

    const filename = formatPlantPdfFilename(plant, new Date(2026, 0, 5));

    expect(filename).toBe('judia-verde-2026-01-05.pdf');
  });

  it('matches the canonical filename pattern', () => {
    const plant = buildPlant({ slug: 'tomate' });

    const filename = formatPlantPdfFilename(plant, new Date(2026, 11, 31));

    expect(filename).toMatch(/^[a-z0-9-]+-\d{4}-\d{2}-\d{2}\.pdf$/);
  });
});
