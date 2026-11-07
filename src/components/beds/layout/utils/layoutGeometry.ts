import type { BedPosition } from '../../../../types/Location/LocationLayout';

export interface Point {
  readonly x: number;
  readonly y: number;
}

export interface RotatedRectInput {
  readonly position: BedPosition;
  readonly width: number;
  readonly height: number;
  readonly rotation: number;
}

export interface BoundingBox {
  readonly minX: number;
  readonly minY: number;
  readonly maxX: number;
  readonly maxY: number;
}

export interface ViewBoxInput {
  readonly location: {
    readonly width: number | null;
    readonly height: number | null;
  };
  readonly placedBeds: readonly RotatedRectInput[];
  readonly margin?: number;
}

const DEFAULT_MARGIN = 50;
const DEFAULT_EXTENT = 1000;

function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function rotatePoint(point: Point, angleDegrees: number): Point {
  const radians = degreesToRadians(angleDegrees);
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  return {
    x: point.x * cos - point.y * sin,
    y: point.x * sin + point.y * cos
  };
}

export function rotatedRectVertices(input: RotatedRectInput): readonly Point[] {
  const corners: readonly Point[] = [
    { x: 0, y: 0 },
    { x: input.width, y: 0 },
    { x: input.width, y: input.height },
    { x: 0, y: input.height }
  ];
  return corners.map((corner) => {
    const rotated = rotatePoint(corner, input.rotation);
    return {
      x: input.position.x + rotated.x,
      y: input.position.y + rotated.y
    };
  });
}

export function aabbOf(vertices: readonly Point[]): BoundingBox {
  const xs = vertices.map((vertex) => vertex.x);
  const ys = vertices.map((vertex) => vertex.y);
  return {
    minX: Math.min(...xs),
    minY: Math.min(...ys),
    maxX: Math.max(...xs),
    maxY: Math.max(...ys)
  };
}

export function rectAabb(input: RotatedRectInput): BoundingBox {
  return aabbOf(rotatedRectVertices(input));
}

export function pixelToCm(deltaPixels: number, scale: number): number {
  if (scale === 0) return 0;
  return deltaPixels / scale;
}

export interface PlacementSnapshot {
  readonly id: string;
  readonly position: BedPosition | null;
  readonly rotation: number;
}

const DEFAULT_ADJUST_TOLERANCE = 0.5;

function positionsMatch(
  a: BedPosition | null,
  b: BedPosition | null,
  tolerance: number
): boolean {
  if (a === null || b === null) return a === b;
  return Math.abs(a.x - b.x) <= tolerance && Math.abs(a.y - b.y) <= tolerance;
}

function placementMatches(
  sent: PlacementSnapshot,
  server: PlacementSnapshot,
  tolerance: number
): boolean {
  return (
    positionsMatch(sent.position, server.position, tolerance) &&
    Math.abs(sent.rotation - server.rotation) <= tolerance
  );
}

export function diffAdjustedBedIds(
  sent: readonly PlacementSnapshot[],
  server: readonly PlacementSnapshot[],
  tolerance: number = DEFAULT_ADJUST_TOLERANCE
): readonly string[] {
  const serverById = new Map(server.map((item) => [item.id, item]));
  return sent
    .filter((item) => {
      const match = serverById.get(item.id);
      return !match || !placementMatches(item, match, tolerance);
    })
    .map((item) => item.id);
}

function placedBedsBox(beds: readonly RotatedRectInput[]): BoundingBox {
  const vertices = beds.flatMap((bed) => rotatedRectVertices(bed));
  return aabbOf(vertices);
}

function toViewBox(
  minX: number,
  minY: number,
  width: number,
  height: number
): string {
  return `${minX} ${minY} ${width} ${height}`;
}

export function computeViewBox(input: ViewBoxInput): string {
  const margin = input.margin ?? DEFAULT_MARGIN;
  const { width, height } = input.location;

  if (width !== null && height !== null && width > 0 && height > 0) {
    return toViewBox(-margin, -margin, width + margin * 2, height + margin * 2);
  }

  if (input.placedBeds.length === 0) {
    return toViewBox(-margin, -margin, DEFAULT_EXTENT, DEFAULT_EXTENT);
  }

  const box = placedBedsBox(input.placedBeds);
  return toViewBox(
    box.minX - margin,
    box.minY - margin,
    box.maxX - box.minX + margin * 2,
    box.maxY - box.minY + margin * 2
  );
}
