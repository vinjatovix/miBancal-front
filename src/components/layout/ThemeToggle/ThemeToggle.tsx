import { t } from '../../../i18n/core/t';
import Icon from '../../../shared/components/Icon/Icon';
import { useTheme } from '../../../shared/theme';
import type { ThemePreference } from '../../../shared/theme';
import './themeToggle.css';

interface ThemeToggleConfig {
  readonly iconName: 'sunny' | 'dark_mode';
  readonly ariaLabel: string;
}

function getThemeToggleConfig(preference: ThemePreference): ThemeToggleConfig {
  if (preference === 'dark') {
    return {
      iconName: 'dark_mode',
      ariaLabel: t('theme.aria.dark')
    };
  }

  return {
    iconName: 'sunny',
    ariaLabel: t('theme.aria.light')
  };
}

export default function ThemeToggle() {
  const { preference, toggleTheme } = useTheme();
  const config = getThemeToggleConfig(preference);

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={config.ariaLabel}
      title={config.ariaLabel}
      onClick={toggleTheme}
    >
      <Icon name={config.iconName} decorative />
    </button>
  );
}
