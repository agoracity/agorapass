import React from 'react';
import { useEffect, useState } from "react";
import { usePrivy } from '@privy-io/react-auth';
import TwitterLogo from '@/../../public/X.svg'

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader
} from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { User } from '@/types/user';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

import { getAvatar } from './getAvatarImg';
import { BlendIcon } from 'lucide-react';
import Link from 'next/link';
import VouchButtonCustom from '@/components/ui/VouchButtonWithDialog';
import FarcasterLogo from '@/../../public/farcaster.svg'
import Image from 'next/image';
import truncateWallet from '@/utils/truncateWallet'
import displayRanking from '@/utils/displayRanking';

function truncateName(name: string) {
    const maxLength = 30; // Maximum characters to display before truncating
    if (name.length <= maxLength) {
        return name;
    } else {
        return name.slice(0, maxLength) + '…';
    }
}

const UserCard: React.FC<{ user: User }> = ({ user }) => {
    const { name, wallet, bio, twitter, avatarType, rankScore, farcaster } = user;

    const [authStatus, setAuthStatus] = useState(false);
    const { ready, authenticated } = usePrivy();

    useEffect(() => {
        if (ready) {
            setAuthStatus(authenticated);
        }
    }, [ready, authenticated]);

    const displayName = name ? truncateName(name) : truncateWallet(wallet);
    const fullName = name || wallet;
    const displayBio = bio || "";
    const avatar = getAvatar(wallet, avatarType as "metamask" | "blockies");

    return (
        <Card className="w-full flex flex-col">
            <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                <Avatar>
                    {typeof avatar === 'string' ? (
                        <AvatarImage src={avatar} alt="Avatar Image" />
                    ) : (
                        avatar
                    )}
                </Avatar>
                <div>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Link href={'/address/' + wallet}>{displayName}</Link>
                            </TooltipTrigger>
                            <TooltipContent>
                                {fullName}
                            </TooltipContent>
                        </Tooltip>
                        {/* TODO: Add ENS / Address sliced */}
                    </TooltipProvider>

                 {rankScore && (
                       <div className="flex items-center text-sm">
                       <BlendIcon className="mr-1 h-3 w-3" />
                       Rank Score {displayRanking(rankScore?.toString())}
                   </div>
                 )
                 }
                </div>
            </CardHeader>

            <CardDescription>
                {displayBio}
            </CardDescription>

            {/* TODO: Check twitter is connected */}
            <CardContent>
                <div className="flex text-sm text-muted-foreground justify-start mt-auto gap-x-2">
                    {twitter && (
                        <div className="flex items-center">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <a target="_blank" href={'https://x.com/' + twitter}><Image src={TwitterLogo} alt='User with Twitter' className='mx-1 h-4 w-4 ' /></a>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        @{twitter}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                        </div>
                    )}
                    {farcaster && (
                        <div className="flex items-center">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <a target="_blank" href={'https://warpcast.com/' + farcaster}><Image src={FarcasterLogo} alt='Connect with Farcaster' className='mr-1 h-4 w-4' /></a>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        @{farcaster}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    )}
                </div>
            </CardContent>

            <CardFooter className="mt-auto">
                {authStatus && (
                    <div className="ml-auto">
                    <VouchButtonCustom recipient={wallet} authStatus={authStatus} userData={user} />
                    </div>
                )}
            </CardFooter>
        </Card>
    );
}

export default UserCard;
