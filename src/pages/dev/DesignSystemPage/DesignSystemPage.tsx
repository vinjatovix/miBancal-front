import ThemeToggle from '../../../components/layout/ThemeToggle/ThemeToggle';
import '../../../i18n/messages/designSystem';
import { t } from '../../../i18n/core/t';
import ButtonsSection from './sections/ButtonsSection';
import ContrastSection from './sections/ContrastSection';
import FeedbackSection from './sections/FeedbackSection';
import FormsSection from './sections/FormsSection';
import NavigationSection from './sections/NavigationSection';
import OverlaysSection from './sections/OverlaysSection';
import TypographySection from './sections/TypographySection';
import './designSystemPage.css';

export default function DesignSystemPage() {
  return (
    <div className="design-system-catalog" data-testid="design-system-catalog">
      <header className="design-system-catalog__header">
        <h1 className="design-system-catalog__title">
          {t('dev.designSystem.title')}
        </h1>
        <ThemeToggle />
      </header>

      <ContrastSection />
      <TypographySection />
      <ButtonsSection />
      <FormsSection />
      <FeedbackSection />
      <NavigationSection />
      <OverlaysSection />
    </div>
  );
}
