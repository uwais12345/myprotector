// ============================================================
// ConnectDesk — Import Contacts Page
// ============================================================

import React, { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileText, CheckCircle2, AlertCircle,
  ArrowRight, Users, AlertTriangle, RefreshCw
} from 'lucide-react';
import { useContacts } from '@/stores/ContactsContext';
import { useToast } from '@/stores/ToastContext';
import { Button, Avatar } from '@/components/ui';
import { parseVcfFile, detectDuplicates } from '@/utils/vcfParser';
import type { Contact } from '@/types';
import { APP_CONFIG } from '@/constants';

type ImportStep = 'idle' | 'parsing' | 'preview' | 'importing' | 'done' | 'error';

interface ParsedResult {
  contacts: Contact[];
  errors: number;
  total: number;
  duplicates: Contact[];
  unique: Contact[];
}

// ---- Duplicate Handling Options ----------------------------
type DuplicateAction = 'skip' | 'replace';

// ---- Import Page -------------------------------------------
export function ImportPage() {
  const { contacts, addImportedContacts } = useContacts();
  const { showToast } = useToast();

  const [step, setStep] = useState<ImportStep>('idle');
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState('');
  const [parsed, setParsed] = useState<ParsedResult | null>(null);
  const [duplicateAction, setDuplicateAction] = useState<DuplicateAction>('skip');
  const [importResult, setImportResult] = useState<{ imported: number; duplicates: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    // Validate
    if (!file.name.toLowerCase().endsWith('.vcf') && file.type !== 'text/vcard' && file.type !== 'text/x-vcard') {
      setErrorMessage("We couldn't read this file. Please upload a valid .vcf contact file.");
      setStep('error');
      return;
    }

    const maxBytes = APP_CONFIG.maxVcfFileSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      setErrorMessage(`File is too large. Maximum size is ${APP_CONFIG.maxVcfFileSizeMB}MB.`);
      setStep('error');
      return;
    }

    setFileName(file.name);
    setStep('parsing');

    try {
      const text = await file.text();
      const result = parseVcfFile(text);

      if (result.contacts.length === 0) {
        setErrorMessage("No valid contacts were found in this file. Please check the file and try again.");
        setStep('error');
        return;
      }

      const { unique, duplicates } = detectDuplicates(result.contacts, contacts);

      setParsed({ ...result, unique, duplicates });
      setStep('preview');
    } catch {
      setErrorMessage("We couldn't read this contact file. Please upload a valid .vcf file.");
      setStep('error');
    }
  }, [contacts]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  }, [processFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleConfirmImport = useCallback(async () => {
    if (!parsed) return;
    setStep('importing');

    await new Promise(r => setTimeout(r, 600)); // Simulate processing

    const toImport = duplicateAction === 'skip' ? parsed.unique : parsed.contacts;
    const result = addImportedContacts(toImport, false);
    setImportResult({ imported: result.imported, duplicates: parsed.duplicates.length });
    setStep('done');
    showToast(`${result.imported} contacts imported successfully.`, 'success');
  }, [parsed, duplicateAction, addImportedContacts, showToast]);

  const handleReset = () => {
    setStep('idle');
    setParsed(null);
    setFileName('');
    setImportResult(null);
    setErrorMessage('');
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px', maxWidth: 640, width: '100%', margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 6 }}>Import Contacts</h1>
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
          Upload a .vcf file exported from Google Contacts, Apple Contacts, or any vCard-compatible app.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {/* Step: Idle / Upload */}
        {step === 'idle' && (
          <motion.div key="idle" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div
              className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              aria-label="Upload a .vcf contact file"
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
            >
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--color-primary-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Upload size={22} color="var(--interactive-primary)" />
              </div>
              <div>
                <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Drop your .vcf file here
                </p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                  or click to browse files
                </p>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
                Supported: .vcf / vCard 2.1, 3.0, 4.0 — max {APP_CONFIG.maxVcfFileSizeMB}MB
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".vcf,text/vcard,text/x-vcard"
              onChange={handleFileInput}
              className="visually-hidden"
              aria-hidden="true"
            />

            <div style={{ marginTop: 16, padding: '14px 16px', background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-default)' }}>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>How to export from Google Contacts:</p>
              <ol style={{ paddingLeft: 18, fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                <li>Go to <strong>contacts.google.com</strong></li>
                <li>Click <strong>Export</strong> in the left sidebar</li>
                <li>Choose contacts and select <strong>vCard (for iOS Contacts)</strong></li>
                <li>Click <strong>Export</strong> and upload the file here</li>
              </ol>
            </div>
          </motion.div>
        )}

        {/* Step: Parsing */}
        {step === 'parsing' && (
          <motion.div key="parsing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '60px 24px' }}>
            <RefreshCw size={36} color="var(--interactive-primary)" style={{ margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
            <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>Parsing contacts…</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{fileName}</p>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </motion.div>
        )}

        {/* Step: Importing */}
        {step === 'importing' && (
          <motion.div key="importing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '60px 24px' }}>
            <RefreshCw size={36} color="var(--interactive-primary)" style={{ margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
            <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>Importing contacts…</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Please wait</p>
          </motion.div>
        )}

        {/* Step: Error */}
        {step === 'error' && (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '40px 24px', textAlign: 'center' }}>
              <AlertCircle size={40} color="var(--color-error-500)" />
              <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>Import failed</h2>
              <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', maxWidth: 320 }}>{errorMessage}</p>
              <Button variant="primary" onClick={handleReset}>Try again</Button>
            </div>
          </motion.div>
        )}

        {/* Step: Preview */}
        {step === 'preview' && parsed && (
          <motion.div key="preview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            {/* Summary stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
              {[
                { value: parsed.contacts.length, label: 'Detected',  color: 'var(--interactive-primary)' },
                { value: parsed.unique.length,   label: 'New',       color: 'var(--color-success-600)' },
                { value: parsed.duplicates.length, label: 'Duplicates', color: 'var(--color-warning-600)' },
              ].map(stat => (
                <div key={stat.label} style={{ textAlign: 'center', padding: '16px 8px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: stat.color }}>{stat.value}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Parsing errors */}
            {parsed.errors > 0 && (
              <div style={{ display: 'flex', gap: 8, padding: '10px 14px', background: 'var(--color-warning-50)', border: '1px solid var(--color-warning-100)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', color: 'var(--color-warning-600)', marginBottom: 16 }}>
                <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                {parsed.errors} contact{parsed.errors !== 1 ? 's' : ''} could not be parsed and will be skipped.
              </div>
            )}

            {/* Duplicate handling */}
            {parsed.duplicates.length > 0 && (
              <div style={{ marginBottom: 20, padding: 16, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)' }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: 10, color: 'var(--text-primary)' }}>
                  {parsed.duplicates.length} duplicate{parsed.duplicates.length !== 1 ? 's' : ''} detected
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(['skip', 'replace'] as DuplicateAction[]).map(action => (
                    <label key={action} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '10px 12px', background: duplicateAction === action ? 'var(--color-primary-50)' : 'var(--bg-surface-2)', border: `1px solid ${duplicateAction === action ? 'var(--interactive-primary)' : 'var(--border-default)'}`, borderRadius: 'var(--radius-md)' }}>
                      <input type="radio" name="dup-action" value={action} checked={duplicateAction === action} onChange={() => setDuplicateAction(action)} style={{ accentColor: 'var(--interactive-primary)' }} />
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                          {action === 'skip' ? 'Skip duplicates' : 'Replace existing contacts'}
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 1 }}>
                          {action === 'skip' ? `Import only ${parsed.unique.length} new contacts` : `Import all ${parsed.contacts.length} contacts, overwriting duplicates`}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Contact preview */}
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: 20 }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileText size={15} color="var(--text-tertiary)" />
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Preview — first 5 contacts</span>
              </div>
              {parsed.contacts.slice(0, 5).map(contact => (
                <div key={contact.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <Avatar contact={contact} size="sm" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{contact.displayName || contact.fullName}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{contact.phones[0]?.value ?? contact.emails[0]?.value ?? ''}</div>
                  </div>
                  {parsed.duplicates.some(d => d.fullName === contact.fullName) && (
                    <span className="badge badge-warning" style={{ flexShrink: 0 }}>Duplicate</span>
                  )}
                </div>
              ))}
              {parsed.contacts.length > 5 && (
                <div style={{ padding: '10px 16px', fontSize: '0.8125rem', color: 'var(--text-tertiary)', textAlign: 'center' }}>
                  +{parsed.contacts.length - 5} more contacts
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={handleReset}>Cancel</Button>
              <Button variant="primary" onClick={handleConfirmImport}>
                Import {duplicateAction === 'skip' ? parsed.unique.length : parsed.contacts.length} contacts
                <ArrowRight size={16} />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step: Done */}
        {step === 'done' && importResult && (
          <motion.div key="done" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', padding: '48px 24px' }}>
            <CheckCircle2 size={48} color="var(--color-success-500)" style={{ margin: '0 auto 16px' }} />
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 8 }}>Import complete</h2>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
              <strong style={{ color: 'var(--text-primary)' }}>{importResult.imported}</strong> contacts imported successfully.
            </p>
            {importResult.duplicates > 0 && (
              <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginBottom: 20 }}>
                {importResult.duplicates} duplicates were skipped.
              </p>
            )}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button variant="secondary" onClick={handleReset}>Import more</Button>
              <Button variant="primary" onClick={() => window.location.assign('/contacts')}>
                <Users size={16} /> View contacts
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
