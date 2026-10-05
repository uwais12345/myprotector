// ============================================================
// ConnectDesk — Main Application Pages
// ============================================================

import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Users, Star, AlertTriangle, Upload, PhoneCall
} from 'lucide-react';
import { useContacts } from '@/stores/ContactsContext';
import { ContactListPanel } from '@/components/contacts/ContactList';
import { ContactDetail } from '@/components/contacts/ContactDetail';
import { ImportPage } from '@/components/import/ImportPage';
import { SettingsPage } from '@/components/settings/SettingsPage';
import { AppLayout, MobileHeader } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui';
import { EMERGENCY_NUMBERS, ROUTES } from '@/constants';
import { useMediaQuery } from '@/hooks/useMediaQuery';

// ---- Mobile/Desktop layout switch wrapper ------------------
function useIsMobile() {
  return useMediaQuery('(max-width: 1023px)');
}

// ---- Three-panel layout helper for desktop -----------------
interface ThreePanelProps {
  list: React.ReactNode;
  detail: React.ReactNode;
}

function ThreePanelLayout({ list, detail }: ThreePanelProps) {
  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minWidth: 0 }}>
      {/* List panel (middle) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {list}
      </div>
      {/* Detail panel (right) */}
      <div style={{ width: 340, flexShrink: 0, borderLeft: '1px solid var(--border-default)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {detail}
      </div>
    </div>
  );
}

// ============================================================
// Contacts Page
// ============================================================

export function ContactsPage() {
  const { contacts, isLoading } = useContacts();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();

  // On mobile, if a contact is selected, show the detail view full-screen
  if (isMobile && id) {
    return (
      <AppLayout>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', paddingBottom: 'var(--bottom-nav-height)' }}>
          <ContactDetail isMobileFull />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', paddingBottom: isMobile ? 'var(--bottom-nav-height)' : 0 }}>
        <MobileHeader
          title="ConnectDesk"
          rightAction={
            <Button variant="ghost" icon size="sm" onClick={() => navigate(ROUTES.importContacts)} aria-label="Import contacts">
              <Upload size={18} />
            </Button>
          }
        />

        {isMobile ? (
          <ContactListPanel
            contacts={contacts}
            title="All Contacts"
            isLoading={isLoading}
            emptyIcon={<Users size={40} />}
            emptyTitle="No contacts yet"
            emptyDescription="You haven't imported any contacts yet. Import a .vcf file to get started."
            emptyAction={
              <Button variant="primary" onClick={() => navigate(ROUTES.importContacts)}>
                <Upload size={16} />Import contacts
              </Button>
            }
          />
        ) : (
          <ThreePanelLayout
            list={
              <ContactListPanel
                contacts={contacts}
                title="All Contacts"
                isLoading={isLoading}
                emptyIcon={<Users size={40} />}
                emptyTitle="No contacts yet"
                emptyDescription="You haven't imported any contacts yet."
                emptyAction={
                  <Button variant="primary" onClick={() => navigate(ROUTES.importContacts)}>
                    <Upload size={16} />Import contacts
                  </Button>
                }
              />
            }
            detail={<ContactDetail />}
          />
        )}
      </div>
    </AppLayout>
  );
}

// ============================================================
// Favorites Page
// ============================================================

export function FavoritesPage() {
  const { favorites, isLoading } = useContacts();
  const isMobile = useIsMobile();
  const { id } = useParams<{ id?: string }>();

  if (isMobile && id) {
    return (
      <AppLayout>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', paddingBottom: 'var(--bottom-nav-height)' }}>
          <ContactDetail isMobileFull />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', paddingBottom: isMobile ? 'var(--bottom-nav-height)' : 0 }}>
        <MobileHeader title="Favorites" />

        {isMobile ? (
          <ContactListPanel
            contacts={favorites}
            title="Favorites"
            isLoading={isLoading}
            emptyIcon={<Star size={40} />}
            emptyTitle="No favorite contacts"
            emptyDescription="Your favorite contacts will appear here. Star a contact to add them to favorites."
          />
        ) : (
          <ThreePanelLayout
            list={
              <ContactListPanel
                contacts={favorites}
                title="Favorites"
                isLoading={isLoading}
                emptyIcon={<Star size={40} />}
                emptyTitle="No favorite contacts"
                emptyDescription="Your favorite contacts will appear here. Open a contact and star it to add to favorites."
              />
            }
            detail={<ContactDetail />}
          />
        )}
      </div>
    </AppLayout>
  );
}

// ============================================================
// Emergency Contacts Page
// ============================================================

export function EmergencyPage() {
  const { emergencyContacts, isLoading } = useContacts();
  const isMobile = useIsMobile();
  const { id } = useParams<{ id?: string }>();

  if (isMobile && id) {
    return (
      <AppLayout>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', paddingBottom: 'var(--bottom-nav-height)' }}>
          <ContactDetail isMobileFull />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', paddingBottom: isMobile ? 'var(--bottom-nav-height)' : 0 }}>
        <MobileHeader title="Emergency" />

        {isMobile ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <EmergencyBanner />
            <EmergencyNumbersBar />
            <ContactListPanel
              contacts={emergencyContacts}
              title="Emergency Contacts"
              isLoading={isLoading}
              showSearch={false}
              grouped={false}
              emptyIcon={<AlertTriangle size={40} />}
              emptyTitle="No emergency contacts"
              emptyDescription="Add trusted contacts for quick access during emergencies. Open a contact and mark them as emergency."
            />
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <EmergencyBanner />
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <EmergencyNumbersBar />
                <ContactListPanel
                  contacts={emergencyContacts}
                  title="Emergency Contacts"
                  isLoading={isLoading}
                  showSearch={false}
                  grouped={false}
                  emptyIcon={<AlertTriangle size={40} />}
                  emptyTitle="No emergency contacts"
                  emptyDescription="Open a contact and mark them as emergency to see them here."
                />
              </div>
              <div style={{ width: 340, flexShrink: 0, borderLeft: '1px solid var(--border-default)' }}>
                <ContactDetail />
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function EmergencyBanner() {
  return (
    <div className="emergency-banner" role="banner">
      <AlertTriangle size={16} style={{ flexShrink: 0 }} />
      <span>Emergency contacts — for urgent situations only</span>
    </div>
  );
}

function EmergencyNumbersBar() {
  return (
    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-default)', background: 'var(--bg-surface)' }}>
      <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
        Public Emergency Services
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {EMERGENCY_NUMBERS.map(num => (
          <a
            key={num.number}
            href={`tel:${num.number}`}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 12px',
              background: 'var(--color-error-50)', border: '1px solid var(--color-error-100)',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-error-700)',
              textDecoration: 'none', flexShrink: 0,
              transition: 'background 0.15s',
            }}
            aria-label={`Call ${num.name} at ${num.number}`}
          >
            <PhoneCall size={13} />
            {num.number} — {num.name}
          </a>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Import Page Wrapper
// ============================================================

export function ImportPageWrapper() {
  const isMobile = useIsMobile();

  return (
    <AppLayout>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', paddingBottom: isMobile ? 'var(--bottom-nav-height)' : 0 }}>
        <MobileHeader title="Import Contacts" />
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <ImportPage />
        </div>
      </div>
    </AppLayout>
  );
}

// ============================================================
// Settings Page Wrapper
// ============================================================

export function SettingsPageWrapper() {
  const isMobile = useIsMobile();

  return (
    <AppLayout>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', paddingBottom: isMobile ? 'var(--bottom-nav-height)' : 0 }}>
        <MobileHeader title="Settings" />
        <SettingsPage />
      </div>
    </AppLayout>
  );
}
