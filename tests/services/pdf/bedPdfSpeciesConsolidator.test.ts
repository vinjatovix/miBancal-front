import { consolidateBedSpecies } from '../../../src/services/pdf/bedPdfSpeciesConsolidator';
import { buildCropPlacementItem } from '../../fixtures/plantInstances/buildPlantInstance';

describe('consolidateBedSpecies', () => {
  it('returns empty summary and markers for an empty bed', () => {
    const result = consolidateBedSpecies([]);

    expect(result.summary).toEqual([]);
    expect(result.markers).toEqual([]);
  });

  it('groups crops by plantId assigning consecutive numeric keys', () => {
    const crops = [
      buildCropPlacementItem({
        id: 'a',
        plantId: 'tomato',
        commonName: 'Tomate'
      }),
      buildCropPlacementItem({
        id: 'b',
        plantId: 'lettuce',
        commonName: 'Lechuga'
      }),
      buildCropPlacementItem({
        id: 'c',
        plantId: 'tomato',
        commonName: 'Tomate'
      })
    ];

    const result = consolidateBedSpecies(crops);

    expect(result.summary.map((item) => item.key)).toEqual(['1', '2']);
    expect(result.summary[0]).toMatchObject({
      plantId: 'tomato',
      commonName: 'Tomate',
      count: 2
    });
    expect(result.summary[1]).toMatchObject({
      plantId: 'lettuce',
      count: 1
    });
  });

  it('builds one marker per crop sharing its species key', () => {
    const crops = [
      buildCropPlacementItem({
        id: 'a',
        plantId: 'tomato',
        position: { x: 10, y: 20 },
        vitalRadius: 25
      }),
      buildCropPlacementItem({ id: 'c', plantId: 'tomato' })
    ];

    const result = consolidateBedSpecies(crops);

    expect(result.markers).toHaveLength(2);
    expect(result.markers[0]).toMatchObject({
      cropId: 'a',
      speciesKey: '1',
      xCm: 10,
      yCm: 20,
      vitalRadiusCm: 25
    });
    expect(result.markers[1].speciesKey).toBe('1');
  });

  it('carries scientific and family names when the crop provides them', () => {
    const crops = [
      buildCropPlacementItem({
        plantId: 'tomato',
        scientificName: 'Solanum lycopersicum',
        familyName: 'Solanáceas'
      })
    ];

    const result = consolidateBedSpecies(crops);

    expect(result.summary[0].scientificName).toBe('Solanum lycopersicum');
    expect(result.summary[0].familyName).toBe('Solanáceas');
  });

  it('normalizes a missing family name to null', () => {
    const crops = [
      buildCropPlacementItem({ plantId: 'tomato', familyName: undefined })
    ];

    const result = consolidateBedSpecies(crops);

    expect(result.summary[0].familyName).toBeNull();
  });

  it('normalizes a missing scientific name to null', () => {
    const crops = [
      buildCropPlacementItem({ plantId: 'tomato', scientificName: undefined })
    ];

    const result = consolidateBedSpecies(crops);

    expect(result.summary[0].scientificName).toBeNull();
  });
});
