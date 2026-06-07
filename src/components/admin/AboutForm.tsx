import { saveAbout } from '@/app/admin/(editor)/actions';
import type { SiteContentRow } from '@/db/schema';

const ta = 'w-full rounded border border-neutral-700 bg-transparent p-2 text-sm';

export function AboutForm({ sc }: { sc: SiteContentRow | null }) {
  const press = ((sc?.press as { title: string; outlet: string; year: number }[]) ?? [])
    .map((p) => `${p.title} | ${p.outlet} | ${p.year}`)
    .join('\n');
  return (
    <form action={saveAbout} className="flex max-w-2xl flex-col gap-4">
      <label className="text-sm">Bio (one paragraph per line)
        <textarea name="bio" rows={6} defaultValue={(sc?.bio ?? []).join('\n')} className={ta} />
      </label>
      <label className="text-sm">Selected clients (one per line)
        <textarea name="selectedClients" rows={6} defaultValue={(sc?.selectedClients ?? []).join('\n')} className={ta} />
      </label>
      <label className="text-sm">Press (one per line: <code>title | outlet | year</code>)
        <textarea name="press" rows={4} defaultValue={press} className={ta} />
      </label>
      <button type="submit" className="self-start rounded bg-white px-3 py-1.5 text-sm font-medium text-black">
        Save draft
      </button>
    </form>
  );
}
