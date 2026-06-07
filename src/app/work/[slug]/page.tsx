import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProjectMeta } from '@/components/ProjectMeta';
import { ProjectGallery } from '@/components/ProjectGallery';
import { PrevNext } from '@/components/PrevNext';
import { getAllProjects, getProjectBySlug } from '@/content/projects';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return (await getAllProjects()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.summary,
    openGraph: {
      title: project.title,
      description: project.summary,
      images: [project.cover.src],
    },
  };
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const all = await getAllProjects();
  const idx = all.findIndex((p) => p.slug === slug);
  const prev = idx > 0 ? all[idx - 1] : undefined;
  const next = idx >= 0 && idx < all.length - 1 ? all[idx + 1] : undefined;

  return (
    <article className="pb-12 pt-4">
      <ProjectMeta project={project} />
      <ProjectGallery images={project.images} />
      <PrevNext prev={prev} next={next} />
    </article>
  );
}
