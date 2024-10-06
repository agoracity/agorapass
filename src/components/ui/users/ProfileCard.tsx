import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getAvatar } from './getAvatarImg';
import { motion } from "framer-motion";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@radix-ui/react-tooltip";
import { DateTime } from "luxon";
import { copyToClipboard } from '@/utils/copyToClipboard';
import Image from 'next/image';
import TwitterLogo from '@/../../public/X.svg'
import FarcasterLogo from '@/../../public/farcaster.svg'
import { usePrivy, useLinkAccount } from '@privy-io/react-auth';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import LinkedButton from './LinkedButton';
import UnlinkAccounts from './UnlinkAccounts';
import truncateWallet from '@/utils/truncateWallet'
import { useContract } from '@/hooks/useContract';
const ShareProfile = lazy(() => import('./ShareProfile'));


const MySwal = withReactContent(Swal);

export const FormSchema = z.object({
    username: z.string().max(20, { message: "Username must not be longer than 20 characters" }),
    bio: z.string().max(160, { message: "Bio must not be longer than 160 characters." }).optional(),
});

interface ProfileCardProps {
    data: any;
    onSubmit: (data: z.infer<typeof FormSchema>) => void;
}

export function ProfileCard({ data, onSubmit }: ProfileCardProps) {
    const { user, unlinkTwitter, unlinkFarcaster, getAccessToken } = usePrivy();
    const { getCurrentSeason, getVouchingSeason, getAccountVouches } = useContract();
    const [vouchesAvailable, setVouchesAvailable] = useState<number | null>(null);
    const [remainingTime, setRemainingTime] = useState('');

    const { linkTwitter, linkFarcaster } = useLinkAccount({
        onSuccess: (user, linkMethod, linkedAccount) => {

            getAccessToken()
                .then((token) => {
                    // Prepara los datos para la solicitud
                    Swal.showLoading();
                    const requestData = {
                        //@ts-expect-error it doesnt exist in the type, but is returned
                        twitter: linkMethod === 'twitter' ? linkedAccount.username : undefined,
                        //@ts-expect-error it doesnt exist in the type, but is returned
                        farcaster: linkMethod === 'farcaster' ? linkedAccount.username : undefined,
                    };

                    // Enviar la solicitud PATCH al endpoint
                    return fetch('/api/user/linkAccount', {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                        body: JSON.stringify(requestData),
                    });
                })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Failed to update user data');
                    }
                    return response.json();
                })
                .then((updatedUser) => {
                    // console.log('User updated successfully', updatedUser);
                    MySwal.fire({
                        icon: 'success',
                        title: 'Success!',
                        text: 'User updated successfully.',
                    })
                })
                .catch((error) => {
                    console.error('Error linking account:', error);
                    MySwal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: 'Something went wrong. Try reloading the page.',
                    });
                });
        },
        onError: (error) => {
            console.log(error);
            // Cualquier lógica adicional en caso de error
        },
    });


    const { email, wallet, vouchesAvailables, createdAt, vouchReset, name, bio, Zupass } = data || {};
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const formattedDate = DateTime.fromISO(createdAt).toLocaleString(DateTime.DATE_FULL);
    const vouchResetDate = DateTime.fromISO(vouchReset);

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: { username: name || "", bio: bio || "" },
    });

    useEffect(() => {
        form.reset({ username: name || "", bio: bio || "" });
    }, [name, bio, form]);

    useEffect(() => {
        const fetchSeasonInfo = async () => {
            try {
                const currentSeason = await getCurrentSeason();
                if (currentSeason !== null && wallet) {
                    const seasonInfo = await getVouchingSeason(currentSeason);
                    const accountVouchesInfo = await getAccountVouches(wallet, currentSeason);
                    
                    if (seasonInfo && accountVouchesInfo) {
                        const maxVouches = Number(seasonInfo.maxAccountVouches);
                        setVouchesAvailable(maxVouches - accountVouchesInfo.totalVouches);

                        // Set up timer for remaining time
                        const endTimestamp = Number(seasonInfo.endTimestamp) * 1000; // Convert to milliseconds
                        const updateRemainingTime = () => {
                            const now = DateTime.now();
                            const end = DateTime.fromMillis(endTimestamp);
                            const diff = end.diff(now, ['days', 'hours', 'minutes']);
                            
                            if (diff.as('milliseconds') <= 0) {
                                setRemainingTime('Season ended');
                            } else {
                                const { days = 0, hours = 0, minutes = 0 } = diff.toObject();
                                setRemainingTime(`${Math.floor(days)}d ${Math.floor(hours)}h ${Math.floor(minutes)}m`);
                            }
                        };

                        updateRemainingTime();
                        const intervalId = setInterval(updateRemainingTime, 60000); // Update every minute

                        return () => clearInterval(intervalId);
                    }
                }
            } catch (error) {
                console.error('Error fetching season info:', error);
            }
        };

        fetchSeasonInfo();
    }, [wallet, getCurrentSeason, getVouchingSeason, getAccountVouches]);


    const handleFormSubmit = (data: z.infer<typeof FormSchema>) => {
        onSubmit(data);
        setIsDialogOpen(false);
    };

    // Check if data is available before rendering the avatar
    if (!wallet) {
        return <div>Loading...</div>;
    }

    const avatar = getAvatar(wallet, "w-20 h-20")

    const handleCopy = () => {
        copyToClipboard(wallet);
    };

    const handleLinkTwitterClick = () => {
        MySwal.fire({
            title: 'Are you sure?',
            text: "You are about to link your X account. This will redirect you to X.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, link it!'
        }).then((result) => {
            if (result.isConfirmed) {
                linkTwitter();
            }
        });
    };


    return (
        <>
            <Card className="shadow-lg">
                <CardHeader className="text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
                        className='flex justify-center items-center'
                    >
                        {avatar}
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.5, ease: "easeOut" }}
                        className="flex flex-col items-center space-y-2"
                    >
                        <p className="text-lg font-medium">{name ? name : email}</p>

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <p className="text-sm text-muted-foreground px-4 break-words border-zinc-400 rounded lg:rounded-full border cursor-pointer" onClick={handleCopy}>{truncateWallet(wallet)}</p>
                                </TooltipTrigger>
                                <TooltipContent className='bg-white border rounded p-0.5 m-2'>
                                    <p>{wallet}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <div className='flex items-center justify-around flex-row p-1 gap-2 w-full '>
                            <LinkedButton
                                isLinked={!!user?.twitter}
                                linkUrl={`https://x.com/${user?.twitter?.username}`}
                                onClick={handleLinkTwitterClick}
                                text="Link Twitter"
                                linkedText="Linked with Twitter"
                                icon={<Image src={TwitterLogo} alt='Connect with X' className='w-4 h-4 mr-1' />}
                                className='text-gray-500'
                                linkedColor='text-[#1DA1F2]'
                                username={user?.twitter?.username || ''}
                            />
                            <LinkedButton
                                isLinked={!!user?.farcaster}
                                linkUrl={`https://warpcast.com/${user?.farcaster?.username}`}
                                onClick={linkFarcaster}
                                text="Link Farcaster"
                                linkedText="Linked with Farcaster"
                                icon={<Image src={FarcasterLogo} alt='Connect with Farcaster' className='w-4 h-4 mr-1' />}
                                className='text-gray-500'
                                linkedColor='text-[#8a63d2]'
                                username={user?.farcaster?.username || ''}

                            />

                        </div>
                        {Zupass && Zupass.length > 0 && (
                            <p>Member of {Zupass.map((zupass: any) => zupass.group).join(', ')}</p>
                        )}                    </motion.div>
                </CardHeader>
                <CardContent className="text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.5, ease: "easeOut" }}
                    >
                        <div className='mt-5'>
                            <div className='text-sm'>
                                {bio}
                            </div>
                        </div>

                    </motion.div>
                </CardContent>
                <CardFooter className="flex justify-center items-center flex-col  mt-5">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.5, ease: "easeOut" }}
                        className='w-full'
                    >
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <div className='flex justify-between items-center w-full'>
                                <DialogTrigger asChild>
                                    <Button variant="outline">Edit profile</Button>
                                </DialogTrigger>
                                <Suspense fallback={<div>Loading...</div>}>
                                    <ShareProfile address={wallet} />
                                </Suspense>
                            </div>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Edit Profile</DialogTitle>
                                </DialogHeader>
                                <Form {...form}>
                                    <form
                                        onSubmit={form.handleSubmit(handleFormSubmit)}
                                        className="space-y-4"
                                    >
                                        <FormField
                                            control={form.control}
                                            name="username"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Username</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="bio"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Bio</FormLabel>
                                                    <FormControl>
                                                        <Textarea {...field} maxLength={160} />
                                                    </FormControl>
                                                    <FormDescription>
                                                        Max 160 characters
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <UnlinkAccounts
                                            user={user}
                                            unlinkTwitter={unlinkTwitter}
                                            unlinkFarcaster={unlinkFarcaster}
                                        />

                                        <DialogFooter>
                                            <Button type="submit">
                                                Save changes
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </Form>
                            </DialogContent>
                        </Dialog>
                    </motion.div>
                </CardFooter>
            </Card>

            <Card className="shadow-lg mt-5">
                <CardHeader className='text-center'>
                    <p className="text-lg font-bold">Vouching</p>
                </CardHeader>
                <CardContent>
                    <div className='mt-2'>
                        <div className='width-full display-flex flex flex-row justify-between'>
                            <p>Available</p>
                            <p>{vouchesAvailable !== null ? vouchesAvailable : 'Loading...'}</p>
                        </div>
                        <div className='width-full display-flex flex flex-row justify-between'>
                            <p>Season ends in</p>
                            <p>{remainingTime}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </>

    );
}