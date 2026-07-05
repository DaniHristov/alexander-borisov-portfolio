import { getWorkingProjects } from '@/db/queries';
import { GridEditor, type EditorTile } from '@/components/admin/GridEditor';

export default async function AdminCollage() {
  // One unified collage — every project, no work/art split.
  const rows = await getWorkingProjects().catch(() => []);
  const initial: EditorTile[] = rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    year: r.year,
    summary: r.summary,
    fit: r.fit === 'contain' ? 'contain' : 'cover',
    clickable: r.clickable,
    coverBlobUrl: r.coverBlobUrl,
    coverW: r.coverW,
    coverH: r.coverH,
    x: r.x,
    y: r.y,
    w: r.w,
    z: r.z,
    sortOrder: r.sortOrder,
  }));
  return (
    <section>
      <h1 className="mb-4 text-sm uppercase tracking-wide text-neutral-400">
        Collage — arrange every piece on one canvas
      </h1>
      <GridEditor initial={initial} />
    </section>
  );
}
