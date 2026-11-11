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

  it.each([
    ['youtube url has no video id', 'https://www.youtube.com/watch'],
    ['youtu.be url has no pathname', 'https://youtu.be'],
    ['non-youtube hosts', 'https://vimeo.com/123456'],
    ['malicious hosts', 'https://youtube.com.evil.com/watch?v=nhtp2y49Hoo'],
    ['invalid urls', 'not-a-url']
  ])('returns null when %s', (_, input) => {
    const result = getYoutubeEmbedUrl(input);

    expect(result).toBeNull();
  });
});
