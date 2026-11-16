export function extractAndSanitizeToken(): string | null {
  let token: string | null = null;

  if (window.location.hash) {
    const hashContent = window.location.hash.startsWith('#')
      ? window.location.hash.slice(1)
      : window.location.hash;
    const params = new URLSearchParams(hashContent);
    token = params.get('token');
  }

  if (!token && window.location.search) {
    const searchParams = new URLSearchParams(window.location.search);
    token = searchParams.get('token');
  }

  if (token) {
    window.history.replaceState(null, '', window.location.pathname);
  }

  return token || null;
}
