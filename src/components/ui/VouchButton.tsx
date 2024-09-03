import React, { useState } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { Button } from './button';
import { handleVouch } from '@/utils/handleAttestation';
import { Dialog, DialogContent, DialogTrigger } from './dialog';
import UserProfileCard from './users/UserProfileCard';
interface VouchButtonCustomProps {
    recipient: string;
    className?: string;
    authStatus: boolean;
}

const VouchButtonCustom: React.FC<VouchButtonCustomProps> = ({ recipient, className, authStatus }) => {
    const { getAccessToken, user } = usePrivy();
    const { wallets } = useWallets();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleVouchConfirm = () => {
        handleVouch(recipient, authStatus, user, wallets, getAccessToken);
        setIsDialogOpen(false);
    };

    return (
        <>
            {authStatus && (
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button
                            className={`inline-flex w-full hover:animate-shimmer items-center justify-center rounded-md border border-gray-300 bg-[linear-gradient(110deg,#ffffff,45%,#f0f0f0,55%,#ffffff)] bg-[length:200%_100%] px-6 font-medium text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-gray-50 ${className}`}
                        >
                            Vouch
                        </Button>
                    </DialogTrigger>
                    <DialogContent >
                        <UserProfileCard
                            recipient={recipient}
                            onVouch={handleVouchConfirm}
                            onCancel={() => setIsDialogOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
};

export default VouchButtonCustom;
