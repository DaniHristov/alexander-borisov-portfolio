import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getWorkingProjectById } from '@/db/queries';
import { ProjectDetailEditor, type DetailProject } from '@/components/admin/ProjectDetailEditor';
import type { GalleryImage } from '@/components/admin/GalleryManager';

export const dynamic = 'force-dynamic'; // never cache admin pages

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getWorkingProjectById(id).catch(() => null);
  if (!data || data.project.gallery !== 'work') notFound();

  const project: DetailProject = {
    id: data.project.id,
    slug: data.project.slug,
    title: data.project.title,
    year: data.project.year,
    categories: data.project.categories,
    client: data.project.client ?? '',
    role: data.project.role ?? '',
    summary: data.project.summary,
    description: data.project.description ?? '',
    coverBlobUrl: data.project.coverBlobUrl,
    coverW: data.project.coverW,
    coverH: data.project.coverH,
  };
  const images: GalleryImage[] = data.tiles.map((t) => ({
    id: t.id,
    blobUrl: t.blobUrl,
    width: t.width,
    height: t.height,
    alt: t.alt,
    caption: t.caption ?? '',
  }));

  return (
    <section>
      <div className="mb-4 flex items-center gap-3">
        <Link href="/admin/work" className="text-xs text-neutral-400 hover:text-white">← Back to grid</Link>
        <h1 className="text-sm uppercase tracking-wide text-neutral-400">Edit project</h1>
      </div>
      <ProjectDetailEditor project={project} images={images} />
    </section>
  );
}
