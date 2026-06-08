import type { Metadata } from 'next';
import { getArtProjects } from '@/content/live';
import { WorksGrid } from '@/components/WorksGrid';

export const metadata: Metadata = {
  title: 'Art',
};

export default async function ArtPage() {
  const art = await getArtProjects();
  return (
    <div className="mx-auto w-full max-w-[1100px] px-6 pb-20 pt-4 md:px-10">
      <h1 className="sr-only">Art</h1>
      <WorksGrid projects={art} />
    </div>
  );
}
