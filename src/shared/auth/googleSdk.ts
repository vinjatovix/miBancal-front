let sdkPromise: Promise<void> | null = null;

export function resetGoogleSdk(): void {
  sdkPromise = null;
}

export function loadGoogleSdk(): Promise<void> {
  if (sdkPromise) {
    return sdkPromise;
  }

  sdkPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => {
      resolve();
    };
    script.onerror = () => {
      sdkPromise = null;
      script.remove();
      reject(new Error('Failed to load Google SDK'));
    };
    document.head.appendChild(script);
  });

  return sdkPromise;
}
