import { saveConnect } from '@/app/admin/(editor)/actions';
import type { SiteContentRow } from '@/db/schema';

const inp = 'w-full rounded border border-neutral-700 bg-transparent p-2 text-sm';

export function ConnectForm({ sc }: { sc: SiteContentRow | null }) {
  const socials = ((sc?.socials as { label: string; href: string }[]) ?? [])
    .map((s) => `${s.label} | ${s.href}`).join('\n');
  const currently = ((sc?.currently as { label: string; value: string }[]) ?? [])
    .map((c) => `${c.label} | ${c.value}`).join('\n');
  return (
    <form action={saveConnect} className="flex max-w-2xl flex-col gap-4">
      <label className="text-sm">Email
        <input name="email" type="email" defaultValue={sc?.email ?? ''} className={inp} />
      </label>
      <label className="text-sm">Socials (one per line: <code>label | href</code>)
        <textarea name="socials" rows={4} defaultValue={socials} className={inp} />
      </label>
      <label className="text-sm">Currently (one per line: <code>label | value</code>)
        <textarea name="currently" rows={4} defaultValue={currently} className={inp} />
      </label>
      <button type="submit" className="self-start rounded bg-white px-3 py-1.5 text-sm font-medium text-black">
        Save draft
      </button>
    </form>
  );
}
