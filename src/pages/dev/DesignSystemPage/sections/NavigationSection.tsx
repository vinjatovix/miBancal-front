import { t } from '../../../../i18n/core/t';

export default function NavigationSection() {
  return (
    <section
      className="design-system-catalog__section"
      aria-labelledby="sec-navigation"
    >
      <h2 id="sec-navigation" className="design-system-catalog__section-title">
        {t('dev.designSystem.sections.navigation')}
      </h2>
    </section>
  );
}
