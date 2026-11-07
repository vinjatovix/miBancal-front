import type {
  BedPosition,
  LocationLayoutResponse,
  LocationLayoutSummary,
  PlacedBedSummary,
  UnplacedBedSummary
} from '../../../src/types/Location/LocationLayout';

export function buildBedPosition(
  overrides: Partial<BedPosition> = {}
): BedPosition {
  return { x: 150, y: 200, ...overrides };
}

export function buildPlacedBed(
  overrides: Partial<PlacedBedSummary> = {}
): PlacedBedSummary {
  return {
    id: '22222222-2222-4222-8222-222222222221',
    name: 'Bancal Tomates 1',
    width: 120,
    height: 240,
    position: buildBedPosition(),
    rotation: 90,
    netOrientation: 135,
    ...overrides
  };
}

export function buildUnplacedBed(
  overrides: Partial<UnplacedBedSummary> = {}
): UnplacedBedSummary {
  return {
    id: '33333333-3333-4333-8333-333333333331',
    name: 'Bancal Vivero Auxiliar',
    width: 80,
    height: 120,
    position: null,
    rotation: 0,
    ...overrides
  };
}

export function buildLocationLayoutSummary(
  overrides: Partial<LocationLayoutSummary> = {}
): LocationLayoutSummary {
  return {
    id: '11111111-1111-4111-8111-111111111111',
    name: 'Huerto de casa',
    northAngle: 45,
    width: 1500,
    height: 1000,
    ...overrides
  };
}

export function buildLocationLayout(
  overrides: Partial<LocationLayoutResponse> = {}
): LocationLayoutResponse {
  return {
    location: buildLocationLayoutSummary(),
    placedBeds: [buildPlacedBed()],
    unplacedBeds: [buildUnplacedBed()],
    companionGraph: [],
    ...overrides
  };
}
