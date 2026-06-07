import type { Metadata } from 'next';
import { artIntro } from '@/content/art';
import { getArtProjects } from '@/content/live';
import { WorksGrid } from '@/components/WorksGrid';

export const metadata: Metadata = {
  title: 'Art',
};

export default async function ArtPage() {
  const art = await getArtProjects();
  return (
    <div className="mx-auto w-full max-w-[1100px] px-6 pb-20 pt-4 md:px-10">
      <header className="max-w-[760px]">
        <h1 className="text-[clamp(2rem,4vw,3rem)] font-medium leading-tight tracking-tight">Art</h1>
        <p className="mt-6 text-base leading-relaxed text-muted">{artIntro}</p>
      </header>
      <div className="mt-14">
        <WorksGrid projects={art} />
      </div>
    </div>
  );
}
