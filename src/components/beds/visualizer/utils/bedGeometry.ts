export interface BedGeometryInput {
  readonly width: number;
  readonly height: number;
  readonly containerWidth?: number;
  readonly containerHeight?: number;
}

export interface DimensionLineGeometry {
  readonly start: { readonly x: number; readonly y: number };
  readonly end: { readonly x: number; readonly y: number };
  readonly extensionStart1: { readonly x: number; readonly y: number };
  readonly extensionEnd1: { readonly x: number; readonly y: number };
  readonly extensionStart2: { readonly x: number; readonly y: number };
  readonly extensionEnd2: { readonly x: number; readonly y: number };
  readonly textPosition: { readonly x: number; readonly y: number };
}

export interface BedGeometry {
  readonly width: number;
  readonly height: number;
  readonly aspectRatio: number;
  readonly scale: number;
  readonly bedPixelWidth: number;
  readonly bedPixelHeight: number;
  readonly originX: number;
  readonly originY: number;
  readonly containerWidth: number;
  readonly containerHeight: number;
  readonly viewBox: string;
  readonly widthDimension: DimensionLineGeometry;
  readonly heightDimension: DimensionLineGeometry;
}

const DEFAULT_CONTAINER_WIDTH = 800;
const DEFAULT_CONTAINER_HEIGHT = 600;
const MARGIN_LEFT = 70;
const MARGIN_TOP = 70;
const MARGIN_RIGHT = 30;
const MARGIN_BOTTOM = 30;
const COTA_OFFSET = 32;

export function calculateBedGeometry(input: BedGeometryInput): BedGeometry {
  const containerWidth = input.containerWidth ?? DEFAULT_CONTAINER_WIDTH;
  const containerHeight = input.containerHeight ?? DEFAULT_CONTAINER_HEIGHT;
  const width = Math.max(1, input.width);
  const height = Math.max(1, input.height);
  const aspectRatio = width / height;

  const availableWidth = Math.max(
    1,
    containerWidth - MARGIN_LEFT - MARGIN_RIGHT
  );
  const availableHeight = Math.max(
    1,
    containerHeight - MARGIN_TOP - MARGIN_BOTTOM
  );

  const scale = Math.min(availableWidth / width, availableHeight / height);
  const bedPixelWidth = width * scale;
  const bedPixelHeight = height * scale;

  const originX = MARGIN_LEFT + (availableWidth - bedPixelWidth) / 2;
  const originY = MARGIN_TOP + (availableHeight - bedPixelHeight) / 2;

  const widthDimension: DimensionLineGeometry = {
    start: { x: originX, y: originY - COTA_OFFSET },
    end: { x: originX + bedPixelWidth, y: originY - COTA_OFFSET },
    extensionStart1: { x: originX, y: originY - 8 },
    extensionEnd1: { x: originX, y: originY - COTA_OFFSET - 8 },
    extensionStart2: { x: originX + bedPixelWidth, y: originY - 8 },
    extensionEnd2: { x: originX + bedPixelWidth, y: originY - COTA_OFFSET - 8 },
    textPosition: {
      x: originX + bedPixelWidth / 2,
      y: originY - COTA_OFFSET - 8
    }
  };

  const heightDimension: DimensionLineGeometry = {
    start: { x: originX - COTA_OFFSET, y: originY },
    end: { x: originX - COTA_OFFSET, y: originY + bedPixelHeight },
    extensionStart1: { x: originX - 8, y: originY },
    extensionEnd1: { x: originX - COTA_OFFSET - 8, y: originY },
    extensionStart2: { x: originX - 8, y: originY + bedPixelHeight },
    extensionEnd2: {
      x: originX - COTA_OFFSET - 8,
      y: originY + bedPixelHeight
    },
    textPosition: {
      x: originX - COTA_OFFSET - 8,
      y: originY + bedPixelHeight / 2
    }
  };

  return {
    width,
    height,
    aspectRatio,
    scale,
    bedPixelWidth,
    bedPixelHeight,
    originX,
    originY,
    containerWidth,
    containerHeight,
    viewBox: `0 0 ${containerWidth} ${containerHeight}`,
    widthDimension,
    heightDimension
  };
}
