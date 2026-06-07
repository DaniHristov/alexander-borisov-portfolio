import { getWorkingProjects } from '@/db/queries';
import { GridEditor, type EditorTile } from '@/components/admin/GridEditor';

export default async function AdminWork() {
  const rows = await getWorkingProjects().catch(() => []);
  const initial: EditorTile[] = rows
    .filter((r) => r.gallery === 'work')
    .map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      year: r.year,
      summary: r.summary,
      categories: r.categories,
      coverBlobUrl: r.coverBlobUrl,
      coverW: r.coverW,
      coverH: r.coverH,
      col: r.col,
      row: r.row,
      colSpan: r.colSpan,
      rowSpan: r.rowSpan,
      z: r.z,
      sortOrder: r.sortOrder,
    }));
  return (
    <section>
      <h1 className="mb-4 text-sm uppercase tracking-wide text-neutral-400">Work — arrange the grid</h1>
      <GridEditor gallery="work" initial={initial} />
    </section>
  );
}
