import ts from 'typescript';

import { CSS_COLOR_NAMES } from './colorNames.ts';

export interface ColorLiteral {
  readonly line: number;
  readonly column: number;
  readonly match: string;
}

interface Hit {
  readonly offset: number;
  readonly match: string;
}

const HEX_PATTERN =
  /#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{4}|[0-9a-f]{3})(?![\w-])/gi;
const COLOR_FUNCTION_PATTERN = /(?<![\w-])(?:rgba?|hsla?)\(/gi;
const WORD_PATTERN = /(?<![\w-])[a-z][\w-]*/gi;
const CSS_COMMENT_PATTERN = /\/\*[\s\S]*?\*\//g;
const CSS_DECLARATION_PATTERN = /[-\w]+\s*:([^;{}]*)(?=[;}])/g;
const CSS_OPAQUE_PATTERN = /'[^']*'|"[^"]*"|url\([^)]*\)/gi;
const HTML_STYLE_ATTRIBUTE_PATTERN = /\bstyle\s*=\s*"([^"]*)"/gi;
const HTML_STYLE_BLOCK_PATTERN = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
const HTML_THEME_COLOR_PATTERN =
  /<meta\b[^>]*\bname\s*=\s*"theme-color"[^>]*>/gi;
const HTML_CONTENT_ATTRIBUTE_PATTERN = /\bcontent\s*=\s*"([^"]*)"/i;
const URL_ATTRIBUTES = new Set(['href', 'to', 'src', 'hash']);
const HEX_ONLY_PATTERN = /^#[0-9a-f]{3,8}$/i;
const HEX_URL_PREFIX_PATTERN = /[/?=\w]/;

function blankOut(text: string): string {
  return text.replace(/[^\n]/g, ' ');
}

function hitsOf(pattern: RegExp, text: string, offset: number): Hit[] {
  return [...text.matchAll(pattern)].map((found) => ({
    offset: offset + (found.index ?? 0),
    match: found[0]
  }));
}

function colorNameHits(text: string, offset: number): Hit[] {
  return hitsOf(WORD_PATTERN, text, offset).filter(({ match }) =>
    CSS_COLOR_NAMES.has(match.toLowerCase())
  );
}

function cssValueHits(value: string, offset: number): Hit[] {
  const visible = value.replace(CSS_OPAQUE_PATTERN, blankOut);
  return [
    ...hitsOf(HEX_PATTERN, visible, offset),
    ...hitsOf(COLOR_FUNCTION_PATTERN, visible, offset),
    ...colorNameHits(visible, offset)
  ];
}

function cssHits(css: string, offset: number): Hit[] {
  const withoutComments = css.replace(CSS_COMMENT_PATTERN, blankOut);
  return [...withoutComments.matchAll(CSS_DECLARATION_PATTERN)].flatMap(
    (declaration) => {
      const value = declaration[1];
      const valueStart = (declaration.index ?? 0) + declaration[0].length;
      return cssValueHits(value, offset + valueStart - value.length);
    }
  );
}

function groupStart(found: RegExpMatchArray): number {
  return (found.index ?? 0) + found[0].indexOf(found[1]);
}

function htmlStyleHits(html: string): Hit[] {
  const attributes = [...html.matchAll(HTML_STYLE_ATTRIBUTE_PATTERN)].flatMap(
    (found) => cssHits(`${found[1]};`, groupStart(found))
  );
  const blocks = [...html.matchAll(HTML_STYLE_BLOCK_PATTERN)].flatMap((found) =>
    cssHits(found[1], groupStart(found))
  );
  return [...attributes, ...blocks];
}

function htmlThemeColorHits(html: string): Hit[] {
  return [...html.matchAll(HTML_THEME_COLOR_PATTERN)].flatMap((meta) => {
    const content = meta[0].match(HTML_CONTENT_ATTRIBUTE_PATTERN);
    if (!content) return [];
    const start = (meta.index ?? 0) + groupStart(content);
    return [
      ...hitsOf(HEX_PATTERN, content[1], start),
      ...hitsOf(COLOR_FUNCTION_PATTERN, content[1], start)
    ];
  });
}

function htmlHits(html: string): Hit[] {
  return [...htmlStyleHits(html), ...htmlThemeColorHits(html)];
}

function nameOf(node: ts.Node | undefined): string | undefined {
  if (!node) return undefined;
  if (ts.isIdentifier(node) || ts.isStringLiteral(node)) return node.text;
  if (ts.isJsxAttribute(node)) return nameOf(node.name);
  if (ts.isComputedPropertyName(node)) return nameOf(node.expression);
  return undefined;
}

function ownerName(literal: ts.Node): string | undefined {
  const parent = literal.parent;
  if (ts.isJsxAttribute(parent) || ts.isPropertyAssignment(parent)) {
    return nameOf(ts.isJsxAttribute(parent) ? parent : parent.name);
  }
  if (ts.isJsxExpression(parent) && ts.isJsxAttribute(parent.parent)) {
    return nameOf(parent.parent);
  }
  return undefined;
}

function isUrlValue(literal: ts.Node): boolean {
  return URL_ATTRIBUTES.has(ownerName(literal) ?? '');
}

function isCssPropertiesType(type: ts.TypeNode | undefined): boolean {
  return !!type && /\bCSSProperties\b/.test(type.getText());
}

function isStyleObject(object: ts.Node): boolean {
  const owner = object.parent;
  if (ts.isJsxExpression(owner)) return nameOf(owner.parent) === 'style';
  if (ts.isVariableDeclaration(owner)) return isCssPropertiesType(owner.type);
  if (ts.isSatisfiesExpression(owner) || ts.isAsExpression(owner)) {
    return isCssPropertiesType(owner.type);
  }
  return false;
}

function isStyleValue(literal: ts.Node): boolean {
  const property = literal.parent;
  return (
    ts.isPropertyAssignment(property) &&
    ts.isObjectLiteralExpression(property.parent) &&
    isStyleObject(property.parent)
  );
}

function rawText(
  node: ts.Node,
  source: string
): { text: string; offset: number } {
  const start = node.getStart() + 1;
  const closing = ts.isTemplateHead(node) || ts.isTemplateMiddle(node) ? 2 : 1;
  return { text: source.slice(start, node.getEnd() - closing), offset: start };
}

function isFlaggedHex(hit: Hit, text: string, offset: number): boolean {
  const previous = text[hit.offset - offset - 1] ?? '';
  return !HEX_URL_PREFIX_PATTERN.test(previous);
}

function literalNameHits(node: ts.Node, text: string, offset: number): Hit[] {
  if (isStyleValue(node)) return colorNameHits(text, offset);
  const trimmed = text.trim();
  if (!CSS_COLOR_NAMES.has(trimmed.toLowerCase())) return [];
  return [{ offset: offset + text.indexOf(trimmed), match: trimmed }];
}

function literalHits(node: ts.Node, source: string): Hit[] {
  const { text, offset } = rawText(node, source);
  if (HEX_ONLY_PATTERN.test(text) && isUrlValue(node)) return [];
  return [
    ...hitsOf(HEX_PATTERN, text, offset).filter((hit) =>
      isFlaggedHex(hit, text, offset)
    ),
    ...hitsOf(COLOR_FUNCTION_PATTERN, text, offset),
    ...literalNameHits(node, text, offset)
  ];
}

function isTextLiteral(node: ts.Node): boolean {
  return (
    ts.isStringLiteral(node) ||
    ts.isNoSubstitutionTemplateLiteral(node) ||
    ts.isTemplateHead(node) ||
    ts.isTemplateMiddle(node) ||
    ts.isTemplateTail(node)
  );
}

function scriptHits(filePath: string, source: string): Hit[] {
  const kind = filePath.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const file = ts.createSourceFile(
    filePath,
    source,
    ts.ScriptTarget.Latest,
    true,
    kind
  );
  const hits: Hit[] = [];
  const visit = (node: ts.Node): void => {
    if (isTextLiteral(node)) hits.push(...literalHits(node, source));
    node.forEachChild(visit);
  };
  visit(file);
  return hits;
}

function hitsFor(filePath: string, source: string): Hit[] {
  if (filePath.endsWith('.css')) return cssHits(source, 0);
  if (filePath.endsWith('.html')) return htmlHits(source);
  if (/\.tsx?$/.test(filePath)) return scriptHits(filePath, source);
  return [];
}

function toPosition(source: string, hit: Hit): ColorLiteral {
  const before = source.slice(0, hit.offset);
  const lineStart = before.lastIndexOf('\n') + 1;
  return {
    line: before.split('\n').length,
    column: hit.offset - lineStart + 1,
    match: hit.match
  };
}

export function findColorLiterals(
  filePath: string,
  source: string
): ColorLiteral[] {
  return hitsFor(filePath, source)
    .sort((a, b) => a.offset - b.offset)
    .map((hit) => toPosition(source, hit));
}
