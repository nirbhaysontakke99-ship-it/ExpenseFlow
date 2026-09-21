export const DESIGN_TOKENS = {
  colors: {
    brand: {
      emerald50: '#ECFDF5',
      emerald100: '#D1FAE5',
      emerald200: '#A7F3D0',
      emerald500: '#10B981',
      emerald600: '#059669',
      emerald700: '#047857',
      emerald800: '#064E3B',
      emerald900: '#022C22',
      emerald950: '#011A14',
    },
    semantic: {
      healthy: {
        bg: 'rgba(16, 185, 129, 0.12)',
        text: '#059669',
        border: 'rgba(16, 185, 129, 0.25)',
        icon: '#10B981',
      },
      warning: {
        bg: 'rgba(245, 158, 11, 0.12)',
        text: '#D97706',
        border: 'rgba(245, 158, 11, 0.25)',
        icon: '#F59E0B',
      },
      danger: {
        bg: 'rgba(239, 68, 68, 0.12)',
        text: '#DC2626',
        border: 'rgba(239, 68, 68, 0.25)',
        icon: '#EF4444',
      },
    },
  },
  borderRadius: {
    card: '20px',
    cardInner: '16px',
    button: '14px',
    input: '14px',
    badge: '9999px',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
} as const;

export type ThemeMode = 'light' | 'dark' | 'system';
