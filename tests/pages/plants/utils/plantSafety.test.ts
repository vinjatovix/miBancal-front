import { describe, it, expect } from 'vitest';
import { readPlantSafety } from '../../../../src/pages/plants/utils/plantSafety';
import {
  buildPlant,
  buildPlantWithEcological
} from '../../../fixtures/plants/buildPlant';

const NOTES = 'Hojas y frutos verdes tóxicos.';

describe('readPlantSafety', () => {
  it.each([
    [
      { edible: true, toxic: true, toxicityNotes: NOTES },
      { edible: 'yes', toxic: 'yes', toxicityNotes: NOTES, hasData: true }
    ],
    [
      { edible: true, toxic: false },
      { edible: 'yes', toxic: 'no', hasData: true }
    ],
    [
      { toxicityNotes: NOTES },
      {
        edible: 'unknown',
        toxic: 'unknown',
        toxicityNotes: NOTES,
        hasData: true
      }
    ],
    [{ toxic: true }, { edible: 'unknown', toxic: 'yes', hasData: true }],
    [{}, { edible: 'unknown', toxic: 'unknown', hasData: false }]
  ])('reads %j', (ecological, expected) => {
    expect(readPlantSafety(buildPlantWithEcological(ecological))).toEqual(
      expected
    );
  });

  it('treats a missing ecological block as no data', () => {
    const plant = buildPlant();
    const traits = { ...plant.traits, ecological: undefined };

    expect(readPlantSafety({ ...plant, traits })).toEqual({
      edible: 'unknown',
      toxic: 'unknown',
      hasData: false
    });
  });

  it('reads a plant that only carries its traits', () => {
    const { traits } = buildPlantWithEcological({ edible: true, toxic: false });

    expect(readPlantSafety({ traits })).toEqual({
      edible: 'yes',
      toxic: 'no',
      hasData: true
    });
  });

  it.each([undefined, null, {}])(
    'returns unknown safety flags safely when plant is %s',
    (input) => {
      expect(
        readPlantSafety(input as Parameters<typeof readPlantSafety>[0])
      ).toEqual({
        edible: 'unknown',
        toxic: 'unknown',
        hasData: false
      });
    }
  );
});
