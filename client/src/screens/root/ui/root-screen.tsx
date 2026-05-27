import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/shared/lib/auth';

export default async function RootScreen() {
  const session = await getServerSession(authOptions);
  if (session) redirect('/dashboard');
  redirect('/login');
}
