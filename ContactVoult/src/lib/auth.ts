// ============================================================
// ConnectDesk — Auth Library (localStorage-backed, frontend-only)
// ============================================================

import { LOCAL_STORAGE_KEYS } from '@/constants';
import type { User, AuthState } from '@/types';

interface StoredCredential {
  email: string;
  passwordHash: string;
  name: string;
  id: string;
  createdAt: string;
}

// Simple client-side hash using Web Crypto
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'cd_salt_enterprise_2024');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function getCredentials(): StoredCredential[] {
  let creds: StoredCredential[] = [];
  try {
    const raw = localStorage.getItem('cd_credentials');
    if (raw) creds = JSON.parse(raw) as StoredCredential[];
  } catch {
    // ignore
  }
  const mydeenCred: StoredCredential = {
    id: 'usr-mydeen-4262',
    name: 'Mydeen4262',
    email: 'Mydeen4262',
    passwordHash: 'demo',
    createdAt: new Date().toISOString(),
  };

  const idx = creds.findIndex(c => c.name.toLowerCase() === 'mydeen4262' || c.email.toLowerCase() === 'mydeen4262');
  if (idx === -1) {
    creds.unshift(mydeenCred);
  } else {
    creds[idx] = mydeenCred;
  }
  return creds;
}

function saveCredentials(creds: StoredCredential[]): void {
  localStorage.setItem('cd_credentials', JSON.stringify(creds));
}

function saveSession(user: User): void {
  localStorage.setItem(LOCAL_STORAGE_KEYS.auth, JSON.stringify(user));
}

function clearSession(): void {
  localStorage.removeItem(LOCAL_STORAGE_KEYS.auth);
}

export function getSession(): User | null {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.auth);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export async function registerUser(
  name: string,
  email: string,
  password: string
): Promise<{ user: User } | { error: string }> {
  await new Promise(r => setTimeout(r, 600)); // Simulate network
  const creds = getCredentials();
  const normalizedEmail = email.toLowerCase().trim();

  if (creds.some(c => c.email === normalizedEmail)) {
    return { error: 'An account with this email address already exists.' };
  }

  const passwordHash = await hashPassword(password);
  const user: User = {
    id: crypto.randomUUID(),
    email: normalizedEmail,
    name: name.trim(),
    createdAt: new Date().toISOString(),
  };

  creds.push({ email: normalizedEmail, passwordHash, name: name.trim(), id: user.id, createdAt: user.createdAt });
  saveCredentials(creds);
  saveSession(user);
  return { user };
}

export async function loginUser(
  identifier: string,
  password: string
): Promise<{ user: User } | { error: string }> {
  await new Promise(r => setTimeout(r, 400)); // Simulate network
  const creds = getCredentials();
  const normalized = identifier.toLowerCase().trim();

  // Check if it's the requested credentials: Mydeen4262 / Mohamedmydeen@4262
  const isMydeenUser = (
    normalized === 'mydeen4262' ||
    normalized.startsWith('mydeen4262@') ||
    normalized === 'mydeen'
  );

  if (isMydeenUser && password === 'Mohamedmydeen@4262') {
    const cred = creds.find(c => c.name.toLowerCase() === 'mydeen4262' || c.email.toLowerCase() === 'mydeen4262');
    const user: User = {
      id: cred?.id ?? 'usr-mydeen-4262',
      email: cred?.email ?? 'Mydeen4262',
      name: 'Mydeen4262',
      createdAt: cred?.createdAt ?? new Date().toISOString(),
    };
    saveSession(user);
    return { user };
  }

  // Find by email or username
  const cred = creds.find(c => c.email.toLowerCase() === normalized || c.name.toLowerCase() === normalized);

  if (!cred) {
    return { error: 'Unable to sign in. Please check your username/email and password.' };
  }

  const passwordHash = await hashPassword(password);
  if (cred.passwordHash !== passwordHash) {
    return { error: 'Unable to sign in. Please check your username/email and password.' };
  }

  const user: User = { id: cred.id, email: cred.email, name: cred.name, createdAt: cred.createdAt };
  saveSession(user);
  return { user };
}

export function logoutUser(): void {
  clearSession();
}

export async function updateUserName(userId: string, name: string): Promise<void> {
  const creds = getCredentials();
  const idx = creds.findIndex(c => c.id === userId);
  if (idx !== -1) {
    creds[idx]!.name = name.trim();
    saveCredentials(creds);
  }
  const session = getSession();
  if (session && session.id === userId) {
    saveSession({ ...session, name: name.trim() });
  }
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<{ success: true } | { error: string }> {
  await new Promise(r => setTimeout(r, 400));
  const creds = getCredentials();
  const idx = creds.findIndex(c => c.id === userId);
  if (idx === -1) return { error: 'Account not found.' };

  const currentHash = await hashPassword(currentPassword);
  if (creds[idx]!.passwordHash !== currentHash) {
    return { error: 'Current password is incorrect.' };
  }

  creds[idx]!.passwordHash = await hashPassword(newPassword);
  saveCredentials(creds);
  return { success: true };
}

export function deleteAccount(userId: string): void {
  const creds = getCredentials().filter(c => c.id !== userId);
  saveCredentials(creds);
  clearSession();
  localStorage.removeItem(`${LOCAL_STORAGE_KEYS.contacts}_${userId}`);
}

export function getInitialAuthState(): AuthState {
  const user = getSession();
  return {
    status: user ? 'authenticated' : 'unauthenticated',
    user,
  };
}
