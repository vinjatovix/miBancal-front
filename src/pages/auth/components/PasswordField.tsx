import { useState, type ReactNode } from 'react';

import { t } from '../../../i18n/core/t';
import Icon from '../../../shared/components/Icon/Icon';
import './passwordField.css';

interface PasswordFieldProps {
  readonly id: string;
  readonly name: string;
  readonly label: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly autoComplete: 'current-password' | 'new-password';
  readonly onBlur?: () => void;
  readonly onFocus?: () => void;
  readonly error?: string | null;
  readonly children?: ReactNode;
  readonly labelRight?: ReactNode;
  readonly disabled?: boolean;
}

export default function PasswordField({
  id,
  name,
  label,
  value,
  onChange,
  autoComplete,
  onBlur,
  onFocus,
  error,
  children,
  labelRight,
  disabled
}: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    setIsVisible((previous) => !previous);
  };

  const inputType = isVisible ? 'text' : 'password';
  const toggleLabel = isVisible
    ? t('auth.hide_password')
    : t('auth.show_password');
  const iconName = isVisible ? 'visibility_off' : 'visibility';

  return (
    <div className="auth-field">
      {labelRight ? (
        <div className="auth-label-row">
          <label htmlFor={id} className="auth-label">
            {label}
          </label>
          {labelRight}
        </div>
      ) : (
        <label htmlFor={id} className="auth-label">
          {label}
        </label>
      )}

      <div className="auth-password-wrap">
        <input
          id={id}
          name={name}
          type={inputType}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          onFocus={onFocus}
          disabled={disabled}
          className={`auth-input ${error ? 'auth-input-error' : ''}`}
          autoComplete={autoComplete}
        />
        <button
          type="button"
          className="auth-password-toggle"
          aria-label={toggleLabel}
          aria-controls={id}
          onClick={toggleVisibility}
          disabled={disabled}
          onMouseDown={(event) => {
            event.preventDefault();
          }}
        >
          <Icon name={iconName} decorative />
        </button>
      </div>

      {children}
      {error && <span className="auth-error-text">{error}</span>}
    </div>
  );
}
