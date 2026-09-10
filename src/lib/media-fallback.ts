import fs from 'fs/promises';
import path from 'path';
import { MediaItem, AddMediaPayload } from '@/types/media';

const FALLBACK_DIR = path.join(process.cwd(), 'docs', 'data');
const FALLBACK_FILE = path.join(FALLBACK_DIR, 'media-library-fallback.json');
const DELETED_URLS_FILE = path.join(FALLBACK_DIR, 'deleted-media-urls.json');

async function ensureFileExists(filepath: string, defaultContent = '[]') {
  try {
    await fs.mkdir(FALLBACK_DIR, { recursive: true });
    await fs.access(filepath);
  } catch {
    await fs.writeFile(filepath, defaultContent, 'utf-8');
  }
}

export async function getFallbackMediaItems(): Promise<MediaItem[]> {
  try {
    await ensureFileExists(FALLBACK_FILE);
    const content = await fs.readFile(FALLBACK_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function addFallbackMediaItem(payload: AddMediaPayload): Promise<MediaItem> {
  await ensureFileExists(FALLBACK_FILE);
  const list = await getFallbackMediaItems();
  const newItem: MediaItem = {
    id: `local-${Date.now()}`,
    title: payload.title.trim() || 'Ảnh liên kết',
    url: payload.url.trim(),
    category: payload.category || 'custom',
    source: 'Thư viện link (Bộ nhớ dự phòng)',
    createdAt: new Date().toISOString(),
    isDeletable: true,
  };
  list.unshift(newItem);
  await fs.writeFile(FALLBACK_FILE, JSON.stringify(list, null, 2), 'utf-8');
  return newItem;
}

export async function deleteFallbackMediaItem(id: string): Promise<boolean> {
  try {
    await ensureFileExists(FALLBACK_FILE);
    const list = await getFallbackMediaItems();
    const filtered = list.filter((it) => it.id !== id);
    await fs.writeFile(FALLBACK_FILE, JSON.stringify(filtered, null, 2), 'utf-8');
    return true;
  } catch {
    return false;
  }
}

export async function getDeletedMediaUrls(): Promise<Set<string>> {
  try {
    await ensureFileExists(DELETED_URLS_FILE);
    const content = await fs.readFile(DELETED_URLS_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

export async function recordDeletedMediaUrl(url: string): Promise<void> {
  try {
    if (!url) return;
    await ensureFileExists(DELETED_URLS_FILE);
    const deletedSet = await getDeletedMediaUrls();
    deletedSet.add(url);
    await fs.writeFile(
      DELETED_URLS_FILE,
      JSON.stringify(Array.from(deletedSet), null, 2),
      'utf-8'
    );
  } catch (err) {
    console.error('Lỗi khi lưu url ảnh đã xóa:', err);
  }
}
