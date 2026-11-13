import { t } from '../../../../i18n/core/t';

export default function FeedbackSection() {
  return (
    <section
      className="design-system-catalog__section"
      aria-labelledby="sec-feedback"
    >
      <h2 id="sec-feedback" className="design-system-catalog__section-title">
        {t('dev.designSystem.sections.feedback')}
      </h2>
    </section>
  );
}
