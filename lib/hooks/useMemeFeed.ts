import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchMemes, type FetchMemesParams } from '../api/memes';
import type { ApiMemeListItem } from '../api/types';
import { ApiClientError } from '../apiClient';

type UseMemeFeedResult = {
  memes: ApiMemeListItem[];
  loading: boolean; // true only on the initial load / param change, not on refresh or loadMore
  refreshing: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  refresh: () => void;
  loadMore: () => void;
};

/**
 * Fetches a meme feed for the given params and re-fetches whenever they
 * change (e.g. a new search query, a different category/sort). Shared by
 * Home, Explore's trending grid, and Search Results so each screen only
 * has to describe *what* it wants, not how to load/paginate it.
 */
export function useMemeFeed(params: FetchMemesParams, options: { enabled?: boolean } = {}): UseMemeFeedResult {
  const enabled = options.enabled ?? true;
  const [memes, setMemes] = useState<ApiMemeListItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(enabled);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Serialize params so the effect only re-runs on meaningful changes, not
  // a new object identity from the caller re-rendering.
  const paramsKey = JSON.stringify(params);
  const requestId = useRef(0);

  const load = useCallback(
    async (mode: 'initial' | 'refresh') => {
      if (!enabled) return;
      const thisRequest = ++requestId.current;
      mode === 'initial' ? setLoading(true) : setRefreshing(true);
      setError(null);

      try {
        const result = await fetchMemes({ ...params, cursor: undefined });
        if (thisRequest !== requestId.current) return; // a newer request superseded this one
        setMemes(result.memes);
        setCursor(result.nextCursor);
        setHasMore(result.nextCursor !== null);
      } catch (e) {
        if (thisRequest !== requestId.current) return;
        setError(e instanceof ApiClientError ? e.message : 'Couldn\u2019t load memes. Check your connection.');
      } finally {
        if (thisRequest === requestId.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [paramsKey, enabled]
  );

  useEffect(() => {
    load('initial');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey, enabled]);

  const refresh = useCallback(() => load('refresh'), [load]);

  const loadMore = useCallback(async () => {
    if (!enabled || loadingMore || loading || !hasMore || !cursor) return;
    setLoadingMore(true);
    try {
      const result = await fetchMemes({ ...params, cursor });
      setMemes((prev) => [...prev, ...result.memes]);
      setCursor(result.nextCursor);
      setHasMore(result.nextCursor !== null);
    } catch {
      // Silently ignore pagination errors — the person can pull-to-refresh instead
      // of surfacing a disruptive error for a "load more" that failed mid-scroll.
    } finally {
      setLoadingMore(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey, cursor, hasMore, loadingMore, loading, enabled]);

  return { memes, loading, refreshing, loadingMore, error, hasMore, refresh, loadMore };
}