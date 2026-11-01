import PasswordStrengthBar from '../../../../pages/auth/components/PasswordStrengthBar';
import Icon from '../../../../shared/components/Icon/Icon';
import { t } from '../../../../i18n/core/t';

export default function ContrastSection() {
  return (
    <section
      className="design-system-catalog__section"
      aria-labelledby="sec-contrast"
    >
      <h2 id="sec-contrast" className="design-system-catalog__section-title">
        {t('dev.designSystem.sections.contrast')}
      </h2>

      <div className="design-system-catalog__demo-group">
        <button type="button" className="app-button app-button--primary">
          <span className="app-button__label">
            {t('dev.designSystem.demos.primaryRest')}
          </span>
        </button>
        <button
          type="button"
          className="app-button app-button--primary is-hover"
        >
          <span className="app-button__label">
            {t('dev.designSystem.demos.primaryHover')}
          </span>
        </button>
        <button
          type="button"
          className="app-button app-button--primary is-active"
        >
          <span className="app-button__label">
            {t('dev.designSystem.demos.primaryActive')}
          </span>
        </button>
      </div>

      <div className="design-system-catalog__demo-toasts">
        <div className="toast-item toast-item--success" role="status">
          <span className="toast-item__icon toast-item__icon--success">
            <Icon name="check_circle" decorative />
          </span>
          <div className="toast-item__body">
            <span className="toast-item__title">
              {t('dev.designSystem.demos.successToast')}
            </span>
            <span className="toast-item__message">
              {t('dev.designSystem.demos.toastSampleMessage')}
            </span>
          </div>
        </div>

        <div className="toast-item toast-item--warning" role="status">
          <span className="toast-item__icon toast-item__icon--warning">
            <Icon name="warning" decorative />
          </span>
          <div className="toast-item__body">
            <span className="toast-item__title">
              {t('dev.designSystem.demos.warningToast')}
            </span>
            <span className="toast-item__message">
              {t('dev.designSystem.demos.toastSampleMessage')}
            </span>
          </div>
        </div>

        <div className="toast-item toast-item--error" role="alert">
          <span className="toast-item__icon toast-item__icon--error">
            <Icon name="error" decorative />
          </span>
          <div className="toast-item__body">
            <span className="toast-item__title">
              {t('dev.designSystem.demos.errorToast')}
            </span>
            <span className="toast-item__message">
              {t('dev.designSystem.demos.toastSampleMessage')}
            </span>
          </div>
        </div>

        <div className="toast-item toast-item--info" role="status">
          <span className="toast-item__icon toast-item__icon--info">
            <Icon name="info" decorative />
          </span>
          <div className="toast-item__body">
            <span className="toast-item__title">
              {t('dev.designSystem.demos.infoToast')}
            </span>
            <span className="toast-item__message">
              {t('dev.designSystem.demos.toastSampleMessage')}
            </span>
          </div>
        </div>
      </div>

      <div className="design-system-catalog__demo-meter">
        <PasswordStrengthBar password="abc" />
        <PasswordStrengthBar password="abcdefgh1" />
        <PasswordStrengthBar password="Abcdefgh1!" />
      </div>

      <div className="design-system-catalog__demo-fields">
        <label htmlFor="demo-input-rest">
          {t('dev.designSystem.demos.fieldLabel')}
        </label>
        <input
          id="demo-input-rest"
          type="text"
          className="auth-input"
          defaultValue={t('dev.designSystem.demos.fieldLabel')}
        />

        <label htmlFor="demo-input-invalid">
          {t('dev.designSystem.demos.fieldInvalidLabel')}
        </label>
        <input
          id="demo-input-invalid"
          type="text"
          className="auth-input auth-input-error"
          aria-invalid="true"
          aria-describedby="demo-input-error-msg"
          defaultValue=""
        />
        <span id="demo-input-error-msg" className="auth-error-text">
          {t('dev.designSystem.demos.fieldError')}
        </span>
      </div>
    </section>
  );
}
