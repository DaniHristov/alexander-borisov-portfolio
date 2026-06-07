import { redirect } from 'next/navigation';
import { getSession } from './session';

/** Use at the top of every protected page and every write server action. */
export async function requireSession(): Promise<{ email: string }> {
  const session = await getSession();
  if (!session) redirect('/admin/login');
  return session;
}
