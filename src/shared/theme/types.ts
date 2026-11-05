export type ThemePreference = 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

export interface ThemeContextValue {
  readonly preference: ThemePreference;
  readonly resolvedTheme: ResolvedTheme;
  readonly setThemePreference: (preference: ThemePreference) => void;
  readonly cycleTheme: () => void;
  readonly toggleTheme: () => void;
}
