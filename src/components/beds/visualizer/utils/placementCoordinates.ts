import type { Coordinates } from '../../../../types/PlantInstance/PlantInstance';

export interface PlacementViewport {
  readonly rectLeft: number;
  readonly rectTop: number;
  readonly panX: number;
  readonly panY: number;
  readonly zoom: number;
  readonly centerX: number;
  readonly centerY: number;
  readonly originX: number;
  readonly originY: number;
  readonly scale: number;
}

export const DEFAULT_SNAP_CM = 1;

function snap(value: number, snapCm: number): number {
  if (snapCm <= 0) {
    return value;
  }
  return Math.round(value / snapCm) * snapCm;
}

export function screenToBedCoordinates(
  screenX: number,
  screenY: number,
  viewport: PlacementViewport,
  snapCm: number = DEFAULT_SNAP_CM
): Coordinates {
  const pixelX =
    (screenX - viewport.rectLeft - viewport.panX - viewport.centerX) /
      viewport.zoom +
    viewport.centerX;
  const pixelY =
    (screenY - viewport.rectTop - viewport.panY - viewport.centerY) /
      viewport.zoom +
    viewport.centerY;

  const bedX = (pixelX - viewport.originX) / viewport.scale;
  const bedY = (pixelY - viewport.originY) / viewport.scale;

  return {
    x: snap(bedX, snapCm),
    y: snap(bedY, snapCm)
  };
}

export function bedToScreenCoordinates(
  bedX: number,
  bedY: number,
  viewport: PlacementViewport
): Coordinates {
  const pixelX = viewport.originX + bedX * viewport.scale;
  const pixelY = viewport.originY + bedY * viewport.scale;

  const screenX =
    viewport.rectLeft +
    viewport.panX +
    viewport.centerX +
    viewport.zoom * (pixelX - viewport.centerX);
  const screenY =
    viewport.rectTop +
    viewport.panY +
    viewport.centerY +
    viewport.zoom * (pixelY - viewport.centerY);

  return { x: screenX, y: screenY };
}

export function clientToBedCoordinates(
  svg: SVGSVGElement,
  clientX: number,
  clientY: number,
  geometry: {
    readonly containerWidth: number;
    readonly containerHeight: number;
    readonly originX: number;
    readonly originY: number;
    readonly scale: number;
  },
  viewport: {
    readonly panX: number;
    readonly panY: number;
    readonly zoom: number;
  }
): Coordinates {
  const rect = svg.getBoundingClientRect();
  const scaleX = rect.width > 0 ? geometry.containerWidth / rect.width : 1;
  const scaleY = rect.height > 0 ? geometry.containerHeight / rect.height : 1;
  return screenToBedCoordinates(
    (clientX - rect.left) * scaleX,
    (clientY - rect.top) * scaleY,
    {
      rectLeft: 0,
      rectTop: 0,
      panX: viewport.panX,
      panY: viewport.panY,
      zoom: viewport.zoom,
      centerX: geometry.containerWidth / 2,
      centerY: geometry.containerHeight / 2,
      originX: geometry.originX,
      originY: geometry.originY,
      scale: geometry.scale
    }
  );
}
