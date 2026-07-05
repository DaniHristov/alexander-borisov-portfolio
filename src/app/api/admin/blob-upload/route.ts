/**
 * Admin image upload (server-side).
 *
 * The browser PUTs a (client-downscaled) image here; `storeImage` writes it to
 * Vercel Blob when BLOB_READ_WRITE_TOKEN is set, or to public/uploads/ in local
 * dev. This is a server-to-server upload — no client-upload CORS, and no
 * Server-Action body cap. Vercel's serverless request-body limit (~4.5 MB) is
 * why ImageDrop downscales before sending.
 */
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { storeImage } from '@/lib/storage/upload';

export const runtime = 'nodejs'; // session (cookies + crypto) and sharp

export async function PUT(request: Request): Promise<NextResponse> {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // On Vercel the filesystem is read-only, so the local-disk fallback can't
  // work — uploads require Vercel Blob. Fail with a clear message instead of a
  // cryptic ENOENT when BLOB_READ_WRITE_TOKEN is missing in production.
  if (process.env.VERCEL && !process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: 'Image uploads need Vercel Blob. Add a Blob store (sets BLOB_READ_WRITE_TOKEN) and redeploy.' },
      { status: 501 },
    );
  }
  try {
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File)) throw new Error('No file provided.');
    const stored = await storeImage(file); // validates type/size, returns dims
    return NextResponse.json(stored);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Upload failed' },
      { status: 400 },
    );
  }
}
