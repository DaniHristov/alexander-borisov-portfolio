/**
 * Client-upload token endpoint for admin image uploads.
 *
 * The browser uploads images DIRECTLY to Vercel Blob (see ImageDrop) instead of
 * streaming them through a Server Action — Server Actions / serverless functions
 * cap the request body (~1 MB Next default, ~4.5 MB on Vercel), which is far too
 * small for real portfolio images. `handleUpload` mints a short-lived,
 * size/type-restricted client token; only an authenticated admin can obtain one.
 */
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { storeImage } from '@/lib/storage/upload';

export const runtime = 'nodejs'; // session check uses cookies + crypto

const ALLOWED_CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

/** Tells ImageDrop which upload path to use (client → Blob, or local dev PUT). */
export async function GET(): Promise<NextResponse> {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ blobConfigured: Boolean(process.env.BLOB_READ_WRITE_TOKEN) });
}

/**
 * Local-dev upload path: no BLOB_READ_WRITE_TOKEN → the browser PUTs the file
 * here and `storeImage` writes it to public/uploads/ (gitignored). Route
 * handlers have no Server-Action body cap in `next dev`, so 8 MB is fine.
 */
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

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;
  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        // Gate token issuance on a valid admin session.
        const session = await getSession();
        if (!session) throw new Error('Unauthorized');
        return {
          allowedContentTypes: ALLOWED_CONTENT_TYPES,
          maximumSizeInBytes: MAX_BYTES,
          addRandomSuffix: true,
        };
      },
      // Vercel calls this server-to-server after the upload completes. We capture
      // the URL client-side from upload()'s return value, so this is a no-op
      // (it also does not fire for localhost uploads).
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(json);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Upload failed' },
      { status: 400 },
    );
  }
}
