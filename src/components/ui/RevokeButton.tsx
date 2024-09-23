import React from 'react'
import { Button } from './button';
import { XCircle } from 'lucide-react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { handleRevokeAttestation } from '@/utils/handleRevokeAttestation';
import Swal from 'sweetalert2';

interface RevokeButtonCustomProps {
    UID: string;
    className?: string;
}

const RevokeButton: React.FC<RevokeButtonCustomProps> = ({ UID, className }) => {
    const { getAccessToken, user } = usePrivy();
    const { wallets } = useWallets();
    const chainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID ?? '84532', 10);
    const schemaUID = process.env.SCHEMA_ID || "0xfbc2df315b41c1b399470f3f4e5ba5caa772a328bb75d1a20bb5dbac1e75e8e7";

    const handleClick = async () => {
        if (!user?.wallet?.address) {
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'User wallet address is not defined.',
            });
            return;
        }
        const token = await getAccessToken();
        if (!token) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Something went wrong. Try reloading the page.',
            });
            return;
        }

        Swal.fire({
            title: 'Processing...',
            text: 'Please wait while your request is being processed.',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });

        await handleRevokeAttestation({ user, wallets, chainId, schemaUID, UID, token });
    }

    return (
        <Button variant="outline" className="p-2 cursor-pointer" onClick={handleClick}>
            Remove vouch
            <XCircle className="text-red-500 w-4 h-4 ml-2" />
        </Button>
    )
}

export default RevokeButton;
