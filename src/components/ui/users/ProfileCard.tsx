import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { MetaMaskAvatar } from 'react-metamask-avatar';
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
const ShareProfile = lazy(() => import('./ShareProfile'));


const MySwal = withReactContent(Swal);

export const FormSchema = z.object({
    username: z.string().max(20, { message: "Username must not be longer than 20 characters" }),
    bio: z.string().max(160, { message: "Bio must not be longer than 160 characters." }).optional(),
    avatarType: z.enum(['metamask', 'blockies']).default('metamask'),
});

interface ProfileCardProps {
    data: any;
    onSubmit: (data: z.infer<typeof FormSchema>) => void;
}

export function ProfileCard({ data, onSubmit }: ProfileCardProps) {
    const { user, unlinkTwitter, unlinkFarcaster, getAccessToken } = usePrivy();

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


    const { email, wallet, vouchesAvailables, createdAt, vouchReset, name, bio, avatarType, Zupass } = data || {};
    console.log('data', data);
    const [remainingTime, setRemainingTime] = useState('00:00:00');
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const formattedDate = DateTime.fromISO(createdAt).toLocaleString(DateTime.DATE_FULL);
    const vouchResetDate = DateTime.fromISO(vouchReset);

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: { username: name || "", bio: bio || "", avatarType: avatarType || "metamask" },
    });

    useEffect(() => {
        form.reset({ username: name || "", bio: bio || "", avatarType: avatarType || "metamask" });
    }, [name, bio, avatarType, form]);

    useEffect(() => {
        const updateRemainingTime = () => {
            const now = DateTime.now();
            const remainingDuration = vouchResetDate.diff(now, ['days', 'hours', 'minutes']);

            if (remainingDuration.as('milliseconds') <= 0) {
                setRemainingTime('00:00');
            } else {
                // Extract values with default to 0 if undefined
                const { days = 0, hours = 0, minutes = 0 } = remainingDuration.shiftTo('days', 'hours', 'minutes').toObject();

                // Format remaining time
                const formattedTime = days > 0
                    ? `${String(Math.floor(days)).padStart(2, '0')}d ${String(Math.floor(hours)).padStart(2, '0')}h ${String(Math.floor(minutes)).padStart(2, '0')}m`
                    : `${String(Math.floor(hours)).padStart(2, '0')}:${String(Math.floor(minutes)).padStart(2, '0')}`;

                setRemainingTime(formattedTime);
            }
        };

        updateRemainingTime();
        const intervalId = setInterval(updateRemainingTime, 60000); // Update every minute

        return () => clearInterval(intervalId);
    }, [vouchResetDate]);


    const handleFormSubmit = (data: z.infer<typeof FormSchema>) => {
        onSubmit(data);
        setIsDialogOpen(false);
    };

    // Check if data is available before rendering the avatar
    if (!wallet || !avatarType) {
        return <div>Loading...</div>;
    }

    const avatar = getAvatar(wallet, avatarType);

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
                    >
                        <Avatar className="w-20 h-20 mx-auto mb-2">
                            {typeof avatar === 'string' ? (
                                <AvatarImage src={avatar} alt="Avatar Image" />
                            ) : (
                                avatar
                            )}
                            {/* <AvatarFallback className="flex items-center justify-center">{email?.charAt(0)}</AvatarFallback> */}
                        </Avatar>
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
                                        <FormField
                                            control={form.control}
                                            name="avatarType"
                                            render={({ field }) => (
                                                <FormItem className="space-y-3">
                                                    <FormLabel>Choose an avatar</FormLabel>
                                                    <FormControl>
                                                        <RadioGroup
                                                            onValueChange={field.onChange}
                                                            defaultValue={field.value}
                                                            className="flex flex-col md:flex-row md:items-start md:justify-start space-y-1 "
                                                        >
                                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                                <FormControl>
                                                                    <RadioGroupItem value="blockies" />
                                                                </FormControl>
                                                                <FormLabel className="font-normal">
                                                                    <Avatar className="w-24 h-24 mx-auto mb-4">
                                                                        <AvatarImage src={getAvatar(wallet, 'blockies') as string} alt="Blockies Avatar" className="w-full h-full object-cover" />
                                                                        <AvatarFallback>{email?.charAt(0)}</AvatarFallback>
                                                                    </Avatar>
                                                                </FormLabel>
                                                            </FormItem>
                                                            <FormItem className="flex items-center space-x-3 space-y-0 p-0 m-0">
                                                                <FormControl>
                                                                    <RadioGroupItem value="metamask" />
                                                                </FormControl>
                                                                <FormLabel className="font-normal">
                                                                    <div className="w-24 h-24 mx-auto mb-4">
                                                                        <MetaMaskAvatar address={wallet} size={96} className="w-full h-full object-cover" />
                                                                    </div>
                                                                </FormLabel>
                                                            </FormItem>

                                                        </RadioGroup>
                                                    </FormControl>
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
                                            {/* <DialogClose asChild>
                                            <Button type="button" variant="secondary">
                                                Close
                                            </Button>
                                        </DialogClose> */}
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
                            <p>{vouchesAvailables}</p>
                        </div>
                        <div className='width-full display-flex flex flex-row justify-between'>
                            <p>Refreshes in</p>
                            <p>{remainingTime}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </>

    );
}
