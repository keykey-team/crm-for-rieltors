import { SignupForm } from '@/features/auth';

export function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
      <SignupForm />
    </div>
  );
}
