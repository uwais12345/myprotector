// ============================================================
// ConnectDesk — Contacts Store (localStorage-backed)
// ============================================================

import type { Contact } from '@/types';
import { LOCAL_STORAGE_KEYS } from '@/constants';
import { SAMPLE_CONTACTS } from '@/utils/sampleData';

function storageKey(userId: string): string {
  return `${LOCAL_STORAGE_KEYS.contacts}_${userId}`;
}

export function loadContacts(userId: string): Contact[] {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (raw) return JSON.parse(raw) as Contact[];
    // Seed with sample data on first load
    const seeded = SAMPLE_CONTACTS;
    saveContacts(userId, seeded);
    return seeded;
  } catch {
    return [];
  }
}

export function saveContacts(userId: string, contacts: Contact[]): void {
  localStorage.setItem(storageKey(userId), JSON.stringify(contacts));
}

export function addContacts(userId: string, newContacts: Contact[]): Contact[] {
  const existing = loadContacts(userId);
  const updated = [...existing, ...newContacts];
  saveContacts(userId, updated);
  return updated;
}

export function updateContact(userId: string, updated: Contact): Contact[] {
  const existing = loadContacts(userId);
  const contacts = existing.map(c =>
    c.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : c
  );
  saveContacts(userId, contacts);
  return contacts;
}

export function deleteContact(userId: string, contactId: string): Contact[] {
  const existing = loadContacts(userId);
  const contacts = existing.filter(c => c.id !== contactId);
  saveContacts(userId, contacts);
  return contacts;
}

export function toggleFavorite(userId: string, contactId: string): Contact[] {
  const existing = loadContacts(userId);
  const contacts = existing.map(c =>
    c.id === contactId
      ? { ...c, isFavorite: !c.isFavorite, updatedAt: new Date().toISOString() }
      : c
  );
  saveContacts(userId, contacts);
  return contacts;
}

export function toggleEmergency(userId: string, contactId: string): Contact[] {
  const existing = loadContacts(userId);
  const contacts = existing.map(c =>
    c.id === contactId
      ? { ...c, isEmergency: !c.isEmergency, updatedAt: new Date().toISOString() }
      : c
  );
  saveContacts(userId, contacts);
  return contacts;
}

export function clearAllContacts(userId: string): void {
  saveContacts(userId, []);
}
