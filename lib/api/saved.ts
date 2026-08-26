import { apiFetch } from '../apiClient';
import type { ApiMemeListItem } from './types';

/** GET /api/saved — auth required. Returns the signed-in viewer's saved memes (not paginated — no nextCursor). */
export async function fetchSavedMemes(token: string | null): Promise<{ memes: ApiMemeListItem[] }> {
  return apiFetch<{ memes: ApiMemeListItem[] }>('/api/saved', { token });
}