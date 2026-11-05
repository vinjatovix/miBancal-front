const YOUTUBE_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'youtu.be',
  'www.youtu.be'
]);

export function getYoutubeEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);

    const hostname = parsed.hostname;

    const isYoutube =
      YOUTUBE_HOSTS.has(hostname) &&
      (hostname === 'youtube.com' || hostname === 'www.youtube.com');

    const isYoutuBe =
      YOUTUBE_HOSTS.has(hostname) &&
      (hostname === 'youtu.be' || hostname === 'www.youtu.be');

    if (isYoutube) {
      const videoId = parsed.searchParams.get('v');
      if (!videoId) return null;

      return `https://www.youtube.com/embed/${videoId}`;
    }

    if (isYoutuBe) {
      const videoId = parsed.pathname.split('/').find(Boolean);
      if (!videoId) return null;

      return `https://www.youtube.com/embed/${videoId}`;
    }

    return null;
  } catch {
    return null;
  }
}
