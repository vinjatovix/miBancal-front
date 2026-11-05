import { t } from '../../../i18n/core/t';
import { calculatePasswordStrength } from '../../../shared/auth/validation';
import './passwordStrengthBar.css';

interface PasswordStrengthBarProps {
  readonly password: string;
}

export default function PasswordStrengthBar({
  password
}: PasswordStrengthBarProps) {
  const { score, labelKey } = calculatePasswordStrength(password);

  if (!password) {
    return null;
  }

  const strengthClass =
    score === 1
      ? 'strength-weak'
      : score === 2
        ? 'strength-medium'
        : 'strength-strong';

  return (
    <div className="password-strength-container" aria-live="polite">
      <div className="password-strength-meter">
        <div
          className={`password-strength-segment ${score >= 1 ? strengthClass : ''}`}
        />
        <div
          className={`password-strength-segment ${score >= 2 ? strengthClass : ''}`}
        />
        <div
          className={`password-strength-segment ${score >= 3 ? strengthClass : ''}`}
        />
      </div>
      {labelKey && (
        <span className={`password-strength-label ${strengthClass}-text`}>
          {t(labelKey)}
        </span>
      )}
    </div>
  );
}
