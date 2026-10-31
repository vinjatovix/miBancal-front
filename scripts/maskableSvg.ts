export const BACKGROUND_COLOR = '#f3fbf6';

export function createMaskableSvg(sourceSvg: string): string {
  const content = sourceSvg
    .replace(/<svg[^>]*>/, '')
    .replace(/<\/svg>/, '')
    .trim();

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="${BACKGROUND_COLOR}"/>
  <g transform="translate(77, 77) scale(9.9444)">
    ${content}
  </g>
</svg>\n`;
}
