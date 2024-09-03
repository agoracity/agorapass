import React, { useEffect, useState } from 'react';
import { Button } from '../button';
import { fetchAttestationsMadeCount, fetchAttestationsReceivedCount, fetchEnsNameByAddress } from '@/lib/fetchers/attestations';
import { Avatar, AvatarImage } from '../avatar';
import { getAvatar } from './getAvatarImg';
import truncateWallet from '@/utils/truncateWallet';
import TwitterLogo from '@/../../public/X.svg';
import FarcasterLogo from '@/../../public/farcaster.svg';
import Image from 'next/image';
import { User } from '@/types/user'; // Make sure to import the User type

interface UserProfileCardProps {
    recipient: string;
    onVouch: () => void;
    onCancel: () => void;
    userData: User; // Add this line
}

const UserProfileCard: React.FC<UserProfileCardProps> = ({ recipient, onVouch, onCancel, userData }) => {
    const [vouchesMade, setVouchesMade] = useState<number | null>(null);
    const [vouchesReceived, setVouchesReceived] = useState<number | null>(null);
    const [ensName, setEnsName] = useState<string | null>(null);
    const schemaId = process.env.NEXT_PUBLIC_SCHEMA_ID!;

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

    const avatar = userData ? getAvatar(recipient, userData.avatarType as "metamask" | "blockies") : null;
    console.log(userData, 'userData');
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
                    
                    {userData?.name && <p className="mt-2 text-zinc-600">{userData.name}</p>}
                    
                    {userData?.bio && <p className="mt-2 text-zinc-500">{userData.bio}</p>}
                    
                    {userData?.createdAt && (
                        <p className="mt-2 text-sm text-zinc-400">
                            Member since: {new Date(userData.createdAt).toLocaleDateString()}
                        </p>
                    )}
                    
                    <div className="mt-2 flex justify-center lg:justify-start space-x-4">
                        {userData?.twitter && (
                            <a href={`https://twitter.com/${userData.twitter}`} target="_blank" rel="noopener noreferrer" className="flex items-center text-sky-400">
                                <Image src={TwitterLogo} alt="Twitter" className="w-5 h-5 mr-1" />
                                @{userData.twitter}
                            </a>
                        )}
                        {userData?.farcaster && (
                            <a href={`https://warpcast.com/${userData.farcaster}`} target="_blank" rel="noopener noreferrer" className="flex items-center text-[#8a63d2]">
                                <Image src={FarcasterLogo} alt="Farcaster" className="w-5 h-5 mr-1" />
                                @{userData.farcaster}
                            </a>
                        )}
                    </div>
                    
                    {userData?.Zupass && userData.Zupass.length > 0 && (
                        <div className="mt-2 text-sm text-zinc-600">
                            <p>Member of {userData.Zupass.map((item: { group: string }) => item.group).join(', ')}</p>
                        </div>
                    )}
                    
                    {userData?.rankScore !== undefined && (
                        <p className="mt-2 font-semibold text-zinc-700">Trust Score: {userData.rankScore}</p>
                    )}
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