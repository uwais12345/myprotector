// ============================================================
// ConnectDesk — Contact List Components
// ============================================================

import React, { useMemo, useCallback, useRef, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Users } from 'lucide-react';
import { Avatar, SkeletonContactRow, EmptyState } from '@/components/ui';
import { searchContacts, groupContactsByLetter, sortContacts, getPrimaryPhone } from '@/utils/contacts';
import type { Contact, GroupedContacts } from '@/types';
import { APP_CONFIG } from '@/constants';

// ---- Search Bar --------------------------------------------

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = 'Search contacts…' }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <div className="search-bar-wrap">
      <div className="search-input-wrap">
        <Search size={16} color="var(--text-tertiary)" aria-hidden="true" style={{ flexShrink: 0 }} />
        <input
          ref={inputRef}
          type="search"
          className="search-input"
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          aria-label="Search contacts"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
        />
        <AnimatePresence>
          {value && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.1 }}
              onClick={handleClear}
              className="btn btn-ghost btn-icon btn-sm"
              style={{ color: 'var(--text-tertiary)', flexShrink: 0 }}
              aria-label="Clear search"
            >
              <X size={15} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ---- Highlight text ----------------------------------------

function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} style={{ background: 'rgba(37,99,235,0.15)', color: 'inherit', borderRadius: 2, padding: '0 1px' }}>{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

// ---- Single Contact Row ------------------------------------

interface ContactRowProps {
  contact: Contact;
  isActive: boolean;
  searchQuery: string;
  onClick: (id: string) => void;
}

function ContactRow({ contact, isActive, searchQuery, onClick }: ContactRowProps) {
  const subtitle = contact.organization ?? getPrimaryPhone(contact) ?? '';

  return (
    <div
      role="button"
      tabIndex={0}
      className={`contact-row ${isActive ? 'active' : ''}`}
      onClick={() => onClick(contact.id)}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(contact.id); } }}
      aria-label={`${contact.displayName}${subtitle ? `, ${subtitle}` : ''}`}
      aria-selected={isActive}
      aria-current={isActive ? 'page' : undefined}
    >
      <Avatar contact={contact} size="md" />
      <div className="contact-row-content">
        <div className="contact-row-name">
          <HighlightText text={contact.displayName || contact.fullName} query={searchQuery} />
        </div>
        {subtitle && (
          <div className="contact-row-sub">
            <HighlightText text={subtitle} query={searchQuery} />
          </div>
        )}
      </div>
      {contact.isFavorite && (
        <span style={{ color: '#f59e0b', fontSize: 14, flexShrink: 0 }} aria-label="Favorite">★</span>
      )}
    </div>
  );
}

// ---- Contact List Panel ------------------------------------

interface ContactListPanelProps {
  contacts: Contact[];
  title: string;
  isLoading: boolean;
  emptyIcon?: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  showSearch?: boolean;
  grouped?: boolean;
}

export function ContactListPanel({
  contacts,
  title,
  isLoading,
  emptyIcon = <Users size={40} />,
  emptyTitle = 'No contacts found',
  emptyDescription = 'No contacts match your search.',
  emptyAction,
  showSearch = true,
  grouped = true,
}: ContactListPanelProps) {
  const { id: selectedId } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), APP_CONFIG.searchDebounceMs);
    return () => clearTimeout(timer);
  }, [search]);

  const filtered = useMemo(() => {
    return searchContacts(contacts, debouncedSearch);
  }, [contacts, debouncedSearch]);

  const groups: GroupedContacts[] = useMemo(() => {
    if (!grouped || debouncedSearch) {
      return [{ letter: '', contacts: sortContacts(filtered) }];
    }
    return groupContactsByLetter(filtered);
  }, [filtered, grouped, debouncedSearch]);

  const handleSelect = useCallback((id: string) => {
    navigate(`/contacts/${id}`);
  }, [navigate]);

  return (
    <div className="contact-list-panel">
      {/* Panel header */}
      <div className="panel-header">
        <h2 style={{ fontWeight: 600, fontSize: '0.9375rem', flex: 1 }}>{title}</h2>
        <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
          {contacts.length} {contacts.length === 1 ? 'contact' : 'contacts'}
        </span>
      </div>

      {showSearch && <SearchBar value={search} onChange={setSearch} />}

      {/* List body */}
      <div style={{ flex: 1, overflowY: 'auto' }} role="list" aria-label={`${title} list`}>
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => <SkeletonContactRow key={i} />)
        ) : filtered.length === 0 ? (
          <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} action={emptyAction} />
        ) : (
          groups.map(group => (
            <React.Fragment key={group.letter || '__all__'}>
              {group.letter && <div className="alpha-header" aria-label={`Group ${group.letter}`}>{group.letter}</div>}
              {group.contacts.map(contact => (
                <ContactRow
                  key={contact.id}
                  contact={contact}
                  isActive={contact.id === selectedId}
                  searchQuery={debouncedSearch}
                  onClick={handleSelect}
                />
              ))}
            </React.Fragment>
          ))
        )}
      </div>
    </div>
  );
}
