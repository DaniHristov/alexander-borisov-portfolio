'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { destroySession } from '@/lib/auth/session';
import { requireSession } from '@/lib/auth/require';
import { publish, upsertSiteContent, createProject, updateProjectFields, deleteProject, updateLayout as persistLayout, addTile, deleteTile, updateTile, reorderTiles, getWorkingProjects } from '@/db/queries';
import { storeImage } from '@/lib/storage/upload';
import { tileHeightPx } from '@/lib/grid';
import type { NewProjectRow } from '@/db/schema';

export async function logout(): Promise<void> {
  await requireSession();
  await destroySession();
  redirect('/admin/login');
}

export async function publishNow(): Promise<void> {
  await requireSession();
  await publish();
  // Refresh the admin layout so the dirty indicator clears.
  revalidatePath('/admin', 'layout');
}

// Textareas use one item per line; press rows are `title | outlet | year`.
function lines(v: FormDataEntryValue | null): string[] {
  return String(v ?? '').split('\n').map((s) => s.trim()).filter(Boolean);
}

export async function saveAbout(formData: FormData): Promise<void> {
  await requireSession();
  const press = lines(formData.get('press')).map((row) => {
    const [title, outlet, year] = row.split('|').map((s) => s.trim());
    return { title, outlet, year: Number(year) || 0 };
  });
  await upsertSiteContent({
    bio: lines(formData.get('bio')),
    selectedClients: lines(formData.get('selectedClients')),
    press,
  });
  revalidatePath('/admin/about');
  revalidatePath('/admin', 'layout'); // refresh the dirty indicator
}

export async function saveConnect(formData: FormData): Promise<void> {
  await requireSession();
  const socials = lines(formData.get('socials')).map((row) => {
    const [label, href] = row.split('|').map((s) => s.trim());
    return { label, href };
  });
  const currently = lines(formData.get('currently')).map((row) => {
    const [label, value] = row.split('|').map((s) => s.trim());
    return { label, value };
  });
  await upsertSiteContent({
    email: String(formData.get('email') ?? '').trim(),
    socials,
    currently,
  });
  revalidatePath('/admin/connect');
  revalidatePath('/admin', 'layout'); // refresh the dirty indicator
}

export async function uploadImage(formData: FormData): Promise<{ url: string; width: number; height: number }> {
  await requireSession();
  const file = formData.get('file');
  if (!(file instanceof File)) throw new Error('No file provided.');
  return storeImage(file);
}

/**
 * Lists every image already uploaded, so the admin can reuse them (Media
 * library) instead of re-uploading. Vercel Blob in production; the local
 * public/uploads/ folder in dev.
 */
export async function listUploadedImages(): Promise<{ url: string; pathname: string }[]> {
  await requireSession();
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { list } = await import('@vercel/blob');
    const { blobs } = await list({ prefix: 'uploads/' });
    return blobs
      .sort((a, b) => +new Date(b.uploadedAt) - +new Date(a.uploadedAt))
      .map((b) => ({ url: b.url, pathname: b.pathname }));
  }
  // Dev fallback: read the local uploads folder.
  const { readdir } = await import('fs/promises');
  const path = await import('path');
  const dir = path.join(process.cwd(), 'public', 'uploads');
  const files = await readdir(dir).catch(() => []);
  return files
    .filter((f) => /\.(jpe?g|png|webp|avif|gif)$/i.test(f))
    .reverse()
    .map((f) => ({ url: `/uploads/${f}`, pathname: f }));
}

/** Deletes an uploaded image from storage (Blob in prod, disk in dev). Any
 *  project still using it as a cover will lose it — the caller confirms. */
export async function deleteUploadedImage(url: string): Promise<void> {
  await requireSession();
  if (process.env.BLOB_READ_WRITE_TOKEN && url.startsWith('http')) {
    const { del } = await import('@vercel/blob');
    await del(url);
  } else if (url.startsWith('/uploads/')) {
    const { unlink } = await import('fs/promises');
    const path = await import('path');
    await unlink(path.join(process.cwd(), 'public', url)).catch(() => {});
  }
}

export async function createWorkProject(
  gallery: 'work' | 'art',
  cover?: { url: string; width: number; height: number },
): Promise<string> {
  await requireSession();
  const slug = `untitled-${Date.now()}`;
  const w = 520;
  // Place the new tile in clear space BELOW the existing collage, so it never
  // lands on top of (and visually hides) already-arranged projects.
  const existing = (await getWorkingProjects().catch(() => [])).filter((p) => p.gallery === gallery);
  const maxBottom = existing.reduce(
    (m, p) => Math.max(m, p.y + tileHeightPx(p.w, p.coverW, p.coverH)),
    0,
  );
  const maxZ = existing.reduce((m, p) => Math.max(m, p.z), 0);
  const values: NewProjectRow = {
    slug,
    gallery,
    title: '',
    year: new Date().getFullYear(),
    summary: '',
    status: 'draft',
    x: 60,
    y: existing.length === 0 ? 60 : maxBottom + 60,
    w,
    z: maxZ + 1,
    fit: 'cover',
    coverBlobUrl: cover?.url ?? null,
    coverW: cover?.width ?? null,
    coverH: cover?.height ?? null,
    sortOrder: 9999,
  };
  const row = await createProject(values);
  revalidatePath(`/admin/${gallery}`);
  return row.id;
}

export async function saveProjectMeta(
  id: string,
  fields: {
    title?: string; year?: number; slug?: string; fit?: 'cover' | 'contain'; clickable?: boolean;
    client?: string | null; role?: string | null; summary?: string; description?: string | null;
    coverBlobUrl?: string; coverW?: number; coverH?: number; gallery?: 'work' | 'art';
  },
): Promise<void> {
  await requireSession();
  await updateProjectFields(id, fields);
  revalidatePath('/admin/work');
  revalidatePath('/admin/art');
  revalidatePath('/admin', 'layout'); // light up the "Unpublished changes" badge
}

export async function removeProject(id: string, gallery: 'work' | 'art'): Promise<void> {
  await requireSession();
  await deleteProject(id);
  revalidatePath(`/admin/${gallery}`);
}

export async function saveLayout(
  gallery: 'work' | 'art',
  layout: { id: string; x: number; y: number; w: number; z: number; sortOrder: number }[],
): Promise<void> {
  await requireSession();
  // Width must stay positive; x/y are free (may be negative for edge-bleed).
  const safe = layout.map((t) => ({ ...t, w: Math.max(1, t.w) }));
  await persistLayout(safe);
  revalidatePath(`/admin/${gallery}`);
  revalidatePath('/admin', 'layout'); // refresh the dirty indicator after a layout save
}

export async function addGalleryImage(
  projectId: string,
  img: { url: string; width: number; height: number; alt: string; sortOrder: number },
) {
  await requireSession();
  const row = await addTile({
    projectId,
    blobUrl: img.url,
    width: img.width,
    height: img.height,
    alt: img.alt,
    sortOrder: img.sortOrder,
  });
  revalidatePath('/admin', 'layout'); // refresh the dirty indicator
  return row;
}

export async function updateGalleryImage(tileId: string, fields: { alt: string; caption: string }) {
  await requireSession();
  // Empty caption → null so the public figcaption doesn't render an empty node.
  await updateTile(tileId, { alt: fields.alt, caption: fields.caption.trim() || null });
  revalidatePath('/admin', 'layout');
}

export async function removeGalleryImage(tileId: string) {
  await requireSession();
  await deleteTile(tileId);
  revalidatePath('/admin', 'layout');
}

export async function reorderGalleryImages(orderedIds: string[]) {
  await requireSession();
  await reorderTiles(orderedIds);
  revalidatePath('/admin', 'layout');
}
