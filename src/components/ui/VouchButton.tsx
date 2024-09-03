import React from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { Button } from './button';
import { handleVouch } from '@/utils/handleAttestation';

interface VouchButtonCustomProps {
    recipient: string;
    className?: string;
    authStatus: boolean;
}

const VouchButtonCustom: React.FC<VouchButtonCustomProps> = ({ recipient, className, authStatus }) => {
    const { getAccessToken, user } = usePrivy();
    const { wallets } = useWallets();

    const handleClick = () => {
        handleVouch(recipient, authStatus, user, wallets, getAccessToken);
    };

    return (
        <>
            {authStatus && (
                <Button
                    onClick={handleClick}
                    className={`inline-flex w-full hover:animate-shimmer items-center justify-center rounded-md border border-gray-300 bg-[linear-gradient(110deg,#ffffff,45%,#f0f0f0,55%,#ffffff)] bg-[length:200%_100%] px-6 font-medium text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-gray-50 ${className}`}
                >
                    Vouch
                </Button>
            )}
        </>
    );
};

export default VouchButtonCustom;