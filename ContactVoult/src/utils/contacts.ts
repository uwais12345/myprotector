// ============================================================
// ConnectDesk — Contact Utility Functions
// ============================================================

import type { Contact, GroupedContacts } from '@/types';
import { AVATAR_COLORS } from '@/constants';

// ---- Sorting & Grouping ------------------------------------

export function sortContacts(contacts: Contact[]): Contact[] {
  return [...contacts].sort((a, b) => {
    const nameA = (a.displayName || a.fullName).toLowerCase();
    const nameB = (b.displayName || b.fullName).toLowerCase();
    return nameA.localeCompare(nameB, undefined, { sensitivity: 'base' });
  });
}

export function groupContactsByLetter(contacts: Contact[]): GroupedContacts[] {
  const sorted = sortContacts(contacts);
  const groups = new Map<string, Contact[]>();

  for (const contact of sorted) {
    const name = contact.displayName || contact.fullName;
    const first = name.trim()[0]?.toUpperCase() ?? '#';
    const key = /^[A-Z]$/i.test(first) ? first : '#';
    const group = groups.get(key) ?? [];
    group.push(contact);
    groups.set(key, group);
  }

  // Sort keys: letters first (A-Z), then '#'
  const sortedKeys = Array.from(groups.keys()).sort((a, b) => {
    if (a === '#') return 1;
    if (b === '#') return -1;
    return a.localeCompare(b);
  });

  return sortedKeys.map(letter => ({
    letter,
    contacts: groups.get(letter)!,
  }));
}

// ---- Search ------------------------------------------------

export function searchContacts(contacts: Contact[], query: string): Contact[] {
  const q = query.toLowerCase().trim();
  if (!q) return contacts;

  return contacts.filter(c => {
    if ((c.displayName || c.fullName).toLowerCase().includes(q)) return true;
    if (c.organization?.toLowerCase().includes(q)) return true;
    if (c.phones.some(p => p.value.includes(q))) return true;
    if (c.emails.some(e => e.value.toLowerCase().includes(q))) return true;
    return false;
  });
}

// ---- Avatar ------------------------------------------------

export function getAvatarColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]!;
}

export function buildInitials(contact: Contact): string {
  if (contact.firstName && contact.lastName) {
    return `${contact.firstName[0]}${contact.lastName[0]}`.toUpperCase();
  }
  if (contact.firstName) return contact.firstName.slice(0, 2).toUpperCase();
  const name = contact.displayName || contact.fullName;
  if (!name) return '??';
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) return `${words[0]![0]}${words[1]![0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

// ---- Highlight matching text --------------------------------

export function highlightText(text: string, query: string): string {
  if (!query.trim()) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.replace(new RegExp(`(${escaped})`, 'gi'), '<mark>$1</mark>');
}

// ---- Format phone number for display -----------------------

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `${digits.slice(0,3)}-${digits.slice(3,6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits[0] === '1') {
    return `+1 ${digits.slice(1,4)}-${digits.slice(4,7)}-${digits.slice(7)}`;
  }
  return phone;
}

// ---- Primary phone / email getters -------------------------

export function getPrimaryPhone(contact: Contact): string | undefined {
  return contact.phones.find(p => p.isPrimary)?.value ?? contact.phones[0]?.value;
}

export function getPrimaryEmail(contact: Contact): string | undefined {
  return contact.emails.find(e => e.isPrimary)?.value ?? contact.emails[0]?.value;
}

// ---- Contact stats -----------------------------------------

export function getContactStats(contacts: Contact[]) {
  return {
    total:     contacts.length,
    favorites: contacts.filter(c => c.isFavorite).length,
    emergency: contacts.filter(c => c.isEmergency).length,
  };
}
