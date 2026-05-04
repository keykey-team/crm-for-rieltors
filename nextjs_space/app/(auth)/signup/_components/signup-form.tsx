'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Building2, Mail, Lock, User } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/context';

export function SignupForm() {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data?.error ?? t('auth.errorGeneral')); setLoading(false); return; }
      const signInRes = await signIn('credentials', { email, password, redirect: false });
      if (signInRes?.error) { setError(t('auth.errorLogin')); setLoading(false); return; }
      router.replace('/dashboard');
    } catch { setError(t('auth.errorServer')); setLoading(false); }
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
          <Building2 className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-display font-bold tracking-tight">RealCRM</h1>
        <p className="text-muted-foreground mt-1">{t('auth.signUpSubtitle')}</p>
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8" style={{ boxShadow: 'var(--shadow-lg)' }}>
        {error && <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-xl">{error}</div>}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">{t('auth.name')}</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition text-sm"
                placeholder={t('auth.namePlaceholder')} required />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">{t('auth.email')}</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition text-sm"
                placeholder="your@email.com" required />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">{t('auth.password')}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition text-sm"
                placeholder={t('auth.minPassword')} required minLength={6} />
            </div>
          </div>
        </div>
        <button type="submit" disabled={loading}
          className="w-full mt-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium text-sm hover:opacity-90 transition disabled:opacity-50">
          {loading ? t('auth.creating') : t('auth.signUpBtn')}
        </button>
        <p className="text-center text-sm text-muted-foreground mt-4">
          {t('auth.hasAccount')}{' '}
          <Link href="/login" className="text-primary font-medium hover:underline">{t('auth.loginBtn')}</Link>
        </p>
      </form>
    </div>
  );
}
