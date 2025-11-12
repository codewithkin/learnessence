export const BRAND = {
  name: 'LearnEssence',
  colors: {
    primary: '#4F46E5',
    primaryLight: '#EEF2FF',
    accent: '#F59E0B',
    accentLight: '#FEF3C7',
    background: '#F9FAFB',
    surface: '#FFFFFF',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
  },
  radii: {
    default: '0.75rem',
    large: '1rem',
    full: '2rem',
  },
  shadows: {
    sm: '0 1px 2px rgba(16,24,40,0.04)',
    md: '0 6px 18px rgba(16,24,40,0.08)',
  },
};

export function cc(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}
