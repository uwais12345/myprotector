// ============================================================
// ConnectDesk — Auth Pages (Login, Register, Forgot Password)
// ============================================================

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, PhoneCall, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/stores/AuthContext';
import { Button, Input } from '@/components/ui';
import { APP_CONFIG, ROUTES } from '@/constants';

// ---- Schemas -----------------------------------------------

const loginSchema = z.object({
  email:    z.string().min(1, 'Username or email address is required'),
  password: z.string().min(1, 'Password is required'),
});

const forgotSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type LoginData  = z.infer<typeof loginSchema>;
type ForgotData = z.infer<typeof forgotSchema>;

// ---- Shared Auth Card Wrapper ------------------------------

function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-page">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="auth-card"
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 10,
            background: 'var(--interactive-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px',
          }}>
            <PhoneCall size={22} color="white" />
          </div>
          <h1 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            {APP_CONFIG.name}
          </h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            {APP_CONFIG.subtitle}
          </p>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

// ---- Password Visibility Toggle ----------------------------

function usePasswordToggle() {
  const [visible, setVisible] = useState(false);
  const toggle = () => setVisible(v => !v);
  const type = visible ? 'text' : 'password';
  const Icon = visible ? EyeOff : Eye;
  return { visible, toggle, type, Icon };
}

// ---- Password Strength Indicator ---------------------------


// ---- Login Page --------------------------------------------

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const pw = usePasswordToggle();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginData) => {
    setServerError('');
    const result = await login(data.email, data.password);
    if (result.error) { setServerError(result.error); return; }
    navigate(ROUTES.contacts, { replace: true });
  };


  return (
    <AuthCard>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ fontSize: '1.0625rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
          Sign in to your account
        </h2>

      </div>



      {serverError && (
        <div role="alert" style={{
          display: 'flex', alignItems: 'flex-start', gap: 8,
          padding: '10px 12px', marginBottom: 16,
          background: 'var(--color-error-50)', border: '1px solid var(--color-error-100)',
          borderRadius: 'var(--radius-md)', fontSize: '0.875rem', color: 'var(--color-error-700)',
        }}>
          <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Input
          id="login-email"
          label="Username or Email"
          type="text"
          autoComplete="username"
          placeholder="Mydeen4262 or you@company.com"
          error={errors.email?.message}
          required
          {...register('email')}
        />

        <div className="form-group">
          <label htmlFor="login-password" className="form-label">
            Password <span className="text-red-500 ml-1" aria-hidden="true">*</span>
          </label>
          <div style={{ position: 'relative' }}>
            <input
              id="login-password"
              type={pw.type}
              autoComplete="current-password"
              placeholder="Enter your password"
              className={`input-base ${errors.password ? 'input-error' : ''}`}
              style={{ paddingRight: 42 }}
              {...register('password')}
            />
            <button
              type="button"
              onClick={pw.toggle}
              style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', padding: 2 }}
              aria-label={pw.visible ? 'Hide password' : 'Show password'}
            >
              <pw.Icon size={18} />
            </button>
          </div>
          {errors.password && (
            <p className="form-error" role="alert"><AlertCircle size={13} />{errors.password.message}</p>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Link to={ROUTES.forgotPassword} style={{ fontSize: '0.875rem' }}>Forgot password?</Link>
        </div>

        <Button type="submit" variant="primary" size="lg" loading={isSubmitting} style={{ width: '100%', marginTop: 4 }}>
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </AuthCard>
  );
}


// ---- Forgot Password Page ----------------------------------

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotData>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (_data: ForgotData) => {
    await new Promise(r => setTimeout(r, 800));
    setSent(true);
  };

  return (
    <AuthCard>
      {sent ? (
        <div style={{ textAlign: 'center' }}>
          <CheckCircle2 size={40} color="var(--color-success-500)" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '1.0625rem', fontWeight: 600, marginBottom: 8 }}>Check your email</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
            If an account exists for that email address, you'll receive a password reset link shortly.
          </p>
          <Link to={ROUTES.login}>
            <Button variant="secondary" style={{ width: '100%' }}>Back to sign in</Button>
          </Link>
        </div>
      ) : (
        <>
          <h2 style={{ fontSize: '1.0625rem', fontWeight: 600, marginBottom: 8 }}>Reset your password</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
            Enter your email address and we'll send you a reset link.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input id="forgot-email" label="Email address" type="email" autoComplete="email" placeholder="you@company.com" error={errors.email?.message} required {...register('email')} />
            <Button type="submit" variant="primary" size="lg" loading={isSubmitting} style={{ width: '100%' }}>
              {isSubmitting ? 'Sending…' : 'Send reset link'}
            </Button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 20 }}>
            <Link to={ROUTES.login}>← Back to sign in</Link>
          </p>
        </>
      )}
    </AuthCard>
  );
}

// ---- Protected Route ---------------------------------------

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { auth } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (auth.status === 'unauthenticated') {
      navigate(ROUTES.login, { replace: true });
    }
  }, [auth.status, navigate]);

  if (auth.status === 'loading' || auth.status === 'unauthenticated') {
    return (
      <div style={{ height: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-app)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--interactive-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PhoneCall size={18} color="white" />
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Loading…</div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
