const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LOWERCASE_PATTERN = /[a-z]/;
const UPPERCASE_PATTERN = /[A-Z]/;
const DIGIT_PATTERN = /[0-9]/;
const SPECIAL_CHAR_PATTERN = /[^a-zA-Z0-9]/;

export function validateEmail(email: string): string | null {
  if (!email || email.trim() === '') {
    return 'required';
  }
  if (!EMAIL_PATTERN.test(email)) {
    return 'invalid';
  }
  return null;
}

export function validateLoginPassword(password: string): string | null {
  if (!password || password === '') {
    return 'required';
  }
  return null;
}

export function validateLoginForm(
  email: string,
  password: string
): Record<string, string> {
  const errors: Record<string, string> = {};
  const emailError = validateEmail(email);
  const passwordError = validateLoginPassword(password);

  if (emailError) errors.email = emailError;
  if (passwordError) errors.password = passwordError;

  return errors;
}

export function validateUsername(username: string): string | null {
  if (!username || username.trim() === '') {
    return 'required';
  }
  if (username.trim() !== username) {
    return 'trimmed';
  }
  if (username.length < 1 || username.length > 50) {
    return 'length';
  }
  return null;
}

export function validateRegistrationPassword(password: string): string | null {
  if (!password) {
    return 'required';
  }
  if (password.length < 8 || password.length > 64) {
    return 'length';
  }

  const byteLength = new TextEncoder().encode(password).length;
  if (byteLength > 72) {
    return 'bytes';
  }

  const hasLower = LOWERCASE_PATTERN.test(password);
  const hasUpper = UPPERCASE_PATTERN.test(password);
  const hasDigit = DIGIT_PATTERN.test(password);
  const hasSpecial = SPECIAL_CHAR_PATTERN.test(password);

  if (!hasLower || !hasUpper || !hasDigit || !hasSpecial) {
    return 'complexity';
  }

  return null;
}

export type PasswordStrengthScore = 0 | 1 | 2 | 3;

export interface PasswordStrength {
  readonly score: PasswordStrengthScore;
  readonly labelKey:
    | 'auth.password_strength_weak'
    | 'auth.password_strength_medium'
    | 'auth.password_strength_strong'
    | null;
}

export function calculatePasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return { score: 0, labelKey: null };
  }

  let criteriaCount = 0;
  if (password.length >= 8 && password.length <= 64) criteriaCount += 1;
  if (LOWERCASE_PATTERN.test(password)) criteriaCount += 1;
  if (UPPERCASE_PATTERN.test(password)) criteriaCount += 1;
  if (DIGIT_PATTERN.test(password)) criteriaCount += 1;
  if (SPECIAL_CHAR_PATTERN.test(password)) criteriaCount += 1;

  if (criteriaCount <= 2) {
    return { score: 1, labelKey: 'auth.password_strength_weak' };
  }
  if (criteriaCount <= 4) {
    return { score: 2, labelKey: 'auth.password_strength_medium' };
  }
  return { score: 3, labelKey: 'auth.password_strength_strong' };
}

export function validateRepeatPassword(
  password: string,
  repeatPassword: string
): string | null {
  if (!repeatPassword) {
    return 'required';
  }
  if (password !== repeatPassword) {
    return 'mismatch';
  }
  return null;
}

export function validateResetPasswordForm(
  password: string,
  repeatPassword: string
): Record<string, string> {
  const errors: Record<string, string> = {};

  const passwordError = validateRegistrationPassword(password);
  if (passwordError) errors.password = passwordError;

  const repeatPasswordError = validateRepeatPassword(password, repeatPassword);
  if (repeatPasswordError) errors.repeatPassword = repeatPasswordError;

  return errors;
}

export function validateRegisterForm(data: {
  readonly email: string;
  readonly username: string;
  readonly password: string;
  readonly repeatPassword: string;
}): Record<string, string> {
  const errors: Record<string, string> = {};

  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;

  const usernameError = validateUsername(data.username);
  if (usernameError) errors.username = usernameError;

  const passwordError = validateRegistrationPassword(data.password);
  if (passwordError) errors.password = passwordError;

  const repeatPasswordError = validateRepeatPassword(
    data.password,
    data.repeatPassword
  );
  if (repeatPasswordError) errors.repeatPassword = repeatPasswordError;

  return errors;
}

export function validateUpdatePasswordForm(values: {
  readonly oldPassword: string;
  readonly password: string;
  readonly repeatPassword: string;
}): Record<string, string> {
  const errors: Record<string, string> = {};

  const oldPasswordError = validateLoginPassword(values.oldPassword);
  if (oldPasswordError) errors.oldPassword = oldPasswordError;

  const passwordError = validateRegistrationPassword(values.password);
  if (passwordError) errors.password = passwordError;

  const repeatPasswordError = validateRepeatPassword(
    values.password,
    values.repeatPassword
  );
  if (repeatPasswordError) errors.repeatPassword = repeatPasswordError;

  return errors;
}
