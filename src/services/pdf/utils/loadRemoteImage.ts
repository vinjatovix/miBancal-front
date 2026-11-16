const DEFAULT_TIMEOUT_MS = 5000;
const JPEG_QUALITY = 0.92;

export interface LoadedImage {
  readonly dataUrl: string;
  readonly widthPx: number;
  readonly heightPx: number;
}

export class RemoteImageError extends Error {
  readonly reason: 'load' | 'timeout' | 'encode';

  constructor(reason: 'load' | 'timeout' | 'encode') {
    super(`remote-image-${reason}`);
    this.name = 'RemoteImageError';
    this.reason = reason;
  }
}

function encodeImage(image: HTMLImageElement): LoadedImage {
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext('2d');
  if (!context) {
    throw new RemoteImageError('encode');
  }
  context.drawImage(image, 0, 0);
  const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
  return {
    dataUrl,
    widthPx: image.naturalWidth,
    heightPx: image.naturalHeight
  };
}

export function loadRemoteImage(
  url: string,
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<LoadedImage> {
  return new Promise<LoadedImage>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';

    let settled = false;
    const finish = (action: () => void): void => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      action();
    };

    const timer = setTimeout(() => {
      finish(() => reject(new RemoteImageError('timeout')));
    }, timeoutMs);

    image.onload = (): void => {
      finish(() => {
        try {
          resolve(encodeImage(image));
        } catch {
          reject(new RemoteImageError('encode'));
        }
      });
    };

    image.onerror = (): void => {
      finish(() => reject(new RemoteImageError('load')));
    };

    image.src = url;
  });
}
