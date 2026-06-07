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

export const runtime = 'nodejs'; // session check uses cookies + crypto

const ALLOWED_CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

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
