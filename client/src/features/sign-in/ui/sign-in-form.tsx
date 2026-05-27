'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Building2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/shared/lib/i18n/context';
import { syncBackendSession } from '@/shared/lib/backend-auth';
import { parseForm, loginSchema } from '@/shared/lib/validation';

export function LoginForm() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const validation = parseForm(loginSchema, { email, password });
    if (!validation.ok) { setErrors(validation.errors); return; }
    setErrors({});
    setLoading(true);
    const res = await signIn('credentials', { email, password, redirect: false });
    if (res?.error) {
      setError(t('auth.errorCredentials'));
      setLoading(false);
    } else {
      const backendSynced = await syncBackendSession();
      if (!backendSynced) {
        setError(t('auth.errorServer'));
        setLoading(false);
        return;
      }
      router.replace('/dashboard');
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
          <Building2 className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-display font-bold tracking-tight">FREEMO R</h1>
        <p className="text-muted-foreground mt-1">{t('auth.loginSubtitle')}</p>
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8" style={{ boxShadow: 'var(--shadow-lg)' }}>
        {error && <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-xl">{error}</div>}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">{t('auth.email')}</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })); }}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition text-sm ${errors.email ? 'border-destructive/60' : 'border-border'}`}
                placeholder="your@email.com" />
            </div>
            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">{t('auth.password')}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type={showPw ? 'text' : 'password'} value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })); }}
                className={`w-full pl-10 pr-10 py-2.5 rounded-xl border bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition text-sm ${errors.password ? 'border-destructive/60' : 'border-border'}`}
                placeholder="••••••••" />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
          </div>
        </div>
        <button type="submit" disabled={loading}
          className="w-full mt-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium text-sm hover:opacity-90 transition disabled:opacity-50">
          {loading ? t('auth.logging') : t('auth.loginBtn')}
        </button>
        <p className="text-center text-sm text-muted-foreground mt-4">
          {t('auth.noAccount')}{' '}
          <Link href="/signup" className="text-primary font-medium hover:underline">{t('auth.signUpBtn')}</Link>
        </p>
      </form>
    </div>
  );
}
