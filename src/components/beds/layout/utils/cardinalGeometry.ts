export type CardinalPoint4 = 'N' | 'E' | 'S' | 'O';

export type CardinalWind8 =
  | 'north'
  | 'northeast'
  | 'east'
  | 'southeast'
  | 'south'
  | 'southwest'
  | 'west'
  | 'northwest';

export interface BedEdgeCardinals {
  readonly top: CardinalPoint4;
  readonly right: CardinalPoint4;
  readonly bottom: CardinalPoint4;
  readonly left: CardinalPoint4;
}

export interface BedAzimuthInfo {
  readonly azimuth: number;
  readonly windKey: CardinalWind8;
  readonly edges: BedEdgeCardinals;
}

export function normalizeAngle(angle: number): number {
  return ((angle % 360) + 360) % 360;
}

export function calculateNetAzimuth(
  northAngle: number | null | undefined,
  rotation: number
): number {
  return normalizeAngle((northAngle ?? 0) + rotation);
}

export function getCardinalWind(angle: number): CardinalWind8 {
  const norm = normalizeAngle(angle);
  if (norm >= 22.5 && norm < 67.5) {
    return 'northeast';
  }
  if (norm >= 67.5 && norm < 112.5) {
    return 'east';
  }
  if (norm >= 112.5 && norm < 157.5) {
    return 'southeast';
  }
  if (norm >= 157.5 && norm < 202.5) {
    return 'south';
  }
  if (norm >= 202.5 && norm < 247.5) {
    return 'southwest';
  }
  if (norm >= 247.5 && norm < 292.5) {
    return 'west';
  }
  if (norm >= 292.5 && norm < 337.5) {
    return 'northwest';
  }
  return 'north';
}

export function getCardinalPoint4(angle: number): CardinalPoint4 {
  const norm = normalizeAngle(angle);
  if (norm >= 45 && norm < 135) {
    return 'E';
  }
  if (norm >= 135 && norm < 225) {
    return 'S';
  }
  if (norm >= 225 && norm < 315) {
    return 'O';
  }
  return 'N';
}

export function getBedEdgeCardinals(netAzimuth: number): BedEdgeCardinals {
  return {
    top: getCardinalPoint4(netAzimuth),
    right: getCardinalPoint4(netAzimuth + 90),
    bottom: getCardinalPoint4(netAzimuth + 180),
    left: getCardinalPoint4(netAzimuth + 270)
  };
}

export function getBedAzimuthInfo(
  northAngle: number | null | undefined,
  rotation: number
): BedAzimuthInfo {
  const azimuth = calculateNetAzimuth(northAngle, rotation);
  return {
    azimuth,
    windKey: getCardinalWind(azimuth),
    edges: getBedEdgeCardinals(azimuth)
  };
}
