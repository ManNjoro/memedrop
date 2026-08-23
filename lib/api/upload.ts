import { apiFetch } from '../apiClient';
import type { UploadSignature } from '../cloudinaryUpload';

/** POST /api/upload/signature — auth required. */
export async function fetchUploadSignature(
  mediaType: 'image' | 'video',
  token: string | null
): Promise<UploadSignature> {
  return apiFetch<UploadSignature>('/api/upload/signature', {
    method: 'POST',
    token,
    body: { mediaType },
  });
}

/**
 * POST /api/upload/cleanup — auth required. Call this when a Cloudinary
 * upload succeeded but the follow-up POST /api/memes (saving it to Neon)
 * failed, so the now-orphaned asset gets deleted instead of sitting in
 * Cloudinary forever with nothing pointing to it. Best-effort: failures
 * here are worth logging but shouldn't block showing the person their
 * actual upload error.
 */
export async function cleanupOrphanedUpload(
  publicId: string,
  mediaType: 'image' | 'video',
  token: string | null
): Promise<void> {
  await apiFetch<void>('/api/upload/cleanup', {
    method: 'POST',
    token,
    body: { publicId, mediaType },
  });
}