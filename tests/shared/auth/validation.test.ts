import { describe, expect, it } from 'vitest';

import {
  calculatePasswordStrength,
  validateEmail,
  validateLoginForm,
  validateLoginPassword,
  validateRegistrationPassword,
  validateRepeatPassword,
  validateResetPasswordForm,
  validateUpdatePasswordForm,
  validateUsername
} from '../../../src/shared/auth/validation';

describe('validateEmail', () => {
  it('accepts a valid standard email address', () => {
    const error = validateEmail('hortelano@example.com');

    expect(error).toBeNull();
  });

  it.each([
    ['empty string', ''],
    ['whitespace only', '   ']
  ])('returns required error for %s', (_, value) => {
    const error = validateEmail(value);

    expect(error).toBe('required');
  });

  it.each([
    ['missing domain', 'usuario@'],
    ['missing at sign', 'usuario.example.com'],
    ['spaces inside', 'usuario @example.com'],
    ['no tld', 'usuario@localhost']
  ])('returns invalid error for malformed email (%s)', (_, value) => {
    const error = validateEmail(value);

    expect(error).toBe('invalid');
  });
});

describe('validateLoginPassword', () => {
  it('accepts non-empty password', () => {
    const error = validateLoginPassword('AnyPassword123');

    expect(error).toBeNull();
  });

  it('returns required error for empty password', () => {
    const error = validateLoginPassword('');

    expect(error).toBe('required');
  });
});

describe('validateLoginForm', () => {
  it('returns empty errors object when form is valid', () => {
    const errors = validateLoginForm('hortelano@example.com', 'Secret123!');

    expect(errors).toEqual({});
  });

  it('collects errors for invalid inputs', () => {
    const errors = validateLoginForm('', '');

    expect(errors).toEqual({
      email: 'required',
      password: 'required'
    });
  });
});

describe('validateUsername', () => {
  it('accepts valid username within 1 to 50 characters', () => {
    const error = validateUsername('hortelano');

    expect(error).toBeNull();
  });

  it.each([
    ['empty string', ''],
    ['whitespace only', '   ']
  ])('returns required error for %s', (_, value) => {
    const error = validateUsername(value);

    expect(error).toBe('required');
  });

  it.each([
    ['leading whitespace', ' hortelano'],
    ['trailing whitespace', 'hortelano ']
  ])(
    'returns trimmed error when username has leading or trailing whitespace (%s)',
    (_, value) => {
      const error = validateUsername(value);

      expect(error).toBe('trimmed');
    }
  );

  it('returns length error when username exceeds 50 characters', () => {
    const error = validateUsername('a'.repeat(51));

    expect(error).toBe('length');
  });
});

describe('validateRegistrationPassword', () => {
  it('accepts password meeting all complexity and length requirements', () => {
    const error = validateRegistrationPassword('Password123!');

    expect(error).toBeNull();
  });

  it.each([
    ['fewer than 8 chars', 'Pass1!'],
    ['more than 64 chars', 'A1!' + 'a'.repeat(62)]
  ])('returns length error for password length violation (%s)', (_, value) => {
    const error = validateRegistrationPassword(value);

    expect(error).toBe('length');
  });

  it.each([
    ['missing lowercase', 'PASSWORD123!'],
    ['missing uppercase', 'password123!'],
    ['missing digit', 'Password!!!!'],
    ['missing non-alphanumeric', 'Password1234']
  ])('returns complexity error when rule is violated (%s)', (_, value) => {
    const error = validateRegistrationPassword(value);

    expect(error).toBe('complexity');
  });

  it('returns bytes error when UTF-8 bytes exceed 72', () => {
    const error = validateRegistrationPassword('Pass1!' + 'ñ'.repeat(35));

    expect(error).toBe('bytes');
  });
});

describe('calculatePasswordStrength', () => {
  it('returns score 0 and null label for empty password', () => {
    const strength = calculatePasswordStrength('');

    expect(strength).toEqual({ score: 0, labelKey: null });
  });

  it('returns score 1 (weak) when few criteria are met', () => {
    const strength = calculatePasswordStrength('abc');

    expect(strength).toEqual({
      score: 1,
      labelKey: 'auth.password_strength_weak'
    });
  });

  it('returns score 2 (medium) when intermediate criteria are met', () => {
    const strength = calculatePasswordStrength('Password12');

    expect(strength).toEqual({
      score: 2,
      labelKey: 'auth.password_strength_medium'
    });
  });

  it('returns score 3 (strong) when all criteria are met', () => {
    const strength = calculatePasswordStrength('Password123!');

    expect(strength).toEqual({
      score: 3,
      labelKey: 'auth.password_strength_strong'
    });
  });
});

describe('validateRepeatPassword', () => {
  it('accepts matching passwords', () => {
    const error = validateRepeatPassword('Secret123!', 'Secret123!');

    expect(error).toBeNull();
  });

  it('returns required when repeat password is empty', () => {
    const error = validateRepeatPassword('Secret123!', '');

    expect(error).toBe('required');
  });

  it('returns mismatch when passwords do not match', () => {
    const error = validateRepeatPassword('Secret123!', 'Different123!');

    expect(error).toBe('mismatch');
  });
});

describe('validateResetPasswordForm', () => {
  it('returns empty errors object when both fields are valid and matching', () => {
    const errors = validateResetPasswordForm('Password123!', 'Password123!');

    expect(errors).toEqual({});
  });

  it.each([
    ['too short', 'Pass1!', 'length'],
    ['missing complexity', 'password123', 'complexity']
  ])('reports the password rule violation (%s)', (_, password, expectedKey) => {
    const errors = validateResetPasswordForm(password, password);

    expect(errors.password).toBe(expectedKey);
  });

  it('reports the bytes rule when UTF-8 bytes exceed 72', () => {
    const password = 'Pass1!' + 'ñ'.repeat(35);
    const errors = validateResetPasswordForm(password, password);

    expect(errors.password).toBe('bytes');
  });

  it.each([
    ['empty repeat', 'Password123!', '', 'required'],
    ['mismatched repeat', 'Password123!', 'Different123!', 'mismatch']
  ])(
    'reports the repeat password rule violation (%s)',
    (_, password, repeatPassword, expectedKey) => {
      const errors = validateResetPasswordForm(password, repeatPassword);

      expect(errors.repeatPassword).toBe(expectedKey);
    }
  );
});

describe('validateUpdatePasswordForm', () => {
  it('returns empty errors object when all fields are valid', () => {
    const values = {
      oldPassword: 'CurrentPassword123!',
      password: 'NewPassword123!',
      repeatPassword: 'NewPassword123!'
    };

    const errors = validateUpdatePasswordForm(values);

    expect(errors).toEqual({});
  });

  it.each([['empty', '', 'required']])(
    'reports oldPassword error for %s',
    (_desc, oldPassword, expected) => {
      const values = {
        oldPassword,
        password: 'NewPassword123!',
        repeatPassword: 'NewPassword123!'
      };

      const errors = validateUpdatePasswordForm(values);

      expect(errors.oldPassword).toBe(expected);
    }
  );

  it.each([
    ['empty', '', 'required'],
    ['too short', 'Short1!', 'length'],
    ['too long', `${'A'.repeat(65)}1!`, 'length'],
    ['missing lower', 'PASSWORD123!', 'complexity'],
    ['missing upper', 'password123!', 'complexity'],
    ['missing digit', 'Password!!!!', 'complexity'],
    ['missing special', 'Password1234', 'complexity']
  ])('reports password error for %s', (_desc, password, expected) => {
    const values = {
      oldPassword: 'CurrentPassword123!',
      password,
      repeatPassword: password
    };

    const errors = validateUpdatePasswordForm(values);

    expect(errors.password).toBe(expected);
  });

  it('reports bytes error when password UTF-8 exceeds 72 bytes', () => {
    const password = `Pass1!${'ñ'.repeat(35)}`;
    const values = {
      oldPassword: 'CurrentPassword123!',
      password,
      repeatPassword: password
    };

    const errors = validateUpdatePasswordForm(values);

    expect(errors.password).toBe('bytes');
  });

  it.each([
    ['empty', '', 'required'],
    ['mismatch', 'Different123!', 'mismatch']
  ])(
    'reports repeatPassword error for %s',
    (_desc, repeatPassword, expected) => {
      const values = {
        oldPassword: 'CurrentPassword123!',
        password: 'NewPassword123!',
        repeatPassword
      };

      const errors = validateUpdatePasswordForm(values);

      expect(errors.repeatPassword).toBe(expected);
    }
  );
});
