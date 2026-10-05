// ============================================================
// ConnectDesk — Core TypeScript Types
// ============================================================

export interface PhoneNumber {
  value: string;
  type: 'mobile' | 'work' | 'home' | 'fax' | 'other';
  isPrimary: boolean;
}

export interface EmailAddress {
  value: string;
  type: 'work' | 'personal' | 'other';
  isPrimary: boolean;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  type: 'work' | 'home' | 'other';
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  displayName: string;
  organization?: string;
  jobTitle?: string;
  phones: PhoneNumber[];
  emails: EmailAddress[];
  addresses: Address[];
  notes?: string;
  avatarUrl?: string;
  avatarInitials: string;
  avatarColor: string;
  isFavorite: boolean;
  isEmergency: boolean;
  createdAt: string;
  updatedAt: string;
  sourceVcfId?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthState {
  status: AuthStatus;
  user: User | null;
}

export interface ImportResult {
  total: number;
  imported: number;
  duplicates: number;
  errors: number;
  contacts: Contact[];
  duplicateContacts: Contact[];
}

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export interface AppSettings {
  theme: ThemeMode;
  compactMode: boolean;
}

export type NavSection = 'contacts' | 'favorites' | 'emergency' | 'import' | 'settings';

export interface ContactFilters {
  search: string;
  section: NavSection;
}

export interface GroupedContacts {
  letter: string;
  contacts: Contact[];
}
