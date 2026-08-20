import { useCallback, useEffect, useState } from 'react';
import { fetchUserProfile, fetchUserMemes } from '../api/users';
import type { ApiUserProfile, ApiUserMemeItem } from '../api/types';
import { ApiClientError } from '../apiClient';

type Result = {
  profile: ApiUserProfile | null;
  memes: ApiUserMemeItem[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

/** Fetches a user's public profile + their uploads together — used by both the signed-in Profile tab and the public Creator Profile screen. */
export function useUserWithMemes(username: string | undefined): Result {
  const [profile, setProfile] = useState<ApiUserProfile | null>(null);
  const [memes, setMemes] = useState<ApiUserMemeItem[]>([]);
  const [loading, setLoading] = useState(!!username);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!username) return;
    setLoading(true);
    setError(null);
    try {
      const [profileRes, memesRes] = await Promise.all([fetchUserProfile(username), fetchUserMemes(username)]);
      setProfile(profileRes);
      setMemes(memesRes.memes);
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : 'Couldn\u2019t load this profile.');
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    load();
  }, [load]);

  return { profile, memes, loading, error, refresh: load };
}