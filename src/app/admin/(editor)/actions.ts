'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { destroySession } from '@/lib/auth/session';
import { requireSession } from '@/lib/auth/require';
import { publish, upsertSiteContent, createProject, updateProjectFields, deleteProject, updateGrid as persistGrid } from '@/db/queries';
import { storeImage } from '@/lib/storage/upload';
import { clampCol, clampSpan } from '@/lib/grid';
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

export async function createWorkProject(gallery: 'work' | 'art'): Promise<string> {
  await requireSession();
  const slug = `untitled-${Date.now()}`;
  const values: NewProjectRow = {
    slug,
    gallery,
    title: 'Untitled',
    year: new Date().getFullYear(),
    categories: [],
    summary: '',
    status: 'draft',
    col: 0,
    row: 0,
    colSpan: 4,
    rowSpan: 1,
    z: 0,
    sortOrder: 9999,
  };
  const row = await createProject(values);
  revalidatePath(`/admin/${gallery}`);
  return row.id;
}

export async function saveProjectMeta(
  id: string,
  fields: {
    title?: string; year?: number; slug?: string; categories?: string[];
    client?: string | null; role?: string | null; summary?: string; description?: string | null;
    coverBlobUrl?: string; coverW?: number; coverH?: number; gallery?: 'work' | 'art';
  },
): Promise<void> {
  await requireSession();
  await updateProjectFields(id, fields);
  revalidatePath('/admin/work');
  revalidatePath('/admin/art');
}

export async function removeProject(id: string, gallery: 'work' | 'art'): Promise<void> {
  await requireSession();
  await deleteProject(id);
  revalidatePath(`/admin/${gallery}`);
}

export async function saveGrid(
  gallery: 'work' | 'art',
  layout: { id: string; col: number; row: number; colSpan: number; rowSpan: number; z: number; sortOrder: number }[],
): Promise<void> {
  await requireSession();
  const safe = layout.map((t) => {
    const colSpan = clampSpan(t.colSpan);
    return { ...t, colSpan, col: clampCol(t.col, colSpan), rowSpan: Math.max(1, t.rowSpan) };
  });
  await persistGrid(safe);
  revalidatePath(`/admin/${gallery}`);
  revalidatePath('/admin', 'layout'); // refresh the dirty indicator after a layout save
}
