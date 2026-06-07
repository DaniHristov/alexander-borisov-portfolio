'use client';

import { useActionState } from 'react';
import { requestLink } from './actions';

export default function LoginPage() {
  const [state, action, pending] = useActionState(requestLink, undefined);

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <h1 className="mb-6 text-lg font-medium">Portfolio admin</h1>
      {state?.sent ? (
        <p className="text-sm text-neutral-400">
          If that address is authorized, a sign-in link is on its way. Check your
          email (or the dev server console in local development).
        </p>
      ) : (
        <form action={action} className="flex flex-col gap-3">
          <label className="text-sm" htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="rounded border border-neutral-700 bg-transparent px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded bg-white px-3 py-2 text-sm font-medium text-black disabled:opacity-50"
          >
            {pending ? 'Sending…' : 'Send sign-in link'}
          </button>
        </form>
      )}
    </main>
  );
}
