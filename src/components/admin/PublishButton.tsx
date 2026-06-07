'use client';

import { useTransition } from 'react';
import { publishNow } from '@/app/admin/(editor)/actions';

export function PublishButton({ dirty }: { dirty: boolean }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending || !dirty}
      onClick={() => start(() => publishNow())}
      className="rounded bg-white px-3 py-1.5 text-sm font-medium text-black disabled:opacity-40"
    >
      {pending ? 'Publishing…' : 'Publish'}
    </button>
  );
}
