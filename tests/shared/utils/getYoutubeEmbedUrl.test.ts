import { describe, expect, it } from 'vitest';
import { getYoutubeEmbedUrl } from '../../../src/shared/utils/getYoutubeEmbedUrl';

describe('getYoutubeEmbedUrl', () => {
  it('returns embed url for youtube.com links', () => {
    const input = 'https://www.youtube.com/watch?v=nhtp2y49Hoo';

    const result = getYoutubeEmbedUrl(input);

    expect(result).toBe('https://www.youtube.com/embed/nhtp2y49Hoo');
  });

  it('returns embed url for youtu.be links', () => {
    const input = 'https://youtu.be/g2yQYIRQV7k';

    const result = getYoutubeEmbedUrl(input);

    expect(result).toBe('https://www.youtube.com/embed/g2yQYIRQV7k');
  });

  it('returns null when youtube url has no video id', () => {
    const input = 'https://www.youtube.com/watch';

    const result = getYoutubeEmbedUrl(input);

    expect(result).toBeNull();
  });

  it('returns null when youtu.be url has no pathname', () => {
    const input = 'https://youtu.be';

    const result = getYoutubeEmbedUrl(input);

    expect(result).toBeNull();
  });

  it('returns null for non-youtube hosts', () => {
    const input = 'https://vimeo.com/123456';

    const result = getYoutubeEmbedUrl(input);

    expect(result).toBeNull();
  });

  it('returns null for malicious hosts', () => {
    const input = 'https://youtube.com.evil.com/watch?v=nhtp2y49Hoo';

    const result = getYoutubeEmbedUrl(input);

    expect(result).toBeNull();
  });

  it('returns null for invalid urls', () => {
    const input = 'not-a-url';

    const result = getYoutubeEmbedUrl(input);

    expect(result).toBeNull();
  });
});
