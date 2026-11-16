import { afterEach, beforeEach, vi } from 'vitest';

import {
  loadRemoteImage,
  RemoteImageError
} from '../../../../src/services/pdf/utils/loadRemoteImage';

interface StubImageInstance {
  crossOrigin: string | null;
  onload: (() => void) | null;
  onerror: (() => void) | null;
  naturalWidth: number;
  naturalHeight: number;
  src: string;
}

let lastImage: StubImageInstance | null = null;

function StubImage(): StubImageInstance {
  const instance: StubImageInstance = {
    crossOrigin: null,
    onload: null,
    onerror: null,
    naturalWidth: 300,
    naturalHeight: 200,
    src: ''
  };
  lastImage = instance;
  return instance;
}

function mockCanvas(toDataUrl: () => string): void {
  vi.spyOn(document, 'createElement').mockImplementation(((
    tag: string
  ): unknown => {
    if (tag !== 'canvas') {
      return {} as HTMLElement;
    }
    return {
      width: 0,
      height: 0,
      getContext: () => ({ drawImage: vi.fn() }),
      toDataURL: toDataUrl
    };
  }) as typeof document.createElement);
}

describe('loadRemoteImage', () => {
  beforeEach(() => {
    lastImage = null;
    vi.stubGlobal('Image', StubImage);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('resolves with the data url and natural dimensions on success', async () => {
    mockCanvas(() => 'data:image/jpeg;base64,AAAA');

    const promise = loadRemoteImage('https://img.example.org/a.jpg');
    lastImage?.onload?.();

    await expect(promise).resolves.toEqual({
      dataUrl: 'data:image/jpeg;base64,AAAA',
      widthPx: 300,
      heightPx: 200
    });
  });

  it('sets crossOrigin to anonymous before assigning the source', () => {
    mockCanvas(() => 'data:image/jpeg;base64,AAAA');

    void loadRemoteImage('https://img.example.org/a.jpg');

    expect(lastImage?.crossOrigin).toBe('anonymous');
    expect(lastImage?.src).toBe('https://img.example.org/a.jpg');
  });

  it('rejects with a typed error when the image fails to load', async () => {
    const promise = loadRemoteImage('https://img.example.org/a.jpg');
    lastImage?.onerror?.();

    await expect(promise).rejects.toBeInstanceOf(RemoteImageError);
    await expect(promise).rejects.toMatchObject({ reason: 'load' });
  });

  it('rejects with an encode error when the canvas is tainted by CORS', async () => {
    mockCanvas(() => {
      throw new Error('tainted canvas');
    });

    const promise = loadRemoteImage('https://img.example.org/a.jpg');
    lastImage?.onload?.();

    await expect(promise).rejects.toMatchObject({ reason: 'encode' });
  });

  it('rejects with a timeout error when the image never settles', async () => {
    vi.useFakeTimers();

    const promise = loadRemoteImage('https://img.example.org/a.jpg', 5000);
    const expectation = expect(promise).rejects.toMatchObject({
      reason: 'timeout'
    });
    await vi.advanceTimersByTimeAsync(5000);

    await expectation;
  });
});
