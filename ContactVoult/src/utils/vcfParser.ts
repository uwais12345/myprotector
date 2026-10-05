// ============================================================
// ConnectDesk — VCF Parser Utility
// Parses vCard 2.1, 3.0, and 4.0 files
// ============================================================

import type { Contact, PhoneNumber, EmailAddress, Address } from '@/types';
import { AVATAR_COLORS } from '@/constants';

// ---- Helpers -----------------------------------------------

function generateId(): string {
  return crypto.randomUUID();
}

function getAvatarColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]!;
}

function decodeQuotedPrintable(str: string): string {
  return str.replace(/=([A-Fa-f0-9]{2})/g, (_, hex) =>
    String.fromCharCode(parseInt(hex, 16))
  );
}

function decodeValue(raw: string, encoding?: string): string {
  if (encoding?.toUpperCase() === 'QUOTED-PRINTABLE') {
    try {
      // Handle soft line breaks
      const joined = raw.replace(/=\r?\n/g, '');
      const decoded = decodeQuotedPrintable(joined);
      return decodeURIComponent(escape(decoded));
    } catch {
      return raw;
    }
  }
  // Handle backslash escapes in vCard 3.0+
  return raw
    .replace(/\\n/gi, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\')
    .trim();
}

function parseParams(paramStr: string): Record<string, string> {
  const params: Record<string, string> = {};
  if (!paramStr) return params;
  paramStr.split(';').forEach(part => {
    const eq = part.indexOf('=');
    if (eq !== -1) {
      const k = part.slice(0, eq).trim().toUpperCase();
      const v = part.slice(eq + 1).trim().replace(/^"(.*)"$/, '$1');
      params[k] = v;
    } else {
      // Bare type like "CELL", "WORK", "HOME"
      params[part.trim().toUpperCase()] = 'true';
    }
  });
  return params;
}

function inferPhoneType(params: Record<string, string>): PhoneNumber['type'] {
  const hasType = (t: string) =>
    Object.keys(params).some(k => k === t || params[k]?.toUpperCase().includes(t));

  if (hasType('CELL') || hasType('MOBILE')) return 'mobile';
  if (hasType('WORK')) return 'work';
  if (hasType('HOME')) return 'home';
  if (hasType('FAX')) return 'fax';
  return 'mobile'; // default
}

function inferEmailType(params: Record<string, string>): EmailAddress['type'] {
  const keys = Object.keys(params);
  if (keys.some(k => k === 'WORK' || params[k]?.toUpperCase() === 'WORK')) return 'work';
  if (keys.some(k => k === 'HOME' || params[k]?.toUpperCase() === 'HOME')) return 'personal';
  return 'work';
}

function cleanPhone(raw: string): string {
  return raw.replace(/[\s\-().]/g, '');
}

// ---- vCard splitter ----------------------------------------

function splitVcards(raw: string): string[] {
  // Unfold lines (RFC 2425: CRLF followed by whitespace)
  const unfolded = raw.replace(/\r?\n[ \t]/g, '');
  const cards: string[] = [];
  const regex = /BEGIN:VCARD[\s\S]*?END:VCARD/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(unfolded)) !== null) {
    cards.push(match[0]);
  }
  return cards;
}

// ---- Single vCard parser -----------------------------------

function parseVcard(cardText: string): Contact | null {
  const lines = cardText.split(/\r?\n/).filter(l => l.trim());
  const props: Array<{ key: string; params: Record<string, string>; value: string }> = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i]!;
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) { i++; continue; }

    const keyPart = line.slice(0, colonIdx);
    let rawValue = line.slice(colonIdx + 1);

    const semicolonIdx = keyPart.indexOf(';');
    const key = (semicolonIdx !== -1 ? keyPart.slice(0, semicolonIdx) : keyPart).trim().toUpperCase();
    const paramStr = semicolonIdx !== -1 ? keyPart.slice(semicolonIdx + 1) : '';
    const params = parseParams(paramStr);

    // Decode value
    const value = decodeValue(rawValue, params['ENCODING']);
    props.push({ key, params, value });
    i++;
  }

  // --- Extract fields ---
  let firstName = '';
  let lastName = '';
  let displayName = '';
  let organization = '';
  let jobTitle = '';
  let notes = '';
  const phones: PhoneNumber[] = [];
  const emails: EmailAddress[] = [];
  const addresses: Address[] = [];

  for (const prop of props) {
    switch (prop.key) {
      case 'N': {
        // N:Last;First;Middle;Prefix;Suffix
        const parts = prop.value.split(';');
        lastName  = (parts[0] ?? '').trim();
        firstName = (parts[1] ?? '').trim();
        break;
      }
      case 'FN':
        displayName = prop.value.trim();
        break;
      case 'ORG':
        organization = prop.value.split(';')[0]?.trim() ?? '';
        break;
      case 'TITLE':
        jobTitle = prop.value.trim();
        break;
      case 'NOTE':
        notes = prop.value.trim();
        break;
      case 'TEL': {
        const cleaned = cleanPhone(prop.value);
        if (cleaned) {
          phones.push({
            value: cleaned,
            type: inferPhoneType(prop.params),
            isPrimary: phones.length === 0,
          });
        }
        break;
      }
      case 'EMAIL': {
        const email = prop.value.trim().toLowerCase();
        if (email) {
          emails.push({
            value: email,
            type: inferEmailType(prop.params),
            isPrimary: emails.length === 0,
          });
        }
        break;
      }
      case 'ADR': {
        // ADR:PO Box;Extended;Street;City;State;Postal;Country
        const parts = prop.value.split(';');
        const street     = [parts[0], parts[1], parts[2]].filter(Boolean).join(', ').trim();
        const city       = (parts[3] ?? '').trim();
        const state      = (parts[4] ?? '').trim();
        const postalCode = (parts[5] ?? '').trim();
        const country    = (parts[6] ?? '').trim();
        if (street || city || country) {
          const adrType = inferAddrType(prop.params);
          addresses.push({ street, city, state, postalCode, country, type: adrType });
        }
        break;
      }
    }
  }

  // Build display name fallback
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim() || displayName;
  if (!fullName) return null;

  const initials = buildInitials(firstName, lastName, displayName);
  const id = generateId();

  return {
    id,
    firstName,
    lastName,
    fullName,
    displayName: displayName || fullName,
    organization: organization || undefined,
    jobTitle: jobTitle || undefined,
    phones,
    emails,
    addresses,
    notes: notes || undefined,
    avatarInitials: initials,
    avatarColor: getAvatarColor(fullName + id),
    isFavorite: false,
    isEmergency: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function inferAddrType(params: Record<string, string>): Address['type'] {
  const keys = Object.keys(params);
  if (keys.some(k => k === 'WORK' || params[k]?.toUpperCase() === 'WORK')) return 'work';
  if (keys.some(k => k === 'HOME' || params[k]?.toUpperCase() === 'HOME')) return 'home';
  return 'other';
}

function buildInitials(first: string, last: string, display: string): string {
  if (first && last) return `${first[0]}${last[0]}`.toUpperCase();
  if (first) return first.slice(0, 2).toUpperCase();
  if (display) {
    const words = display.trim().split(/\s+/);
    if (words.length >= 2) return `${words[0]![0]}${words[1]![0]}`.toUpperCase();
    return display.slice(0, 2).toUpperCase();
  }
  return '??';
}

// ---- Public API --------------------------------------------

export interface VcfParseResult {
  contacts: Contact[];
  errors: number;
  total: number;
}

export function parseVcfFile(content: string): VcfParseResult {
  const cards = splitVcards(content);
  const contacts: Contact[] = [];
  let errors = 0;

  for (const card of cards) {
    try {
      const contact = parseVcard(card);
      if (contact) {
        contacts.push(contact);
      } else {
        errors++;
      }
    } catch {
      errors++;
    }
  }

  return { contacts, errors, total: cards.length };
}

export function detectDuplicates(
  incoming: Contact[],
  existing: Contact[]
): { unique: Contact[]; duplicates: Contact[] } {
  const existingKeys = new Set<string>();

  for (const c of existing) {
    // Key by full name + first phone
    const key = normalizeKey(c.fullName, c.phones[0]?.value);
    existingKeys.add(key);
  }

  const unique: Contact[] = [];
  const duplicates: Contact[] = [];

  for (const c of incoming) {
    const key = normalizeKey(c.fullName, c.phones[0]?.value);
    if (existingKeys.has(key)) {
      duplicates.push(c);
    } else {
      unique.push(c);
      existingKeys.add(key); // prevent duplicates within the import itself
    }
  }

  return { unique, duplicates };
}

function normalizeKey(name: string, phone?: string): string {
  const n = name.toLowerCase().replace(/\s+/g, '');
  const p = phone ? cleanPhone(phone) : '';
  return `${n}::${p}`;
}
