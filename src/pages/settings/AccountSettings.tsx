import { useCallback, useState, type SubmitEvent } from 'react';
import { Link } from 'react-router-dom';

import { t } from '../../i18n/core/t';
import { useAuth } from '../../shared/auth/useAuth';
import { validateUpdatePasswordForm } from '../../shared/auth/validation';
import { useToast } from '../../shared/toast/useToast';
import PasswordField from '../auth/components/PasswordField';
import PasswordStrengthBar from '../auth/components/PasswordStrengthBar';
import {
  handlePasswordUpdateError,
  resolveError
} from './utils/accountSettingsErrors';
import './accountSettings.css';

interface FormValues {
  readonly oldPassword: string;
  readonly password: string;
  readonly repeatPassword: string;
}

const INITIAL_VALUES: FormValues = {
  oldPassword: '',
  password: '',
  repeatPassword: ''
};

export default function AccountSettings() {
  const { user, updatePassword, logout } = useAuth();
  const { dismissAll, showErrorToast } = useToast();

  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFieldInteraction = useCallback((field: keyof FormValues) => {
    setIsSuccess(false);
    setFieldErrors((previous) => {
      if (!previous[field]) return previous;
      const next = { ...previous };
      delete next[field];
      return next;
    });
  }, []);

  const handleChange = useCallback(
    (field: keyof FormValues, value: string) => {
      setValues((previous) => ({ ...previous, [field]: value }));
      handleFieldInteraction(field);
    },
    [handleFieldInteraction]
  );

  const handleSubmit = useCallback(
    async (event: SubmitEvent) => {
      event.preventDefault();
      dismissAll();

      const errors = validateUpdatePasswordForm(values);
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        return;
      }

      setIsSubmitting(true);
      try {
        await updatePassword(values);
        setIsSuccess(true);
        setValues(INITIAL_VALUES);
        setFieldErrors({});
      } catch (error) {
        handlePasswordUpdateError(error, {
          setFieldErrors,
          showErrorToast,
          logout
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, updatePassword, logout, dismissAll, showErrorToast]
  );

  return (
    <main className="settings-page">
      <div className="settings-container">
        <h1 className="settings-title">{t('settings.title')}</h1>

        <section
          className="settings-section settings-profile-section"
          aria-labelledby="profile-heading"
        >
          <h2 id="profile-heading" className="settings-section-title">
            {t('settings.profile_section')}
          </h2>
          <div className="settings-profile-fields">
            <div className="settings-display-group">
              <span className="settings-display-label">
                {t('settings.profile_username')}
              </span>
              <span className="settings-display-value">{user?.username}</span>
            </div>
            <div className="settings-display-group">
              <span className="settings-display-label">
                {t('settings.profile_email')}
              </span>
              <span className="settings-display-value">{user?.email}</span>
            </div>
          </div>
        </section>

        <section
          className="settings-section settings-locations-section"
          aria-labelledby="locations-heading"
        >
          <h2 id="locations-heading" className="settings-section-title">
            {t('settings.locations_section')}
          </h2>
          <p className="settings-section-description">
            {t('settings.locations_description')}
          </p>
          <Link to="/settings/locations" className="settings-locations-link">
            {t('settings.locations_link')}
          </Link>
        </section>

        <section
          className="settings-section settings-security-section"
          aria-labelledby="security-heading"
        >
          <h2 id="security-heading" className="settings-section-title">
            {t('settings.security_section')}
          </h2>

          {isSuccess && (
            <output className="settings-alert-success">
              {t('settings.success_message')}
            </output>
          )}

          <form className="settings-form" noValidate onSubmit={handleSubmit}>
            <PasswordField
              id="settings-old-password"
              name="oldPassword"
              label={t('settings.old_password')}
              value={values.oldPassword}
              onChange={(value) => handleChange('oldPassword', value)}
              onFocus={() => handleFieldInteraction('oldPassword')}
              autoComplete="current-password"
              error={resolveError(fieldErrors.oldPassword)}
              disabled={isSubmitting}
            />

            <PasswordField
              id="settings-password"
              name="password"
              label={t('settings.new_password')}
              value={values.password}
              onChange={(value) => handleChange('password', value)}
              onFocus={() => handleFieldInteraction('password')}
              autoComplete="new-password"
              error={resolveError(fieldErrors.password)}
              disabled={isSubmitting}
            >
              <PasswordStrengthBar password={values.password} />
            </PasswordField>

            <PasswordField
              id="settings-repeat-password"
              name="repeatPassword"
              label={t('settings.repeat_new_password')}
              value={values.repeatPassword}
              onChange={(value) => handleChange('repeatPassword', value)}
              onFocus={() => handleFieldInteraction('repeatPassword')}
              autoComplete="new-password"
              error={resolveError(fieldErrors.repeatPassword)}
              disabled={isSubmitting}
            />

            <button
              type="submit"
              className="settings-submit-button"
              disabled={isSubmitting}
            >
              {t('settings.change_password_submit')}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
