import { useCallback, useState } from 'react';
import { useAuth } from '@clerk/expo';
import { fetchSavedMemes } from '../api/saved';
import type { ApiMemeListItem } from '../api/types';
import { ApiClientError } from '../apiClient';

type Result = {
  memes: ApiMemeListItem[];
  loading: boolean;
  error: string | null;
  loaded: boolean;
  refresh: () => void;
};

/**
 * Fetches the signed-in user's saved memes on demand (call load() rather
 * than fetching automatically on mount) — used by the Profile screen's
 * Saved tab, which shouldn't do this network round trip until the person
 * actually taps that tab.
 */
export function useSavedMemes(): Result & { load: () => void } {
  const { getToken, isSignedIn } = useAuth();
  const [memes, setMemes] = useState<ApiMemeListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    if (!isSignedIn) return;
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const result = await fetchSavedMemes(token);
      setMemes(result.memes);
      setLoaded(true);
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : 'Couldn\u2019t load your saved memes.');
    } finally {
      setLoading(false);
    }
  }, [isSignedIn, getToken]);

  return { memes, loading, error, loaded, refresh: load, load };
}