import { t } from '../../../../i18n/core/t';

export default function ButtonsSection() {
  return (
    <section
      className="design-system-catalog__section"
      aria-labelledby="sec-buttons"
    >
      <h2 id="sec-buttons" className="design-system-catalog__section-title">
        {t('dev.designSystem.sections.buttons')}
      </h2>
    </section>
  );
}
