import { getWorkingSiteContent } from '@/db/queries';
import { AboutForm } from '@/components/admin/AboutForm';

export default async function AdminAbout() {
  const sc = await getWorkingSiteContent().catch(() => null);
  return (
    <section>
      <h1 className="mb-4 text-sm uppercase tracking-wide text-neutral-400">About</h1>
      <AboutForm sc={sc} />
      <p className="mt-4 text-xs text-neutral-500">Saved as draft — click Publish to go live.</p>
    </section>
  );
}
