import type { Meme } from '../components/MediaCard';
import type { ApiMemeListItem, ApiMemeDetail, ApiUserMemeItem } from './api/types';
import { formatRelativeTime } from './formatRelativeTime';

function aspectRatioFrom(width: number | null, height: number | null, fallback = 0.85): number {
  if (width && height && height > 0) return width / height;
  return fallback;
}

/** GET /api/memes list items already carry uploader fields flattened in. */
export function toCardMeme(item: ApiMemeListItem): Meme {
  return {
    id: item.id,
    title: item.title,
    // MediaCard renders a static preview either way (video gets a play
    // overlay drawn on top) — use the poster for videos, the image itself otherwise.
    mediaUrl: item.mediaType === 'video' ? item.thumbnailUrl ?? item.mediaUrl : item.mediaUrl,
    mediaType: item.mediaType,
    durationSec: item.durationSec ?? undefined,
    creatorName: item.uploaderUsername,
    creatorAvatar: item.uploaderAvatarUrl,
    uploadedAt: formatRelativeTime(item.createdAt),
    aspectRatio: aspectRatioFrom(item.width, item.height),
  };
}

/** GET /api/users/:username/memes items don't carry uploader fields — pass the known username in. */
export function toCardMemeFromUserItem(item: ApiUserMemeItem, username: string, avatarUrl?: string | null): Meme {
  return {
    id: item.id,
    title: item.title,
    mediaUrl: item.mediaType === 'video' ? item.thumbnailUrl ?? item.mediaUrl : item.mediaUrl,
    mediaType: item.mediaType,
    durationSec: item.durationSec ?? undefined,
    creatorName: username,
    creatorAvatar: avatarUrl ?? null,
    uploadedAt: formatRelativeTime(item.createdAt),
    aspectRatio: aspectRatioFrom(item.width, item.height),
  };
}

/** GET /api/memes/:id detail shape, for the featured card on Home which reuses MediaCard's fields loosely. */
export function toCardMemeFromDetail(detail: ApiMemeDetail): Meme {
  return {
    id: detail.id,
    title: detail.title,
    mediaUrl: detail.mediaType === 'video' ? detail.thumbnailUrl ?? detail.mediaUrl : detail.mediaUrl,
    mediaType: detail.mediaType,
    durationSec: detail.durationSec ?? undefined,
    creatorName: detail.uploader.username,
    creatorAvatar: detail.uploader.avatarUrl,
    uploadedAt: formatRelativeTime(detail.createdAt),
    aspectRatio: aspectRatioFrom(detail.width, detail.height),
  };
}