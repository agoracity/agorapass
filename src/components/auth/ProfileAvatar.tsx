"use client";

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { usePrivy, useLogin } from '@privy-io/react-auth';
import Link from 'next/link';
import { Wallet, ChevronDown } from 'lucide-react';
import createUser from '@/utils/createUser';
import Swal from 'sweetalert2';
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { getAvatar } from '../ui/users/getAvatarImg';
import { useFetchUserProfile } from '@/hooks/useFetchUser';
import ZupassButton from '../layout/ZupassButton';
import Image from 'next/image';
import ZupassLogo from '@/../../public/zupass.webp';
import ShinyButton from '../ui/ShinyButton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import dynamic from 'next/dynamic';
const DynamicWrapper = dynamic(() => import('@/components/zupass/components/Wrapper'), {
    ssr: false,
    loading: () => <p>Loading...</p>
  });

const ProfileAvatar = () => {
    const [updateTrigger, setUpdateTrigger] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { data, isLoading, error } = useFetchUserProfile(updateTrigger);
    const { authenticated, logout, ready, user } = usePrivy();

    const wallet = data?.wallet || user?.wallet?.address || 'Unknown';
    const avatarType = data?.avatarType || 'blockies';
    const zupassUser = data?.Zupass && data.Zupass.length > 0 ? data.Zupass[0] : null;
    const isClient = typeof window !== 'undefined';

    useEffect(() => {
        if (authenticated && user) {
            setUpdateTrigger(prev => !prev);
        }
    }, [authenticated, user]);

    useEffect(() => {
        if (data && data.rankScore > 0.25 && (!data.podUrl || data.podUrl === '')) {
            console.log("podConnected is false");
            setIsDialogOpen(true);
        }
    }, [data]);

    const avatar = useMemo(() => isClient ? getAvatar(wallet, avatarType) : null, [wallet, avatarType, isClient]);
    const handleNewUserCreation = useCallback(async (user: any) => {
        Swal.fire({
            title: 'Creating user...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            await createUser(user);
            Swal.fire({
                icon: 'success',
                title: 'User created successfully!',
                showConfirmButton: false,
                timer: 1500
            }).then(() => window.location.reload());
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to create user. Please try again.'
            });
        }
    }, []);

    const { login } = useLogin({
        onComplete: async (user, isNewUser) => {
            if (isNewUser) await handleNewUserCreation(user);
        },
        onError: () => {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Login failed. Please try again.'
            });
        },
    });

    const disableLogin = !ready || authenticated;

    const [showWrapper, setShowWrapper] = useState(false);

    return (
        <>
            {authenticated ? (
                <>
                    {/* Mobile view */}
                    <div className="lg:hidden">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="secondary" className="px-2 font-bold mr-1 flex items-center" asChild>
                                    <div className="flex items-center space-x-2">
                                        <Image src={ZupassLogo} alt="Zupass logo" className="w-6 h-6 rounded-full flex-shrink-0" />
                                        <ChevronDown className="w-5 h-5 flex-shrink-0" />
                                    </div>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="flex flex-column justify-center items-center">
                                <DropdownMenuItem>
                                    <ZupassButton user={user}>
                                    </ZupassButton>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Desktop view */}
                    <div className="hidden lg:block px-2">
                        <ZupassButton user={user}>
                        </ZupassButton>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="icon" className="rounded-full">
                                <Avatar className="w-9 h-9 mx-auto ">
                                    {typeof avatar === 'string' ? (
                                        <AvatarImage src={avatar} alt="Avatar Image" />
                                    ) : (
                                        avatar
                                    )}
                                </Avatar>
                                <span className="sr-only">Toggle user menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link href='/me' className='cursor-pointer'>My Profile</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <a href={"mailto:" + process.env.NEXT_PUBLIC_MAIL_SUPPORT} className='cursor-pointer'>Support</a>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={logout} className='cursor-pointer'>
                                Log out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </>
            ) : (
                <ShinyButton onClick={login}>
                    <p className='flex items-center flex-row whitespace-nowrap'>Sign in <Wallet className='h-5 w-5 ml-2' /></p>
                </ShinyButton>
            )}
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Congratulations!</DialogTitle>
                    </DialogHeader>
                    <p>You can now generate your own AgoraPass!</p>
                    {!showWrapper ? (
                        <Button onClick={() => setShowWrapper(true)}>
                            Connect to Zupass
                        </Button>
                    ) : (
                       <>
                        <DynamicWrapper wallet={wallet} />
                        Once added to Zupass, you can close this window.
                       </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ProfileAvatar;
