import type { Metadata } from 'next';
import { Suspense } from 'react';
import { TagFilter } from '@/components/TagFilter';
import { ViewToggle } from '@/components/ViewToggle';
import { WorksGrid } from '@/components/WorksGrid';
import { IndexList } from '@/components/IndexList';
import { getAllProjects } from '@/content/projects';
import { ALL_CATEGORIES, type Category } from '@/content/types';

export const metadata: Metadata = {
  title: 'Works',
};

interface PageProps {
  searchParams: Promise<{ tag?: string; view?: string }>;
}

export default async function WorksPage({ searchParams }: PageProps) {
  const { tag, view } = await searchParams;
  const all = getAllProjects();
  const isCategory = (v: string | undefined): v is Category =>
    !!v && (ALL_CATEGORIES as string[]).includes(v);
  const filtered = isCategory(tag) ? all.filter((p) => p.categories.includes(tag)) : all;
  const isIndex = view === 'index';

  // Categories actually present in the data — keeps the filter bar honest
  const presentCategories = ALL_CATEGORIES.filter((c) =>
    all.some((p) => p.categories.includes(c)),
  );

  return (
    <>
      <h1 className="sr-only">Works</h1>
      <div className="flex flex-col gap-4 px-6 pb-4 pt-2 md:flex-row md:items-end md:justify-between md:px-10">
        <Suspense fallback={null}>
          <TagFilter tags={presentCategories} />
        </Suspense>
        <Suspense fallback={null}>
          <ViewToggle />
        </Suspense>
      </div>
      {isIndex ? <IndexList projects={filtered} /> : <WorksGrid projects={filtered} />}
    </>
  );
}
