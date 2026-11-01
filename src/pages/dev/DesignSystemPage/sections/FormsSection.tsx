import { t } from '../../../../i18n/core/t';

export default function FormsSection() {
  return (
    <section
      className="design-system-catalog__section"
      aria-labelledby="sec-forms"
    >
      <h2 id="sec-forms" className="design-system-catalog__section-title">
        {t('dev.designSystem.sections.forms')}
      </h2>
    </section>
  );
}
