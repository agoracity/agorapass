import React from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { Button } from './button';
import { handleVouch } from '@/utils/handleAttestation';
import communityData from '@/data/communityData.json';

interface VouchButtonCustomProps {
    recipient: string;
    className?: string;
    authStatus: boolean;
    platform: string;
}

const VouchButtonCustom: React.FC<VouchButtonCustomProps> = ({ recipient, className, authStatus, platform }) => {
    const { getAccessToken, user } = usePrivy();
    const { wallets } = useWallets();
    const communityInfo = communityData[platform as keyof typeof communityData];
    const chain = communityInfo.chainId;
    const schema = communityInfo.schema;
    const verifyingContract = communityInfo.verifyingContract;
    const handleClick = () => {
        handleVouch(recipient, user, wallets, getAccessToken, chain, schema, platform, verifyingContract);
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