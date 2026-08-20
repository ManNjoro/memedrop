import { apiFetch } from '../apiClient';
import type { ApiUserProfile, ApiUserMemeItem } from './types';

/** GET /api/users/:username — public, no token required. Used for both own Profile tab and Creator Profile. */
export async function fetchUserProfile(username: string): Promise<ApiUserProfile> {
  return apiFetch<ApiUserProfile>(`/api/users/${encodeURIComponent(username)}`);
}

/** GET /api/users/:username/memes — public, no token required. */
export async function fetchUserMemes(username: string): Promise<{ memes: ApiUserMemeItem[] }> {
  return apiFetch<{ memes: ApiUserMemeItem[] }>(`/api/users/${encodeURIComponent(username)}/memes`);
}