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

/** GET /api/memes/:id — public, no token required. */
export async function fetchMemeById(id: string): Promise<ApiMemeDetail> {
  return apiFetch<ApiMemeDetail>(`/api/memes/${id}`);
}

/** POST /api/memes/:id/download — fire-and-forget counter bump, public. */
export async function recordDownload(id: string): Promise<{ downloadsCount: number }> {
  return apiFetch<{ downloadsCount: number }>(`/api/memes/${id}/download`, { method: 'POST' });
}