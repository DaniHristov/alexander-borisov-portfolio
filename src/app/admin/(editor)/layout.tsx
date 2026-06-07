import type { ReactNode } from 'react';
import { requireSession } from '@/lib/auth/require';
import { hasUnpublishedChanges } from '@/db/queries';
import { TopBar } from '@/components/admin/TopBar';
import { PublishButton } from '@/components/admin/PublishButton';
import { logout } from './actions';

export const dynamic = 'force-dynamic'; // never cache admin pages

export default async function EditorLayout({ children }: { children: ReactNode }) {
  await requireSession();
  // Falls back to clean when the DB isn't configured/reachable.
  let dirty = false;
  try {
    dirty = await hasUnpublishedChanges();
  } catch {
    dirty = false;
  }
  return (
    <div className="min-h-screen bg-black text-white">
      <TopBar
        dirty={dirty}
        actions={
          <>
            <PublishButton dirty={dirty} />
            <form action={logout}>
              <button type="submit" className="text-xs text-neutral-400 hover:text-white">
                Sign out
              </button>
            </form>
          </>
        }
      />
      <main className="p-4">{children}</main>
    </div>
  );
}
