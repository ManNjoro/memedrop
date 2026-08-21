import { apiFetch } from '../apiClient';
import type { ApiUserProfile, ApiUserMemeItem } from './types';

/**
 * POST /api/users/sync — upserts the signed-in user's row into Neon from
 * their Clerk record. Call this right after sign-up (and it doesn't hurt to
 * call it after sign-in too) so the row exists immediately, rather than
 * waiting on the Clerk webhook which can lag behind the client redirect.
 */
export async function syncUser(token: string | null): Promise<ApiUserProfile> {
  return apiFetch<ApiUserProfile>('/api/users/sync', { method: 'POST', token });
}

/** GET /api/users/:username — public, no token required. Used for both own Profile tab and Creator Profile. */
export async function fetchUserProfile(username: string): Promise<ApiUserProfile> {
  return apiFetch<ApiUserProfile>(`/api/users/${encodeURIComponent(username)}`);
}

/** GET /api/users/:username/memes — public, no token required. */
export async function fetchUserMemes(username: string): Promise<{ memes: ApiUserMemeItem[] }> {
  return apiFetch<{ memes: ApiUserMemeItem[] }>(`/api/users/${encodeURIComponent(username)}/memes`);
}