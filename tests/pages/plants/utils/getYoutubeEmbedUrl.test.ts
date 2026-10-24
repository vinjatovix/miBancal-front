import { describe, expect, it } from 'vitest';
import { getYoutubeEmbedUrl } from '../../../../src/pages/plants/utils/getYoutubeEmbedUrl';

describe('getYoutubeEmbedUrl', () => {
  it('should return embed url for youtube.com links', () => {
    expect(
      getYoutubeEmbedUrl('https://www.youtube.com/watch?v=nhtp2y49Hoo')
    ).toBe('https://www.youtube.com/embed/nhtp2y49Hoo');
  });

  it('should return embed url for youtu.be links', () => {
    expect(getYoutubeEmbedUrl('https://youtu.be/g2yQYIRQV7k')).toBe(
      'https://www.youtube.com/embed/g2yQYIRQV7k'
    );
  });

  it('should return null when youtube url has no video id', () => {
    expect(getYoutubeEmbedUrl('https://www.youtube.com/watch')).toBeNull();
  });

  it('should return null when youtu.be url has no pathname', () => {
    expect(getYoutubeEmbedUrl('https://youtu.be')).toBeNull();
  });

  it('should return null for non-youtube hosts', () => {
    expect(getYoutubeEmbedUrl('https://vimeo.com/123456')).toBeNull();
  });

  it('should return null for malicious hosts', () => {
    expect(
      getYoutubeEmbedUrl('https://youtube.com.evil.com/watch?v=nhtp2y49Hoo')
    ).toBeNull();
  });

  it('should return null for invalid urls', () => {
    expect(getYoutubeEmbedUrl('not-a-url')).toBeNull();
  });
});
