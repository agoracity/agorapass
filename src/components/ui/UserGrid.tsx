"use client"
import React, { useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { UserCard } from './UserCard';
import { useInView } from 'react-intersection-observer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface User {
  wallet: string;
  bio?: string;
  twitter?: string;
  farcaster?: string;
  name?: string;
}

interface UserGridProps {
  communityData: any;
}

export function UserGrid({ communityData }: UserGridProps) {
  const { ref, inView } = useInView();

  const fetchUsers = async ({ pageParam = 1 }) => {
    const response = await fetch(`/api/users?page=${pageParam}&limit=12`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isError,
    error,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage]);

  if (isError) return <div>Error: {(error as Error).message}</div>;

  return (
    <div className='flex flex-col w-full p-4'>
      <div className='flex flex-col justify-center'>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 p-4">
          {isLoading ? (
            Array(12).fill(null).map((_, index) => (
              <Skeleton key={index} className="h-[200px] w-full" />
            ))
          ) : (
            data?.pages.map((page, pageIndex) => (
              <React.Fragment key={pageIndex}>
                {page.users.map((user: User) => (
                  <UserCard
                    key={user.wallet}
                    recipient={user.wallet}
                    communityData={communityData}
                    bio={user.bio}
                    twitter={user.twitter}
                    farcaster={user.farcaster}
                    name={user.name}
                  />
                ))}
              </React.Fragment>
            ))
          )}
        </div>
        {hasNextPage && (
          <div ref={ref} className="flex justify-center mt-4">
            {isFetchingNextPage ? (
              <Skeleton className="h-10 w-[200px]" />
            ) : (
              <Button onClick={() => fetchNextPage()}>Load More</Button>
            )}
          </div>
        )}
        {!hasNextPage && data?.pages[0].users.length === 0 && (
          <div>No users found</div>
        )}
      </div>
    </div>
  );
}