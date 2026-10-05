// ============================================================
// ConnectDesk — Contact Detail Panel
// ============================================================

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Mail, MapPin, Building2, StickyNote,
  Star, AlertTriangle, ChevronLeft, Trash2, MessageSquare,
  PhoneCall, Phone
} from 'lucide-react';
import { useContacts } from '@/stores/ContactsContext';
import { useToast } from '@/stores/ToastContext';
import { Avatar, Button, Dialog, SkeletonDetailPanel, EmptyState } from '@/components/ui';
import type { PhoneNumber } from '@/types';
import { ROUTES } from '@/constants';

// ---- Phone type label --------------------------------------
function phoneTypeLabel(type: PhoneNumber['type']): string {
  return { mobile: 'Mobile', work: 'Work', home: 'Home', fax: 'Fax', other: 'Other' }[type];
}

// ---- Phone row ---------------------------------------------
interface PhoneRowProps { phone: PhoneNumber; isEmergency: boolean }
function PhoneRow({ phone, isEmergency }: PhoneRowProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <a
          href={`tel:${phone.value}`}
          style={{ display: 'block', fontSize: '0.9375rem', color: 'var(--text-primary)', fontWeight: 500, textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          onClick={e => e.stopPropagation()}
        >
          {phone.value}
        </a>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'capitalize' }}>{phoneTypeLabel(phone.type)}</span>
      </div>
      <a
        href={`tel:${phone.value}`}
        className={`action-btn-item ${isEmergency ? 'action-btn-emergency-call' : 'action-btn-call'}`}
        style={{ minHeight: 'unset', flexDirection: 'row', gap: 5, padding: '7px 12px', fontSize: '0.8125rem', flexShrink: 0 }}
        aria-label={`Call ${phone.value}`}
      >
        <PhoneCall size={14} />
        Call
      </a>
    </div>
  );
}

// ---- Detail field ------------------------------------------
interface FieldProps { icon: React.ReactNode; label: string; children: React.ReactNode }
function DetailField({ icon, label, children }: FieldProps) {
  return (
    <div style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>
      <div style={{ color: 'var(--text-tertiary)', marginTop: 2, flexShrink: 0, width: 18 }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 500, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
        {children}
      </div>
    </div>
  );
}

// ---- Main Detail Panel -------------------------------------
interface ContactDetailProps {
  isMobileFull?: boolean;
}

export function ContactDetail({ isMobileFull = false }: ContactDetailProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { contacts, isLoading, toggleFavoriteItem, toggleEmergencyItem, deleteContactItem } = useContacts();
  const { showToast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const contact = id ? contacts.find(c => c.id === id) : null;

  if (isLoading) {
    return (
      <div className="detail-panel" style={isMobileFull ? { width: '100%' } : {}}>
        <SkeletonDetailPanel />
      </div>
    );
  }

  if (!id) {
    return (
      <div className="detail-panel" style={isMobileFull ? { width: '100%' } : {}}>
        <EmptyState
          icon={<PhoneCall size={40} />}
          title="Select a contact"
          description="Choose a contact from the list to view their details."
        />
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="detail-panel" style={isMobileFull ? { width: '100%' } : {}}>
        <EmptyState
          icon={<PhoneCall size={40} />}
          title="Contact not found"
          description="This contact may have been removed."
        />
      </div>
    );
  }

  const handleToggleFavorite = () => {
    toggleFavoriteItem(contact.id);
    showToast(contact.isFavorite ? 'Removed from favorites' : 'Added to favorites', 'success');
  };

  const handleToggleEmergency = () => {
    toggleEmergencyItem(contact.id);
    showToast(contact.isEmergency ? 'Removed from emergency contacts' : 'Added to emergency contacts', 'success');
  };

  const handleDelete = () => {
    deleteContactItem(contact.id);
    showToast('Contact deleted', 'info');
    setDeleteDialogOpen(false);
    if (isMobileFull) {
      navigate(-1);
    } else {
      navigate(ROUTES.contacts, { replace: true });
    }
  };

  const primaryEmail = contact.emails.find(e => e.isPrimary) ?? contact.emails[0];

  return (
    <>
      <div
        className="detail-panel"
        style={{ width: isMobileFull ? '100%' : undefined }}
      >
        {/* Mobile back button */}
        {isMobileFull && (
          <div className="panel-header">
            <button onClick={() => navigate(-1)} className="btn btn-ghost btn-icon btn-sm" aria-label="Go back">
              <ChevronLeft size={20} />
            </button>
            <span style={{ flex: 1, fontWeight: 600, fontSize: '0.9375rem' }}>Contact Details</span>
            <button onClick={() => setDeleteDialogOpen(true)} className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--color-error-600)' }} aria-label="Delete contact">
              <Trash2 size={17} />
            </button>
          </div>
        )}

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {/* Avatar + Name Header */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '28px 20px 20px',
            borderBottom: '1px solid var(--border-default)',
            textAlign: 'center',
          }}>
            <Avatar contact={contact} size="2xl" />
            <h1 style={{ marginTop: 14, fontSize: '1.125rem', fontWeight: 700, lineHeight: 1.3 }}>
              {contact.displayName || contact.fullName}
            </h1>
            {contact.jobTitle && (
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 3 }}>{contact.jobTitle}</p>
            )}
            {contact.organization && (
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', marginTop: 2 }}>{contact.organization}</p>
            )}

            {/* Status badges */}
            <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
              {contact.isFavorite && (
                <span className="badge badge-warning">★ Favorite</span>
              )}
              {contact.isEmergency && (
                <span className="badge badge-error">⚠ Emergency</span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="action-btn-grid">
            {contact.phones.length > 0 && (
              <a href={`tel:${contact.phones[0]!.value}`} className={`action-btn-item ${contact.isEmergency ? 'action-btn-emergency-call' : 'action-btn-call'}`} aria-label={`Call ${contact.displayName}`}>
                <Phone size={22} />
                Call
              </a>
            )}
            {contact.phones.length > 0 && (
              <a href={`sms:${contact.phones[0]!.value}`} className="action-btn-item" aria-label={`Message ${contact.displayName}`}>
                <MessageSquare size={22} />
                Message
              </a>
            )}
            {primaryEmail && (
              <a href={`mailto:${primaryEmail.value}`} className="action-btn-item" aria-label={`Email ${contact.displayName}`}>
                <Mail size={22} />
                Email
              </a>
            )}
            <button
              onClick={handleToggleFavorite}
              className={`action-btn-item ${contact.isFavorite ? 'action-btn-call' : ''}`}
              aria-label={contact.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              aria-pressed={contact.isFavorite}
            >
              <Star size={22} fill={contact.isFavorite ? 'currentColor' : 'none'} />
              Favorite
            </button>
            <button
              onClick={handleToggleEmergency}
              className={`action-btn-item ${contact.isEmergency ? 'action-btn-emergency-call' : ''}`}
              aria-label={contact.isEmergency ? 'Remove from emergency' : 'Mark as emergency'}
              aria-pressed={contact.isEmergency}
            >
              <AlertTriangle size={22} />
              Emergency
            </button>
          </div>

          {/* Contact fields */}
          <div style={{ padding: '0 20px 20px' }}>

            {/* Phone numbers */}
            {contact.phones.length > 0 && (
              <DetailField icon={<Phone size={16} />} label="Phone">
                {contact.phones.map((phone, i) => (
                  <PhoneRow key={i} phone={phone} isEmergency={contact.isEmergency} />
                ))}
              </DetailField>
            )}

            {/* Emails */}
            {contact.emails.length > 0 && (
              <DetailField icon={<Mail size={16} />} label="Email">
                {contact.emails.map((email, i) => (
                  <div key={i} style={{ padding: '4px 0' }}>
                    <a href={`mailto:${email.value}`} style={{ fontSize: '0.9375rem', color: 'var(--text-link)', wordBreak: 'break-all' }}>
                      {email.value}
                    </a>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'capitalize', marginTop: 1 }}>{email.type}</div>
                  </div>
                ))}
              </DetailField>
            )}

            {/* Organization */}
            {contact.organization && (
              <DetailField icon={<Building2 size={16} />} label="Organization">
                <span style={{ fontSize: '0.9375rem', color: 'var(--text-primary)' }}>{contact.organization}</span>
                {contact.jobTitle && (
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 2 }}>{contact.jobTitle}</div>
                )}
              </DetailField>
            )}

            {/* Address */}
            {contact.addresses.length > 0 && contact.addresses.map((addr, i) => (
              <DetailField key={i} icon={<MapPin size={16} />} label={`Address (${addr.type})`}>
                <address style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', fontStyle: 'normal', lineHeight: 1.5 }}>
                  {[addr.street, addr.city, addr.state, addr.postalCode, addr.country].filter(Boolean).join(', ')}
                </address>
              </DetailField>
            ))}

            {/* Notes */}
            {contact.notes && (
              <DetailField icon={<StickyNote size={16} />} label="Notes">
                <p style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{contact.notes}</p>
              </DetailField>
            )}
          </div>

          {/* Desktop delete button */}
          {!isMobileFull && (
            <div style={{ padding: '0 20px 20px' }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeleteDialogOpen(true)}
                style={{ color: 'var(--color-error-600)', width: '100%' }}
              >
                <Trash2 size={15} />
                Delete contact
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} title="Delete contact">
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
          Are you sure you want to delete <strong style={{ color: 'var(--text-primary)' }}>{contact.displayName || contact.fullName}</strong>? This action cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete contact</Button>
        </div>
      </Dialog>
    </>
  );
}
