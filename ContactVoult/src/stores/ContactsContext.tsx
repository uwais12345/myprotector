// ============================================================
// ConnectDesk — Contacts Context
// ============================================================

import {
  createContext, useContext, useState, useCallback,
  useMemo, type ReactNode, useEffect
} from 'react';
import type { Contact } from '@/types';
import {
  loadContacts, saveContacts, addContacts,
  updateContact, deleteContact, toggleFavorite, toggleEmergency
} from '@/lib/contacts';
import { useAuth } from './AuthContext';
import { detectDuplicates } from '@/utils/vcfParser';

interface ContactsContextValue {
  contacts: Contact[];
  isLoading: boolean;
  addImportedContacts: (incoming: Contact[], skipDuplicates: boolean) => {
    imported: number; duplicates: number;
  };
  updateContactItem: (contact: Contact) => void;
  deleteContactItem: (id: string) => void;
  toggleFavoriteItem: (id: string) => void;
  toggleEmergencyItem: (id: string) => void;
  clearAll: () => void;
  favorites: Contact[];
  emergencyContacts: Contact[];
}

const ContactsContext = createContext<ContactsContextValue | undefined>(undefined);

export function ContactsProvider({ children }: { children: ReactNode }) {
  const { auth } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (auth.status === 'authenticated' && auth.user) {
      setIsLoading(true);
      const loaded = loadContacts(auth.user.id);
      setContacts(loaded);
      setIsLoading(false);
    } else if (auth.status === 'unauthenticated') {
      setContacts([]);
      setIsLoading(false);
    }
  }, [auth.status, auth.user?.id]);

  const userId = auth.user?.id ?? '';

  const addImportedContacts = useCallback(
    (incoming: Contact[], skipDuplicates: boolean) => {
      const current = contacts;
      const { unique, duplicates } = detectDuplicates(incoming, current);

      const toAdd = skipDuplicates ? unique : incoming;
      if (toAdd.length > 0) {
        const updated = addContacts(userId, toAdd);
        setContacts(updated);
      }

      return { imported: toAdd.length, duplicates: duplicates.length };
    },
    [contacts, userId]
  );

  const updateContactItem = useCallback(
    (contact: Contact) => {
      const updated = updateContact(userId, contact);
      setContacts(updated);
    },
    [userId]
  );

  const deleteContactItem = useCallback(
    (id: string) => {
      const updated = deleteContact(userId, id);
      setContacts(updated);
    },
    [userId]
  );

  const toggleFavoriteItem = useCallback(
    (id: string) => {
      const updated = toggleFavorite(userId, id);
      setContacts(updated);
    },
    [userId]
  );

  const toggleEmergencyItem = useCallback(
    (id: string) => {
      const updated = toggleEmergency(userId, id);
      setContacts(updated);
    },
    [userId]
  );

  const clearAll = useCallback(() => {
    saveContacts(userId, []);
    setContacts([]);
  }, [userId]);

  const favorites = useMemo(() => contacts.filter(c => c.isFavorite), [contacts]);
  const emergencyContacts = useMemo(() => contacts.filter(c => c.isEmergency), [contacts]);

  return (
    <ContactsContext.Provider
      value={{
        contacts, isLoading,
        addImportedContacts, updateContactItem, deleteContactItem,
        toggleFavoriteItem, toggleEmergencyItem, clearAll,
        favorites, emergencyContacts,
      }}
    >
      {children}
    </ContactsContext.Provider>
  );
}

export function useContacts(): ContactsContextValue {
  const ctx = useContext(ContactsContext);
  if (!ctx) throw new Error('useContacts must be used within ContactsProvider');
  return ctx;
}
