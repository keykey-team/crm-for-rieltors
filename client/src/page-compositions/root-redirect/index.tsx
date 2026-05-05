import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export async function RootRedirectPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('crm_token')?.value;
  redirect(token ? '/dashboard' : '/login');
}
