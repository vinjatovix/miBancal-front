import { describe, expect, it } from 'vitest';
import {
  calculateNetAzimuth,
  getBedAzimuthInfo,
  getBedEdgeCardinals,
  getCardinalPoint4,
  getCardinalWind,
  normalizeAngle
} from '../../../../../src/components/beds/layout/utils/cardinalGeometry';

describe('normalizeAngle', () => {
  it.each([
    [0, 0],
    [360, 0],
    [720, 0],
    [45, 45],
    [405, 45],
    [-1, 359],
    [-90, 270],
    [-360, 0],
    [-375, 345]
  ])('normalizes angle %i to %i within [0, 359]', (input, expected) => {
    const result = normalizeAngle(input);

    expect(result).toBe(expected);
  });
});

describe('calculateNetAzimuth', () => {
  it.each([
    [null, 0, 0],
    [undefined, 0, 0],
    [null, 90, 90],
    [0, 0, 0],
    [45, 45, 90],
    [350, 20, 10],
    [180, 180, 0],
    [270, 180, 90],
    [null, -15, 345]
  ])(
    'calculates net azimuth with northAngle=%s and rotation=%i as %i',
    (northAngle, rotation, expected) => {
      const result = calculateNetAzimuth(northAngle, rotation);

      expect(result).toBe(expected);
    }
  );
});

describe('getCardinalWind', () => {
  it.each([
    [0, 'north'],
    [22, 'north'],
    [22.5, 'northeast'],
    [45, 'northeast'],
    [67, 'northeast'],
    [67.5, 'east'],
    [90, 'east'],
    [112, 'east'],
    [112.5, 'southeast'],
    [135, 'southeast'],
    [157, 'southeast'],
    [157.5, 'south'],
    [180, 'south'],
    [202, 'south'],
    [202.5, 'southwest'],
    [225, 'southwest'],
    [247, 'southwest'],
    [247.5, 'west'],
    [270, 'west'],
    [292, 'west'],
    [292.5, 'northwest'],
    [315, 'northwest'],
    [337, 'northwest'],
    [337.5, 'north'],
    [359, 'north']
  ])('maps angle %d to wind key %s', (angle, expected) => {
    const result = getCardinalWind(angle);

    expect(result).toBe(expected);
  });
});

describe('getCardinalPoint4', () => {
  it.each([
    [0, 'N'],
    [44, 'N'],
    [45, 'E'],
    [90, 'E'],
    [134, 'E'],
    [135, 'S'],
    [180, 'S'],
    [224, 'S'],
    [225, 'O'],
    [270, 'O'],
    [314, 'O'],
    [315, 'N'],
    [359, 'N']
  ])('maps angle %i to 4-point cardinal %s', (angle, expected) => {
    const result = getCardinalPoint4(angle);

    expect(result).toBe(expected);
  });
});

describe('getBedEdgeCardinals', () => {
  it('maps 0 degree azimuth correctly to top N, right E, bottom S, left O', () => {
    const edges = getBedEdgeCardinals(0);

    expect(edges).toEqual({
      top: 'N',
      right: 'E',
      bottom: 'S',
      left: 'O'
    });
  });

  it('maps 90 degree azimuth correctly to top E, right S, bottom O, left N', () => {
    const edges = getBedEdgeCardinals(90);

    expect(edges).toEqual({
      top: 'E',
      right: 'S',
      bottom: 'O',
      left: 'N'
    });
  });

  it('maps 180 degree azimuth correctly to top S, right O, bottom N, left E', () => {
    const edges = getBedEdgeCardinals(180);

    expect(edges).toEqual({
      top: 'S',
      right: 'O',
      bottom: 'N',
      left: 'E'
    });
  });

  it('maps 270 degree azimuth correctly to top O, right N, bottom E, left S', () => {
    const edges = getBedEdgeCardinals(270);

    expect(edges).toEqual({
      top: 'O',
      right: 'N',
      bottom: 'E',
      left: 'S'
    });
  });
});

describe('getBedAzimuthInfo', () => {
  it('returns comprehensive azimuth info combining wind and edge cardinals', () => {
    const info = getBedAzimuthInfo(45, 45);

    expect(info).toEqual({
      azimuth: 90,
      windKey: 'east',
      edges: {
        top: 'E',
        right: 'S',
        bottom: 'O',
        left: 'N'
      }
    });
  });
});
