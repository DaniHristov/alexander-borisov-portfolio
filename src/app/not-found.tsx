import Link from 'next/link';

export default function NotFound() {
  return (
    <article className="mx-auto w-full max-w-[760px] px-6 pb-32 pt-16 text-center md:px-10">
      <p className="text-xs uppercase tracking-wide text-muted">404</p>
      <h1 className="mt-3 text-[clamp(2rem,4vw,3rem)] font-medium leading-tight tracking-tight">
        Not found
      </h1>
      <p className="mt-6 text-base">
        The page you were looking for doesn&apos;t exist or has moved.
      </p>
      <p className="mt-4">
        <Link href="/" className="underline underline-offset-4">
          Back to home
        </Link>
      </p>
    </article>
  );
}
