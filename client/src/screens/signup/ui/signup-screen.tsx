import { SignupForm } from '@/widgets/auth';

export default function SignupScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50/60 via-teal-50/40 to-[#CEFD56]/10 p-4">
      <SignupForm />
    </div>
  );
}
