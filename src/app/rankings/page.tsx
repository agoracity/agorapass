"use client";
import React, { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';
import useRankings from '@/hooks/useRankings';
import { Button } from '@/components/ui/button';
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import {
    Command,
    CommandGroup,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Avatar } from "@/components/ui/avatar";
import { CardHeader } from "@/components/ui/card";
import { MetaMaskAvatar } from 'react-metamask-avatar';
import truncateWallet from '@/utils/truncateWallet';
import { BlendIcon } from 'lucide-react';
import { normalizeAddress } from '@/utils/normalizeAddress';
import { usePrivy } from '@privy-io/react-auth';

const filters = [
    { valueFilter: "desc", label: "Order by: Desc" },
    { valueFilter: "asc", label: "Order by: Asc" },
];

function Page() {
    const [openFilter, setOpenFilter] = useState(false);
    const [valueFilter, setValueFilter] = useState<'asc' | 'desc'>("asc");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const { user } = usePrivy();
    console.log('user', user?.wallet?.address);
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useRankings(valueFilter, searchQuery);
    const { ref, inView } = useInView();

    useEffect(() => {
        const handleFetchNextPage = () => {
            if (inView && hasNextPage) {
                fetchNextPage();
            }
        };

        const debounceFetch = debounce(handleFetchNextPage, 300);
        debounceFetch();

        return () => {
            debounceFetch.cancel();
        };
    }, [inView, fetchNextPage, hasNextPage]);

    const getEmoji = (position: number) => {
        if (position == 1) return '🥇';
        if (position == 2) return '🥈';
        if (position == 3) return '🥉';
        return '🇦 ';
    }

    return (
        <div className='flex flex-col w-full p-4'>
            <div className='flex flex-row font-semibold justify-center items-center'>
                <p>Wanna see who vouched for who and when?
                    <Link href='/vouches' className='font-bold text-blue-600 hover:underline ml-0.5'>Check the vouch history</Link>
                </p>
            </div>
            <div className='flex flex-col md:flex-row md:justify-center md:items-center gap-4 p-4'>
                <Popover open={openFilter} onOpenChange={setOpenFilter}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openFilter}
                            className="w-[200px] justify-between"
                        >
                            {valueFilter
                                ? filters.find((filter) => filter.valueFilter === valueFilter)?.label
                                : "Order by:"}
                            <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                        <Command>
                            <CommandList>
                                <CommandGroup>
                                    {filters.map((filter) => (
                                        <CommandItem
                                            key={filter.valueFilter}
                                            value={filter.valueFilter}
                                            onSelect={(currentValueFilter) => {
                                                setValueFilter(currentValueFilter as 'asc' | 'desc');
                                                setOpenFilter(false);
                                            }}
                                        >
                                            {filter.label}
                                            <CheckIcon
                                                className={cn(
                                                    "ml-auto h-4 w-4",
                                                    valueFilter === filter.valueFilter ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>

            <div className='gap-6 p-4'>
                {isLoading ? (
                    Array.from({ length: 12 }).map((_, key) => (
                        <motion.div
                            key={key}
                            className="bg-white shadow rounded-lg p-4"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Skeleton className="h-4 w-[250px] mb-2" />
                            <Skeleton className="h-4 w-[200px]" />
                        </motion.div>
                    ))
                ) : (
                    data?.pages.flatMap((page, i) =>
                        page.rankings.map((ranking: any) => {
                            const isCurrentUser = normalizeAddress(user?.wallet?.address ?? '') === normalizeAddress(ranking.address);

                            return (
                                <motion.div
                                    key={ranking.id}
                                    className={cn(
                                        isCurrentUser ? "bg-green-100" : "bg-white"
                                    )}
                                    // whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    style={{
                                        position: 'relative',
                                    }}
                                >
                                    <CardHeader className="flex flex-row items-center justify-center gap-4 space-y-2">
                                        <div className="flex items-center text-lg text-gray-500 mt-1">
                                            {getEmoji(ranking.position)} {ranking.position}
                                        </div>

                                        <Avatar>
                                            <MetaMaskAvatar address={normalizeAddress(ranking.address)} size={100} className='!w-full !h-full' />
                                        </Avatar>
                                        <div className="flex flex-col items-center">
                                            <Link href={'/address/' + normalizeAddress(ranking.address)} className="text-lg font-semibold">
                                                {truncateWallet(normalizeAddress(ranking.address))}
                                            </Link>
                                            {isCurrentUser && (
                                                <div className="text-green-600 font-bold">
                                                    This is you!
                                                </div>
                                            )}
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            asChild
                                        >
                                            <Link href={'/address/' + normalizeAddress(ranking.address)}>View</Link>
                                        </Button>
                                    </CardHeader>
                                </motion.div>
                            );
                        })
                    )
                )}
            </div>

            <div ref={ref}>
                {isFetchingNextPage && (
                    <div className="flex items-start justify-start space-x-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-[250px]" />
                            <Skeleton className="h-4 w-[200px]" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Debounce function implementation
function debounce(func: (...args: any[]) => void, wait: number) {
    let timeout: NodeJS.Timeout | null;
    const debounced = (...args: any[]) => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(null, args);
        }, wait);
    };
    debounced.cancel = () => {
        if (timeout) clearTimeout(timeout);
    };
    return debounced;
}

export default Page;
