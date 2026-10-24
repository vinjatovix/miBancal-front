import { t } from '../../../i18n/core/t';

const ERROR_KEYS: Record<string, string> = {
  required: 'auth.required_field',
  invalid: 'auth.invalid_email',
  taken: 'auth.username_taken',
  mismatch: 'auth.passwords_dont_match',
  length: 'auth.password_requirements',
  complexity: 'auth.password_requirements',
  bytes: 'auth.password_requirements'
};

export function resolveAuthErrorText(key?: string): string | null {
  if (!key) return null;
  const dictKey = ERROR_KEYS[key];
  return dictKey ? t(dictKey as never) : null;
}
