import { useInfiniteQuery } from '@tanstack/react-query';

const fetchRankings = async ({ pageParam = 1, queryKey }: any) => {
    const [, sortOrder, searchQuery] = queryKey;
    const queryString = new URLSearchParams({ page: String(pageParam), limit: '12', sortOrder, searchQuery }).toString();
    const response = await fetch(`/api/rankings?${queryString}`);
    return response.json();
};

const useRankings = (sortOrder: 'asc' | 'desc', searchQuery: string) => {
    return useInfiniteQuery({
        queryKey: ['rankings', sortOrder, searchQuery],
        queryFn: fetchRankings,
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            return lastPage.hasMore ? lastPage.nextPage : undefined;
        },
    });
};

export default useRankings;
