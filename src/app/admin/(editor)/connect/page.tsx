import { getWorkingSiteContent } from '@/db/queries';
import { ConnectForm } from '@/components/admin/ConnectForm';

export default async function AdminConnect() {
  const sc = await getWorkingSiteContent().catch(() => null);
  return (
    <section>
      <h1 className="mb-4 text-sm uppercase tracking-wide text-neutral-400">Connect</h1>
      <ConnectForm sc={sc} />
      <p className="mt-4 text-xs text-neutral-500">Saved as draft — click Publish to go live.</p>
    </section>
  );
}
