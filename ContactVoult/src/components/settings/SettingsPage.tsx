// ============================================================
// ConnectDesk — Settings Page
// ============================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Shield, Database, LogOut, Trash2,
  ChevronRight, Moon, Sun, Monitor, PhoneCall,
  Eye, EyeOff, AlertCircle
} from 'lucide-react';
import { useAuth } from '@/stores/AuthContext';
import { useContacts } from '@/stores/ContactsContext';
import { useTheme } from '@/stores/ThemeContext';
import { useToast } from '@/stores/ToastContext';
import { Button, Dialog, StatBlock, SectionCard } from '@/components/ui';
import { updateUserName, changePassword, deleteAccount } from '@/lib/auth';
import { ROUTES, APP_CONFIG } from '@/constants';
import type { ThemeMode } from '@/types';

// ---- Theme selector ----------------------------------------
function ThemeOption({ value, label, icon, current, onSelect }: {
  value: ThemeMode; label: string; icon: React.ReactNode;
  current: ThemeMode; onSelect: (t: ThemeMode) => void;
}) {
  const isActive = current === value;
  return (
    <button
      onClick={() => onSelect(value)}
      style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        padding: '14px 8px',
        border: `2px solid ${isActive ? 'var(--interactive-primary)' : 'var(--border-default)'}`,
        borderRadius: 'var(--radius-lg)',
        background: isActive ? 'var(--color-primary-50)' : 'var(--bg-surface-2)',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      }}
      aria-pressed={isActive}
      aria-label={`Set theme to ${label}`}
    >
      <div style={{ color: isActive ? 'var(--interactive-primary)' : 'var(--text-tertiary)' }}>{icon}</div>
      <span style={{ fontSize: '0.8125rem', fontWeight: isActive ? 600 : 400, color: isActive ? 'var(--interactive-primary)' : 'var(--text-secondary)' }}>{label}</span>
    </button>
  );
}

// ---- Edit Name Dialog --------------------------------------
function EditNameDialog({ open, onClose, currentName, userId, onSaved }: {
  open: boolean; onClose: () => void;
  currentName: string; userId: string;
  onSaved: (name: string) => void;
}) {
  const [name, setName] = useState(currentName);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!name.trim() || name.trim().length < 2) { setError('Name must be at least 2 characters.'); return; }
    setLoading(true);
    await updateUserName(userId, name.trim());
    onSaved(name.trim());
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} title="Edit profile name">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="form-group">
          <label htmlFor="edit-name" className="form-label">Display name</label>
          <input id="edit-name" type="text" value={name} onChange={e => { setName(e.target.value); setError(''); }} className={`input-base ${error ? 'input-error' : ''}`} autoFocus />
          {error && <p className="form-error"><AlertCircle size={13} />{error}</p>}
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" loading={loading} onClick={handleSave}>Save changes</Button>
        </div>
      </div>
    </Dialog>
  );
}

// ---- Change Password Dialog ---------------------------------
function ChangePasswordDialog({ open, onClose, userId }: { open: boolean; onClose: () => void; userId: string }) {
  const { showToast } = useToast();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);

  const handleSubmit = async () => {
    if (!current) { setError('Please enter your current password.'); return; }
    if (next.length < 8) { setError('New password must be at least 8 characters.'); return; }
    if (next !== confirm) { setError('Passwords do not match.'); return; }

    setLoading(true);
    setError('');
    const result = await changePassword(userId, current, next);
    setLoading(false);

    if ('error' in result) { setError(result.error); return; }
    showToast('Password changed successfully.', 'success');
    onClose();
    setCurrent(''); setNext(''); setConfirm('');
  };

  return (
    <Dialog open={open} onClose={onClose} title="Change password">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {error && (
          <div style={{ display: 'flex', gap: 8, padding: '10px 12px', background: 'var(--color-error-50)', border: '1px solid var(--color-error-100)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', color: 'var(--color-error-700)' }}>
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            {error}
          </div>
        )}
        {[
          { id: 'pw-current', label: 'Current password', value: current, onChange: setCurrent, show: showCurrent, toggle: () => setShowCurrent(v => !v) },
          { id: 'pw-new',     label: 'New password',     value: next,    onChange: setNext,    show: showNext,    toggle: () => setShowNext(v => !v) },
          { id: 'pw-confirm', label: 'Confirm new password', value: confirm, onChange: setConfirm, show: showNext, toggle: () => {} },
        ].map(field => (
          <div key={field.id} className="form-group">
            <label htmlFor={field.id} className="form-label">{field.label}</label>
            <div style={{ position: 'relative' }}>
              <input id={field.id} type={field.show ? 'text' : 'password'} value={field.value} onChange={e => field.onChange(e.target.value)} className="input-base" style={{ paddingRight: 42 }} />
              {field.id !== 'pw-confirm' && (
                <button type="button" onClick={field.toggle} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: 2 }}>
                  {field.show ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              )}
            </div>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" loading={loading} onClick={handleSubmit}>Change password</Button>
        </div>
      </div>
    </Dialog>
  );
}

// ---- Delete Account Dialog ----------------------------------
function DeleteAccountDialog({ open, onClose, onConfirm }: { open: boolean; onClose: () => void; onConfirm: () => void }) {
  const [confirmed, setConfirmed] = useState(false);

  return (
    <Dialog open={open} onClose={onClose} title="Delete account">
      <div style={{ marginBottom: 16, padding: '12px 14px', background: 'var(--color-error-50)', border: '1px solid var(--color-error-100)', borderRadius: 'var(--radius-md)' }}>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-error-700)', fontWeight: 500 }}>
          ⚠ This will permanently delete your account and all contacts. This cannot be undone.
        </p>
      </div>
      <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 20, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
        <input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} style={{ accentColor: 'var(--color-error-600)', width: 16, height: 16 }} />
        I understand this action is irreversible
      </label>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="danger" disabled={!confirmed} onClick={onConfirm}>Delete my account</Button>
      </div>
    </Dialog>
  );
}

// ---- Main Settings Page ------------------------------------
export function SettingsPage() {
  const { auth, logout, setUser } = useAuth();
  const { contacts, favorites, emergencyContacts, clearAll } = useContacts();
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [editNameOpen, setEditNameOpen] = useState(false);
  const [changePwOpen, setChangePwOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [clearDataOpen, setClearDataOpen] = useState(false);

  const user = auth.user!;

  const handleLogout = () => {
    logout();
    navigate(ROUTES.login);
  };

  const handleDeleteAccount = () => {
    if (!user) return;
    deleteAccount(user.id);
    logout();
    navigate(ROUTES.login);
  };

  const handleClearData = () => {
    clearAll();
    showToast('All contacts cleared.', 'info');
    setClearDataOpen(false);
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <h1 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Settings</h1>

        {/* Contact stats */}
        <SectionCard title="Contact Directory">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderTop: '1px solid var(--border-default)' }}>
            <div style={{ borderRight: '1px solid var(--border-default)' }}><StatBlock value={contacts.length} label="Contacts" /></div>
            <div style={{ borderRight: '1px solid var(--border-default)' }}><StatBlock value={favorites.length} label="Favorites" /></div>
            <StatBlock value={emergencyContacts.length} label="Emergency" />
          </div>
        </SectionCard>

        {/* Profile */}
        <SectionCard title="Profile">
          <div className="settings-list-item" onClick={() => setEditNameOpen(true)} role="button" tabIndex={0} onKeyDown={e => { if (e.key === 'Enter') setEditNameOpen(true); }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--interactive-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <User size={17} color="white" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.9375rem', fontWeight: 500 }}>{user.name}</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
            </div>
            <ChevronRight size={16} color="var(--text-tertiary)" />
          </div>
        </SectionCard>

        {/* Security */}
        <SectionCard title="Security">
          <div className="settings-list-item" onClick={() => setChangePwOpen(true)} role="button" tabIndex={0} onKeyDown={e => { if (e.key === 'Enter') setChangePwOpen(true); }}>
            <Shield size={18} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: '0.9375rem' }}>Change password</span>
            <ChevronRight size={16} color="var(--text-tertiary)" />
          </div>
        </SectionCard>

        {/* Appearance */}
        <SectionCard title="Appearance">
          <div style={{ padding: '16px 20px' }}>
            <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: 12 }}>Theme</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <ThemeOption value="light"  label="Light"  icon={<Sun size={20} />}     current={theme} onSelect={setTheme} />
              <ThemeOption value="dark"   label="Dark"   icon={<Moon size={20} />}    current={theme} onSelect={setTheme} />
              <ThemeOption value="system" label="System" icon={<Monitor size={20} />} current={theme} onSelect={setTheme} />
            </div>
          </div>
        </SectionCard>

        {/* Data management */}
        <SectionCard title="Data Management">
          <div
            className="settings-list-item"
            onClick={() => navigate(ROUTES.importContacts)}
            role="button" tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter') navigate(ROUTES.importContacts); }}
          >
            <Database size={18} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: '0.9375rem' }}>Import contacts (.vcf)</span>
            <ChevronRight size={16} color="var(--text-tertiary)" />
          </div>
          <div
            className="settings-list-item"
            onClick={() => setClearDataOpen(true)}
            role="button" tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter') setClearDataOpen(true); }}
          >
            <Trash2 size={18} color="var(--color-error-500)" style={{ flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: '0.9375rem', color: 'var(--color-error-600)' }}>Clear all contacts</span>
            <ChevronRight size={16} color="var(--text-tertiary)" />
          </div>
        </SectionCard>

        {/* Account actions */}
        <SectionCard title="Account">
          <div className="settings-list-item" onClick={handleLogout} role="button" tabIndex={0} onKeyDown={e => { if (e.key === 'Enter') handleLogout(); }}>
            <LogOut size={18} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: '0.9375rem' }}>Sign out</span>
          </div>
          <div className="settings-list-item" onClick={() => setDeleteAccountOpen(true)} role="button" tabIndex={0} onKeyDown={e => { if (e.key === 'Enter') setDeleteAccountOpen(true); }}>
            <Trash2 size={18} color="var(--color-error-500)" style={{ flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: '0.9375rem', color: 'var(--color-error-600)' }}>Delete account</span>
            <ChevronRight size={16} color="var(--text-tertiary)" />
          </div>
        </SectionCard>

        {/* App info */}
        <div style={{ textAlign: 'center', padding: '8px 0 24px', color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 4 }}>
            <div style={{ width: 20, height: 20, borderRadius: 4, background: 'var(--interactive-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PhoneCall size={11} color="white" />
            </div>
            <span style={{ fontWeight: 600 }}>{APP_CONFIG.name}</span>
          </div>
          Version {APP_CONFIG.version} · Enterprise Contact Access
        </div>
      </div>

      {/* Dialogs */}
      <EditNameDialog
        open={editNameOpen}
        onClose={() => setEditNameOpen(false)}
        currentName={user.name}
        userId={user.id}
        onSaved={name => setUser({ ...user, name })}
      />
      <ChangePasswordDialog open={changePwOpen} onClose={() => setChangePwOpen(false)} userId={user.id} />
      <DeleteAccountDialog open={deleteAccountOpen} onClose={() => setDeleteAccountOpen(false)} onConfirm={handleDeleteAccount} />

      {/* Clear data dialog */}
      <Dialog open={clearDataOpen} onClose={() => setClearDataOpen(false)} title="Clear all contacts">
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
          This will permanently remove all <strong style={{ color: 'var(--text-primary)' }}>{contacts.length}</strong> contacts from your account. This action cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={() => setClearDataOpen(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleClearData}>Clear all contacts</Button>
        </div>
      </Dialog>
    </div>
  );
}
