import revokeAttestation from '@/utils/revokeAttestation';
import fetchNonce from '@/utils/fetchNonce';
import { signTypedData } from '@/utils/signTypedData';
import Swal from 'sweetalert2';
import { Wallet } from '@/types/wallet';

interface RevokeAttestationParams {
    user: any;
    wallets: any;
    chainId: number;
    schemaUID: string;
    UID: string;
    token: string;
}

export async function handleRevokeAttestation({ user, wallets, chainId, schemaUID, UID, token }: RevokeAttestationParams) {
    try {
        const nonce = await fetchNonce(user.wallet.address);
        if (nonce === undefined) {
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'Failed to fetch nonce.',
            });
            return;
        }

        const message = {
            revoker: user.wallet.address,
            schema: schemaUID,
            uid: UID,
            deadline: 0,
            value: 0,
            nonce: nonce
        };

        const typedData = {
            domain: {
                name: 'EAS',
                version: '1.2.0',
                chainId,
                verifyingContract: '0x4200000000000000000000000000000000000021'
            },
            primaryType: 'Revoke',
            message,
            types: {
                Revoke: [
                    { name: 'schema', type: 'bytes32' },
                    { name: 'uid', type: 'bytes32' },
                    { name: 'value', type: 'uint256' },
                    { name: 'nonce', type: 'uint256' },
                    { name: 'deadline', type: 'uint64' }
                ]
            }
        };




        const wallet = wallets.find((wallet: Wallet) => wallet.walletClientType === user.wallet!.walletClientType);
        if (!wallet) throw new Error('Desired wallet not found');

        await wallet.switchChain(chainId);
        const signature = await signTypedData(user, wallets, chainId, typedData);
        const resultAttestation = await revokeAttestation(signature, UID, token, user.wallet.address);

        Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Vouch revoked successfully.',
            showCancelButton: true,
            confirmButtonText: 'Go to vouch',
            cancelButtonText: 'Close',
            cancelButtonColor: '#d33',
            confirmButtonColor: '#3085d6',
        }).then(result => {
            if (result.isConfirmed) {
                window.location.href = `/vouch/${UID}`;
            }
        });

    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'An unknown error occurred.',
        });
    }
}
