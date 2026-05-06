import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/shared/lib/auth';

export async function RootRedirectPage() {
  const session = await getServerSession(authOptions);
  redirect(session ? '/dashboard' : '/login');
}
