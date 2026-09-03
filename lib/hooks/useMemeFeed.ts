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

    queryFn: async ({ pageParam }) => {
      const page = await fetchMemes({
        ...params,
        cursor: pageParam ?? undefined,
      });

      // Default a missing or reshaped list to an empty array so every page
      // exposes a real `memes` array. Consumers flatten `page.memes`, so a
      // bad response shape degrades to the empty state instead of a crash.
      return {
        ...page,
        memes: Array.isArray(page.memes) ? page.memes : [],
      };
    },

    initialPageParam: null as string | null,

    getNextPageParam: (lastPage) =>
      lastPage.nextCursor ?? undefined,

    enabled,

    staleTime: 30_000,

    retry: 2,
  });
}
