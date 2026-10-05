// ============================================================
// ConnectDesk — Application Layout (Sidebar + Mobile Nav)
// ============================================================

import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Star, AlertTriangle, Upload, Settings,
  LogOut, Menu, X, PhoneCall
} from 'lucide-react';
import { useAuth } from '@/stores/AuthContext';
import { useContacts } from '@/stores/ContactsContext';
import { APP_CONFIG, ROUTES } from '@/constants';

// ---- Nav items definition ----------------------------------

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  countKey?: 'total' | 'favorites' | 'emergency';
}

const NAV_ITEMS: NavItem[] = [
  { to: ROUTES.contacts,       label: 'Contacts',  icon: <Users size={18} />,         countKey: 'total' },
  { to: ROUTES.favorites,      label: 'Favorites', icon: <Star size={18} />,          countKey: 'favorites' },
  { to: ROUTES.emergency,      label: 'Emergency', icon: <AlertTriangle size={18} />, countKey: 'emergency' },
  { to: ROUTES.importContacts, label: 'Import',    icon: <Upload size={18} /> },
  { to: ROUTES.settings,       label: 'Settings',  icon: <Settings size={18} /> },
];

const MOBILE_NAV: NavItem[] = [
  { to: ROUTES.contacts,  label: 'Contacts',  icon: <Users size={22} /> },
  { to: ROUTES.favorites, label: 'Favorites', icon: <Star size={22} /> },
  { to: ROUTES.emergency, label: 'Emergency', icon: <AlertTriangle size={22} /> },
  { to: ROUTES.settings,  label: 'Settings',  icon: <Settings size={22} /> },
];

// ---- Sidebar -----------------------------------------------

function SidebarNav() {
  const { auth, logout } = useAuth();
  const { contacts, favorites, emergencyContacts } = useContacts();
  const navigate = useNavigate();

  const counts = {
    total:     contacts.length,
    favorites: favorites.length,
    emergency: emergencyContacts.length,
  };

  const user = auth.user;

  const handleLogout = () => {
    logout();
    navigate(ROUTES.login);
  };

  return (
    <nav className="sidebar" aria-label="Main navigation">
      {/* Brand */}
      <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--border-default)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 'var(--radius-md)',
            background: 'var(--interactive-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0
          }}>
            <PhoneCall size={17} color="white" />
          </div>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            {APP_CONFIG.name}
          </span>
        </div>
      </div>

      {/* Nav links */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === ROUTES.contacts}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            aria-current={undefined}
          >
            <span className="nav-item-icon">{item.icon}</span>
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.countKey !== undefined && counts[item.countKey] > 0 && (
              <span className="nav-count">{counts[item.countKey]}</span>
            )}
          </NavLink>
        ))}
      </div>

      {/* User footer */}
      {user && (
        <div style={{ borderTop: '1px solid var(--border-default)', padding: '12px 8px 16px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 'var(--radius-md)' }}>
            <div className="avatar avatar-sm" style={{ background: 'var(--interactive-primary)', color: '#fff', fontSize: '0.75rem' }}>
              {user.name.slice(0,2).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
            </div>
            <button onClick={handleLogout} className="btn btn-ghost btn-icon btn-sm" aria-label="Sign out" title="Sign out">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

// ---- Layout Context ----------------------------------------
const LayoutContext = React.createContext<{ openDrawer: () => void }>({ openDrawer: () => {} });

// ---- Mobile Header -----------------------------------------

interface MobileHeaderProps {
  title: string;
  onMenuOpen?: () => void;
  rightAction?: React.ReactNode;
}

export function MobileHeader({ title, onMenuOpen, rightAction }: MobileHeaderProps) {
  const layout = React.useContext(LayoutContext);
  const handleOpen = onMenuOpen || layout.openDrawer;

  return (
    <div className="mobile-header">
      <button onClick={handleOpen} className="btn btn-ghost btn-icon btn-sm" aria-label="Open menu">
        <Menu size={20} />
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
        <div style={{ width: 24, height: 24, borderRadius: 4, background: 'var(--interactive-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <PhoneCall size={13} color="white" />
        </div>
        <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {title}
        </span>
      </div>
      {rightAction}
    </div>
  );
}

// ---- Mobile Bottom Nav -------------------------------------

function BottomNav() {
  const location = useLocation();

  return (
    <nav className="bottom-nav" aria-label="Bottom navigation">
      {MOBILE_NAV.map(item => {
        const isActive = item.to === ROUTES.contacts
          ? location.pathname === ROUTES.contacts || location.pathname.startsWith('/contacts/') && !MOBILE_NAV.slice(1).some(n => location.pathname.startsWith(n.to))
          : location.pathname.startsWith(item.to);

        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            aria-label={item.label}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

// ---- Mobile Drawer -----------------------------------------

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
}

function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  const { auth, logout } = useAuth();
  const { contacts, favorites, emergencyContacts } = useContacts();
  const navigate = useNavigate();

  const counts = { total: contacts.length, favorites: favorites.length, emergency: emergencyContacts.length };
  const user = auth.user;

  const handleLogout = () => {
    logout();
    navigate(ROUTES.login);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'var(--bg-overlay)', zIndex: 90 }}
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.22, ease: 'easeOut' }}
            style={{
              position: 'fixed', left: 0, top: 0, bottom: 0,
              width: 280, background: 'var(--bg-surface)',
              borderRight: '1px solid var(--border-default)',
              zIndex: 95, display: 'flex', flexDirection: 'column',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderBottom: '1px solid var(--border-default)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--interactive-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PhoneCall size={14} color="white" />
                </div>
                <span style={{ fontWeight: 700, fontSize: '1rem' }}>{APP_CONFIG.name}</span>
              </div>
              <button onClick={onClose} className="btn btn-ghost btn-icon btn-sm" aria-label="Close menu">
                <X size={18} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
              {NAV_ITEMS.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === ROUTES.contacts}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <span className="nav-item-icon">{item.icon}</span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.countKey !== undefined && counts[item.countKey] > 0 && (
                    <span className="nav-count">{counts[item.countKey]}</span>
                  )}
                </NavLink>
              ))}
            </div>

            {user && (
              <div style={{ borderTop: '1px solid var(--border-default)', padding: '12px 8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px' }}>
                  <div className="avatar avatar-sm" style={{ background: 'var(--interactive-primary)', color: '#fff', fontSize: '0.75rem' }}>
                    {user.name.slice(0,2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
                  </div>
                  <button onClick={handleLogout} className="btn btn-ghost btn-icon btn-sm" aria-label="Sign out">
                    <LogOut size={16} />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ---- Main Layout Shell -------------------------------------

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <LayoutContext.Provider value={{ openDrawer: () => setDrawerOpen(true) }}>
      <div className="app-layout">
        <SidebarNav />
        <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

        {/* Main content area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          {children}
        </div>

        <BottomNav />
      </div>
    </LayoutContext.Provider>
  );
}

// Re-export for convenience
export { MobileDrawer };
