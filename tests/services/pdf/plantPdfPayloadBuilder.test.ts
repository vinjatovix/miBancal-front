import { buildPlantPdfPayload } from '../../../src/services/pdf/plantPdfPayloadBuilder';
import type { Plant } from '../../../src/types/Plants/Plant';
import type { SupportResource } from '../../../src/types/SupportResource';
import { buildPlant } from '../../fixtures/plants/buildPlant';
import { buildPlantPdfExportOptions } from '../../fixtures/pdf/buildPlantPdfExport';
import '../../../src/i18n/messages/plant';

const DATE = new Date(2026, 10, 9);

function plantWith(overrides: Partial<Plant>): Plant {
  return buildPlant(overrides);
}

function sectionIds(plant: Plant, options = buildPlantPdfExportOptions()) {
  return buildPlantPdfPayload(plant, options, DATE).sections.map(
    (block) => block.section
  );
}

describe('buildPlantPdfPayload', () => {
  it('always builds the header with common, scientific and family names', () => {
    const payload = buildPlantPdfPayload(
      buildPlant(),
      buildPlantPdfExportOptions(),
      DATE
    );

    expect(payload.header.commonName).toBe('Perejil');
    expect(payload.header.scientificName).toBe('Petroselinum crispum');
    expect(payload.header.generationDateLabel).toContain('Fecha:');
  });

  it('includes only the selected content sections', () => {
    const options = buildPlantPdfExportOptions({
      includeNotes: false,
      includeEcology: false
    });

    const ids = sectionIds(buildPlant(), options);

    expect(ids).toContain('quickFacts');
    expect(ids).not.toContain('notes');
    expect(ids).not.toContain('ecology');
  });

  it('omits a selected section that has no data', () => {
    const plant = plantWith({
      knowledge: {
        ...buildPlant().knowledge,
        notes: []
      }
    });

    expect(sectionIds(plant)).not.toContain('notes');
  });

  it('builds the filename from the plant and generation date', () => {
    const payload = buildPlantPdfPayload(
      buildPlant({ slug: 'perejil' }),
      buildPlantPdfExportOptions(),
      DATE
    );

    expect(payload.filename).toBe('perejil-2026-11-09.pdf');
  });

  it('keeps the image data url only when the image section is selected', () => {
    const withImage = buildPlantPdfPayload(
      buildPlant(),
      buildPlantPdfExportOptions({
        includeImage: true,
        imageDataUrl: 'data:image/jpeg;base64,AAAA'
      }),
      DATE
    );
    const withoutImage = buildPlantPdfPayload(
      buildPlant(),
      buildPlantPdfExportOptions({
        includeImage: false,
        imageDataUrl: 'data:image/jpeg;base64,AAAA'
      }),
      DATE
    );

    expect(withImage.imageDataUrl).toBe('data:image/jpeg;base64,AAAA');
    expect(withoutImage.imageDataUrl).toBeNull();
  });

  it('builds navigable resource entries excluding the main image resource', () => {
    const resources: SupportResource[] = [
      { type: 'article', url: 'https://example.org/guia', title: 'Guía' },
      { type: 'video', url: 'https://videos.example.com/watch?v=1' },
      { type: 'image', url: 'https://img.example.org/main.jpg' }
    ];
    const plant = plantWith({
      image: { url: 'https://img.example.org/main.jpg' },
      knowledge: { ...buildPlant().knowledge, resources }
    });

    const section = buildPlantPdfPayload(
      plant,
      buildPlantPdfExportOptions(),
      DATE
    ).resources;

    const urls = section?.entries.map((entry) => entry.url) ?? [];
    expect(urls).toEqual([
      'https://example.org/guia',
      'https://videos.example.com/watch?v=1'
    ]);
    expect(section?.entries[0]).toMatchObject({
      title: 'Guía',
      type: 'article',
      domain: 'example.org'
    });
    expect(section?.entries[1].title).toBe('videos.example.com');
  });

  it('omits non-http resources and yields an empty entries list', () => {
    const resources: SupportResource[] = [
      { type: 'article', url: 'ftp://example.org/file' },
      { type: 'article', url: '' }
    ];
    const plant = plantWith({
      knowledge: { ...buildPlant().knowledge, resources }
    });

    const section = buildPlantPdfPayload(
      plant,
      buildPlantPdfExportOptions(),
      DATE
    ).resources;

    expect(section?.entries).toEqual([]);
  });

  it('tolerates missing optional knowledge without throwing', () => {
    const plant = structuredClone(buildPlant());
    plant.knowledge.resources = undefined;
    plant.knowledge.notes = undefined;
    // @ts-expect-error -- backend omits nested knowledge the Plant type marks required
    delete plant.knowledge.ecology;
    // @ts-expect-error -- backend omits nested knowledge the Plant type marks required
    delete plant.knowledge.soil;
    // @ts-expect-error -- backend omits nested knowledge the Plant type marks required
    delete plant.knowledge.rootSystem;

    const payload = buildPlantPdfPayload(
      plant,
      buildPlantPdfExportOptions(),
      DATE
    );

    const ids = payload.sections.map((block) => block.section);
    expect(ids).not.toContain('ecology');
    expect(ids).not.toContain('cultivation');
    expect(payload.resources?.entries).toEqual([]);
    expect(ids).toContain('quickFacts');
  });

  it('skips quick-fact rows whose source data is missing', () => {
    const plant = structuredClone(buildPlant());
    // @ts-expect-error -- backend omits nested traits the Plant type marks required
    delete plant.traits.size;
    // @ts-expect-error -- backend omits nested traits the Plant type marks required
    delete plant.traits.spacingCm;
    // @ts-expect-error -- backend omits nested knowledge the Plant type marks required
    delete plant.knowledge.light;

    const quickFacts = buildPlantPdfPayload(
      plant,
      buildPlantPdfExportOptions(),
      DATE
    ).sections.find((block) => block.section === 'quickFacts');

    const labels = quickFacts?.rows.map((r) => r.label) ?? [];
    expect(labels).toContain('Ciclo de vida');
    expect(labels).not.toContain('Altura');
    expect(labels).not.toContain('Luz');
  });

  it('returns null resources when the resources section is deselected', () => {
    const payload = buildPlantPdfPayload(
      buildPlant(),
      buildPlantPdfExportOptions({ includeResources: false }),
      DATE
    );

    expect(payload.resources).toBeNull();
  });
});
