import React, { useEffect, useState } from 'react';
import { Button } from '../button';
import { fetchAttestationsMadeCount, fetchAttestationsReceivedCount,fetchEnsNameByAddress } from '@/lib/fetchers/attestations';
import { useQuery } from '@tanstack/react-query';
import { Avatar, AvatarImage } from '../avatar';
import { getAvatar } from './getAvatarImg';
import truncateWallet from '@/utils/truncateWallet';

interface UserProfileCardProps {
    recipient: string;
    onVouch: () => void;
    onCancel: () => void;
}

const UserProfileCard: React.FC<UserProfileCardProps> = ({ recipient, onVouch, onCancel }) => {
    const [vouchesMade, setVouchesMade] = useState<number | null>(null);
    const [vouchesReceived, setVouchesReceived] = useState<number | null>(null);
    const [ensName, setEnsName] = useState<string | null>(null);
    console.log(ensName, 'ensName')
    const schemaId = process.env.NEXT_PUBLIC_SCHEMA_ID!;
    const { data: userData, error: userDataError, isLoading: userDataLoading } = useQuery({
        queryKey: ['userData', recipient],
        queryFn: async () => {
            const res = await fetch(`/api/user/${recipient}`);
            if (res.status === 404) {
                return null;
            }
            if (!res.ok) {
                throw new Error('Network response was not ok');
            }
            return res.json();
        },
        retry: (failureCount, error) => {
            if (error) {
                return false;
            }
            return failureCount < 3;
        },
        staleTime: Infinity,
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [made, received, ensNames] = await Promise.all([
                    fetchAttestationsMadeCount(schemaId, recipient),
                    fetchAttestationsReceivedCount(schemaId, recipient),
                    fetchEnsNameByAddress(recipient)
                ]);
                setVouchesMade(made);
                setVouchesReceived(received);
                setEnsName(ensNames.length > 0 ? ensNames : null);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [recipient, schemaId]);

    const avatar = userData ? getAvatar(recipient, userData.avatarType) : null;
    console.log(userData, 'userData')
    return (
        <div className="w-full rounded-xl p-6 bg-white">
            <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-shrink-0">
                <Avatar className="w-24 h-24 mx-auto lg:mx-0">
                        {avatar && (
                            typeof avatar === 'string' ? (
                                <AvatarImage src={avatar} alt="Avatar" />
                            ) : (
                                avatar
                            )
                        )}
                    </Avatar>
                </div>

                <div className="flex-grow">
                    <div className="text-center lg:text-left">
                        <h2 className="text-2xl font-bold text-zinc-700">{ensName || truncateWallet(recipient)}</h2>
                        {ensName && <p className="mt-2 font-semibold text-zinc-700">{truncateWallet(recipient)}</p>}
                        {/* <p className="mt-2 font-semibold text-zinc-700">@{(ensName || truncateWallet(recipient)).toLowerCase()}</p> */}
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-6 text-center lg:text-left">
                        <div>
                            <p className="font-bold text-zinc-700">{vouchesMade ?? '...'}</p>
                            <p className="text-sm font-semibold text-zinc-700">Vouches made</p>
                        </div>

                        <div>
                            <p className="font-bold text-zinc-700">{vouchesReceived ?? '...'}</p>
                            <p className="text-sm font-semibold text-zinc-700">Vouches received</p>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4">
                        <Button onClick={onVouch} className="w-full">Vouch</Button>
                        <Button onClick={onCancel} variant="outline" className="w-full">Cancel</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfileCard;