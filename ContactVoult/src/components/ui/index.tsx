// ============================================================
// ConnectDesk — Reusable UI Components
// ============================================================

import React, { type ReactNode, type ButtonHTMLAttributes, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';
import { useToast } from '@/stores/ToastContext';
import type { Contact } from '@/types';

// ---- Avatar ------------------------------------------------

interface AvatarProps {
  contact: Contact;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

export function Avatar({ contact, size = 'md', className = '' }: AvatarProps) {
  return (
    <div
      className={`avatar avatar-${size} ${className}`}
      style={{ backgroundColor: contact.avatarColor, color: '#fff' }}
      aria-hidden="true"
    >
      {contact.avatarUrl ? (
        <img src={contact.avatarUrl} alt={contact.displayName} />
      ) : (
        contact.avatarInitials
      )}
    </div>
  );
}

// ---- Button ------------------------------------------------

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: boolean;
  loading?: boolean;
  children?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', icon = false, loading = false, children, disabled, className = '', ...props }, ref) => {
    const variantClass = `btn-${variant}`;
    const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';
    const iconClass = icon ? 'btn-icon' : '';

    return (
      <button
        ref={ref}
        className={`btn ${variantClass} ${sizeClass} ${iconClass} ${className}`}
        disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading ? (
          <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        ) : null}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

// ---- Input -------------------------------------------------

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  hint?: string;
  id: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, label, hint, id, className = '', ...props }, ref) => (
    <div className="form-group">
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
          {props.required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={`input-base ${error ? 'input-error' : ''} ${className}`}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        aria-invalid={!!error}
        {...props}
      />
      {hint && !error && <p id={`${id}-hint`} className="form-hint">{hint}</p>}
      {error && (
        <p id={`${id}-error`} className="form-error" role="alert">
          <AlertCircle size={13} aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  )
);
Input.displayName = 'Input';

// ---- Badge -------------------------------------------------

interface BadgeProps {
  variant?: 'primary' | 'success' | 'warning' | 'error';
  children: ReactNode;
}

export function Badge({ variant = 'primary', children }: BadgeProps) {
  return <span className={`badge badge-${variant}`}>{children}</span>;
}

// ---- Skeleton ----------------------------------------------

export function SkeletonContactRow() {
  return (
    <div className="contact-row" style={{ cursor: 'default' }} aria-hidden="true">
      <div className="skeleton" style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div className="skeleton" style={{ height: 14, width: '55%', borderRadius: 4 }} />
        <div className="skeleton" style={{ height: 12, width: '35%', borderRadius: 4 }} />
      </div>
    </div>
  );
}

export function SkeletonDetailPanel() {
  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }} aria-hidden="true">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <div className="skeleton" style={{ width: 88, height: 88, borderRadius: '50%' }} />
        <div className="skeleton" style={{ width: 160, height: 18, borderRadius: 4 }} />
        <div className="skeleton" style={{ width: 120, height: 14, borderRadius: 4 }} />
      </div>
      {[1,2,3].map(i => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="skeleton" style={{ width: 60, height: 12, borderRadius: 4 }} />
          <div className="skeleton" style={{ width: '80%', height: 14, borderRadius: 4 }} />
        </div>
      ))}
    </div>
  );
}

// ---- Empty State -------------------------------------------

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <p className="empty-state-title">{title}</p>
      <p className="empty-state-desc">{description}</p>
      {action}
    </div>
  );
}

// ---- Toast Container ---------------------------------------

const toastIcons = {
  success: <CheckCircle2 size={18} color="var(--color-success-500)" aria-hidden="true" />,
  error:   <AlertCircle  size={18} color="var(--color-error-500)"   aria-hidden="true" />,
  info:    <Info         size={18} color="var(--interactive-primary)" aria-hidden="true" />,
  warning: <AlertTriangle size={18} color="var(--color-warning-500)" aria-hidden="true" />,
} as const;

export function ToastContainer() {
  const { toasts, dismissToast } = useToast();

  return (
    <div className="toast-container" role="region" aria-label="Notifications" aria-live="polite">
      <AnimatePresence initial={false}>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`toast toast-${toast.variant}`}
            role="status"
          >
            {toastIcons[toast.variant]}
            <span style={{ flex: 1, fontSize: '0.875rem' }}>{toast.message}</span>
            <button
              onClick={() => dismissToast(toast.id)}
              className="btn btn-ghost btn-icon btn-sm"
              aria-label="Dismiss notification"
              style={{ flexShrink: 0 }}
            >
              <X size={15} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ---- Switch Toggle -----------------------------------------

interface SwitchProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Switch({ id, checked, onChange, label, disabled }: SwitchProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <label className="switch">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={e => onChange(e.target.checked)}
          disabled={disabled}
          role="switch"
          aria-checked={checked}
        />
        <span className="switch-track" />
      </label>
      {label && (
        <label htmlFor={id} style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
          {label}
        </label>
      )}
    </div>
  );
}

// ---- Section Card ------------------------------------------

export function SectionCard({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      {title && (
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-default)' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {title}
          </h3>
        </div>
      )}
      {children}
    </div>
  );
}

// ---- Stat Block --------------------------------------------

export function StatBlock({ value, label }: { value: number | string; label: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '16px 12px' }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{value}</div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>{label}</div>
    </div>
  );
}

// ---- Dialog / Modal ----------------------------------------

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: number;
}

export function Dialog({ open, onClose, title, children, maxWidth = 440 }: DialogProps) {
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          style={{
            position: 'fixed', inset: 0, background: 'var(--bg-overlay)',
            zIndex: 'var(--z-modal)' as unknown as number,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '16px',
          }}
          onClick={e => { if (e.target === e.currentTarget) onClose(); }}
          aria-modal="true"
          role="dialog"
          aria-labelledby="dialog-title"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-xl)',
              padding: '24px',
              width: '100%',
              maxWidth,
              maxHeight: 'calc(100dvh - 48px)',
              overflowY: 'auto',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 id="dialog-title" style={{ fontSize: '1.0625rem', fontWeight: 600 }}>{title}</h2>
              <button onClick={onClose} className="btn btn-ghost btn-icon btn-sm" aria-label="Close dialog">
                <X size={18} />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ---- Divider -----------------------------------------------
export function Divider() {
  return <hr className="divider" />;
}
