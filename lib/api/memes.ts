import { apiFetch } from '../apiClient';
import type { ApiMediaType, ApiMemesResponse, ApiMemeDetail, ApiSort } from './types';

export type FetchMemesParams = {
  q?: string;
  mediaType?: ApiMediaType;
  sort?: ApiSort;
  cursor?: string | null;
  limit?: number;
};

/** GET /api/memes — powers Home, Explore's trending grid, and Search Results. Public, no token required. */
export async function fetchMemes(params: FetchMemesParams = {}): Promise<ApiMemesResponse> {
  const search = new URLSearchParams();
  if (params.q) search.set('q', params.q);
  if (params.mediaType) search.set('mediaType', params.mediaType);
  if (params.sort) search.set('sort', params.sort);
  if (params.cursor) search.set('cursor', params.cursor);
  if (params.limit) search.set('limit', String(params.limit));

  const qs = search.toString();
  return apiFetch<ApiMemesResponse>(`/api/memes${qs ? `?${qs}` : ''}`);
}

/**
 * GET /api/memes/:id — public, but pass a token when the viewer is signed
 * in so isLiked/isSaved reflect their actual state (the endpoint doesn't
 * require auth, but does use it opportunistically when present).
 */
export async function fetchMemeById(id: string, token: string | null = null): Promise<ApiMemeDetail> {
  return apiFetch<ApiMemeDetail>(`/api/memes/${id}`, { token });
}

/** POST /api/memes/:id/download — fire-and-forget counter bump, public. */
export async function recordDownload(id: string): Promise<{ downloadsCount: number }> {
  return apiFetch<{ downloadsCount: number }>(`/api/memes/${id}/download`, { method: 'POST' });
}

/** POST /api/memes/:id/view — fire-and-forget counter bump, public. */
export async function recordView(id: string): Promise<{ viewsCount: number }> {
  return apiFetch<{ viewsCount: number }>(`/api/memes/${id}/view`, { method: 'POST' });
}

/** POST/DELETE /api/memes/:id/like — auth required, idempotent either way. */
export async function likeMeme(id: string, token: string | null): Promise<{ liked: boolean; likesCount: number }> {
  return apiFetch(`/api/memes/${id}/like`, { method: 'POST', token });
}
export async function unlikeMeme(id: string, token: string | null): Promise<{ liked: boolean; likesCount: number }> {
  return apiFetch(`/api/memes/${id}/like`, { method: 'DELETE', token });
}

/** POST/DELETE /api/memes/:id/save — auth required, idempotent either way. */
export async function saveMeme(id: string, token: string | null): Promise<{ saved: boolean }> {
  return apiFetch(`/api/memes/${id}/save`, { method: 'POST', token });
}
export async function unsaveMeme(id: string, token: string | null): Promise<{ saved: boolean }> {
  return apiFetch(`/api/memes/${id}/save`, { method: 'DELETE', token });
}

/** DELETE /api/memes/:id — auth required, only the uploader can delete their own meme. */
export async function deleteMeme(id: string, token: string | null): Promise<void> {
  await apiFetch<void>(`/api/memes/${id}`, { method: 'DELETE', token });
}