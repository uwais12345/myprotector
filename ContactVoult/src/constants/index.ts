// ============================================================
// ConnectDesk — Application Constants
// ============================================================

export const APP_CONFIG = {
  name: 'ConnectDesk',
  subtitle: 'Secure contact access when you need it.',
  version: '1.0.0',
  maxVcfFileSizeMB: 50,
  searchDebounceMs: 200,
  toastDurationMs: 4000,
} as const;

export const EMERGENCY_NUMBERS = [
  { name: 'Emergency Services', number: '112', region: 'International' },
  { name: 'Police', number: '100', region: 'India' },
  { name: 'Ambulance', number: '108', region: 'India' },
  { name: 'Fire', number: '101', region: 'India' },
] as const;

export const AVATAR_COLORS: readonly string[] = [
  '#2563eb', // blue
  '#16a34a', // green
  '#d97706', // amber
  '#9333ea', // purple
  '#e11d48', // rose
  '#0891b2', // cyan
  '#065f46', // emerald-dark
  '#92400e', // amber-dark
  '#1e3a5f', // navy
  '#5b21b6', // violet
  '#be185d', // pink
  '#0e7490', // teal
] as const;

export const ROUTES = {
  login:          '/login',
  register:       '/register',
  forgotPassword: '/forgot-password',
  contacts:       '/contacts',
  favorites:      '/contacts/favorites',
  emergency:      '/contacts/emergency',
  importContacts: '/contacts/import',
  settings:       '/contacts/settings',
  contactDetail:  '/contacts/:id',
} as const;

export const LOCAL_STORAGE_KEYS = {
  theme:    'cd_theme',
  contacts: 'cd_contacts',
  user:     'cd_user',
  auth:     'cd_auth',
} as const;

export const THEME_OPTIONS = ['light', 'dark', 'system'] as const;
export type ThemeOption = typeof THEME_OPTIONS[number];
