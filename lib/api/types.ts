export type ApiMediaType = 'image' | 'video';
export type ApiSort = 'newest' | 'oldest' | 'most_downloaded' | 'most_popular';

/** Row shape returned by GET /api/memes (the joined, flattened list view). */
export type ApiMemeListItem = {
  id: string;
  title: string;
  mediaType: ApiMediaType;
  mediaUrl: string;
  thumbnailUrl: string | null;
  durationSec: number | null;
  width: number | null;
  height: number | null;
  downloadsCount: number;
  likesCount: number;
  createdAt: string; // ISO
  uploaderId: string;
  uploaderUsername: string;
  uploaderAvatarUrl: string | null;
};

export type ApiMemesResponse = {
  memes: ApiMemeListItem[];
  nextCursor: string | null;
};

/** Shape returned by GET /api/memes/:id — includes description and tags, no flattened uploader prefix. */
export type ApiMemeDetail = {
  id: string;
  uploaderId: string;
  title: string;
  description: string | null;
  mediaType: ApiMediaType;
  cloudinaryPublicId: string;
  mediaUrl: string;
  thumbnailUrl: string | null;
  durationSec: number | null;
  width: number | null;
  height: number | null;
  downloadsCount: number;
  likesCount: number;
  createdAt: string;
  uploader: {
    id: string;
    username: string;
    avatarUrl: string | null;
  };
  tags: string[];
};

/** Row shape returned by GET /api/users/:username/memes (unflattened — no uploader fields, since it's implied). */
export type ApiUserMemeItem = {
  id: string;
  uploaderId: string;
  title: string;
  description: string | null;
  mediaType: ApiMediaType;
  cloudinaryPublicId: string;
  mediaUrl: string;
  thumbnailUrl: string | null;
  durationSec: number | null;
  width: number | null;
  height: number | null;
  downloadsCount: number;
  likesCount: number;
  createdAt: string;
};

export type ApiUserProfile = {
  id: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  createdAt: string;
  memeCount: number;
};