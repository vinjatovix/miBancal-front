import { t } from '../../../../i18n/core/t';

export default function TypographySection() {
  return (
    <section
      className="design-system-catalog__section"
      aria-labelledby="sec-typography"
    >
      <h2 id="sec-typography" className="design-system-catalog__section-title">
        {t('dev.designSystem.sections.typography')}
      </h2>
    </section>
  );
}
