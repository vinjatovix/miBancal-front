export interface UiTextRuleBypass {
  readonly line: number;
  readonly match: string;
}

const RULE_NAME = 'no-hardcoded-ui-text';

const RULELESS_DISABLE_DIRECTIVE =
  /eslint-disable(?:-next-line|-line)?(?=\s*(?:--|\*\/|$))/;

function bypassesUiTextRule(text: string): boolean {
  return text.includes(RULE_NAME) || RULELESS_DISABLE_DIRECTIVE.test(text);
}

export function findUiTextRuleBypasses(source: string): UiTextRuleBypass[] {
  return source
    .split('\n')
    .map((text, index) => ({ line: index + 1, match: text.trim() }))
    .filter(({ match }) => bypassesUiTextRule(match));
}
