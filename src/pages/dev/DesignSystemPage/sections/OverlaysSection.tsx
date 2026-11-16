import { t } from '../../../../i18n/core/t';

export default function OverlaysSection() {
  return (
    <section
      className="design-system-catalog__section"
      aria-labelledby="sec-overlays"
    >
      <h2 id="sec-overlays" className="design-system-catalog__section-title">
        {t('dev.designSystem.sections.overlays')}
      </h2>
    </section>
  );
}
