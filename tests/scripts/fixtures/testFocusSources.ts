export const onlyWithReferenceAbove = [
  '// #123',
  'it.only("x", () => {});'
].join('\n');

export const multipleOnly = [
  'describe.only("a", () => {});',
  'test.only("b", () => {});'
].join('\n');

export const skipWithoutReference = 'it.skip("x", () => {});';

export const skipWithNumberSameLine = 'it.skip("x", () => {}); // #123';

export const skipWithUrlSameLine =
  'it.skip("x", () => {}); // https://example.com/issue/9';

export const skipWithReferencePreviousLine = [
  '// see #456',
  'it.skip("x", () => {});'
].join('\n');

export const skipWithReferenceTwoLinesAbove = [
  '// #456',
  '',
  'it.skip("x", () => {});'
].join('\n');

export const cleanSource = [
  'it("a", () => {});',
  'describe("b", () => {});'
].join('\n');

export const focusInsideStringOrComment = [
  'it("documents focus", () => {',
  "  expect(message).toContain('.only(');",
  "  expect(message).toContain('.skip(');",
  '});'
].join('\n');
