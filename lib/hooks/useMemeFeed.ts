import { useInfiniteQuery } from '@tanstack/react-query';
import {
  fetchMemes,
  type FetchMemesParams,
} from '../api/memes';

export function useMemeFeed(
  params: FetchMemesParams,
  options: { enabled?: boolean } = {},
) {
  const enabled = options.enabled ?? true;

  return useInfiniteQuery({
    queryKey: ['memes', 'feed', params],

    queryFn: ({ pageParam }) =>
      fetchMemes({
        ...params,
        cursor: pageParam ?? undefined,
      }),

    initialPageParam: null as string | null,

    getNextPageParam: (lastPage) =>
      lastPage.nextCursor ?? undefined,

    enabled,

    staleTime: 30_000,

    retry: 2,
  });
}