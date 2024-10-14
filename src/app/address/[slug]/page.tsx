"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ethers } from 'ethers';
import { useAttestationCounts } from '@/utils/hooks/useAttestationCount';
import { useEnsName } from '@/utils/hooks/useEnsName';
import Link from 'next/link';
import getAvatar from '@/components/ui/ProfileAvatar';
import { Button } from "@/components/ui/button";
import { Twitter, Zap, Copy } from 'lucide-react';
import { showCopySuccessAlert } from '@/utils/alertUtils';
import { truncateAddress } from '@/utils/ui/truncateAddress';
import { communityData } from '@/config/site';
import VouchButtonCustom from '@/components/ui/VouchButtonWithDialog';
import displayRanking from '@/utils/ui/displayRanking';
import { usePrivy } from '@privy-io/react-auth';
import EditProfileDialog from '@/components/ui/EditProfileDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAttestationsMade, useAttestationsReceived } from '@/graphql/queries/UserProfile/Attestations';
import { ScrollArea } from "@/components/ui/scroll-area";
import { EAS_CONFIG } from '@/config/site';
import { useContract } from '@/utils/hooks/useContract';

const CyberpunkProfilePage = () => {
  const { slug } = useParams();
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAttestationsDialogOpen, setIsAttestationsDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'received' | 'made'>('received');
  const [remainingVouches, setRemainingVouches] = useState<number | null>(null);

  const formattedAddress = slug as string;

  const { data: ensName } = useEnsName(formattedAddress);

  const { vouchesReceived, vouchesMade } = useAttestationCounts(
    communityData.graphql,
    formattedAddress,
    ethers.encodeBytes32String(communityData.platform || '')
  );

  const { data: attestationsMade, refetch: refetchMade } = useAttestationsMade(communityData.schema, formattedAddress, 100);
  const { data: attestationsReceived, refetch: refetchReceived } = useAttestationsReceived(communityData.schema, formattedAddress, 100);

  const { user } = usePrivy();
  const isOwnProfile = user?.wallet?.address?.toLowerCase() === formattedAddress.toLowerCase();

  const { getCurrentSeason, getVouchingSeason, getAccountVouches } = useContract();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`/api/user/${slug}`);
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        } else {
          console.error('Failed to fetch user data');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchUserData();
    }
  }, [slug]);

  useEffect(() => {
    const fetchRemainingVouches = async () => {
      try {
        const currentSeason = await getCurrentSeason();
        if (currentSeason !== null) {
          const seasonInfo = await getVouchingSeason(currentSeason);
          const accountVouches = await getAccountVouches(formattedAddress, currentSeason);
          
          if (seasonInfo && accountVouches) {
            const remaining = seasonInfo.maxAccountVouches - accountVouches.totalVouches;
            setRemainingVouches(remaining);
          }
        }
      } catch (error) {
        console.error('Error fetching remaining vouches:', error);
      }
    };

    if (formattedAddress) {
      fetchRemainingVouches();
    }
  }, [formattedAddress, getCurrentSeason, getVouchingSeason, getAccountVouches]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showCopySuccessAlert();
  };

  const avatar = getAvatar(formattedAddress, "w-24 h-24 sm:w-32 sm:h-32");

  if (isLoading) {
    return <div className="min-h-screen bg-white text-cyan-400 flex items-center justify-center">Loading...</div>;
  }

  const receivedCount = vouchesReceived?.data?.aggregateAttestation?._count?.recipient ?? 0;
  const madeCount = vouchesMade?.data?.aggregateAttestation?._count?.attester ?? 0;

  const handleSaveProfile = (updatedData: { name: string; bio: string }) => {
    setUserData({ ...userData, ...updatedData });
    setIsDialogOpen(false);
  };

  const handleOpenAttestationsDialog = (type: 'received' | 'made') => {
    setDialogType(type);
    setIsAttestationsDialogOpen(true);
    if (type === 'received') {
      refetchReceived();
    } else {
      refetchMade();
    }
  };

  const getAttestationViewUrl = (id: string) => {
    const baseUrl = EAS_CONFIG.GRAPHQL_URL.replace('/graphql', '');
    return `${baseUrl}/attestation/view/${id}`;
  };

  return (
    <div className="min-h-screen bg-transparent text-cyan-400 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="relative bg-gray-900 rounded-xl p-4 sm:p-8 border-2 border-cyan-400 shadow-lg shadow-cyan-400/50">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 to-fuchsia-600/20 rounded-xl" />
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-8 mb-6">
              {avatar}
              <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-4xl font-bold mb-2 text-fuchsia-400">
                  {userData.name || ensName || truncateAddress(formattedAddress)}
                </h1>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <span className="text-sm break-all">{formattedAddress}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(formattedAddress)}
                    className="text-cyan-400 hover:text-cyan-300"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {userData.bio && (
              <p className="text-base sm:text-lg mb-6 text-cyan-200">{userData.bio}</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div 
                className="bg-gray-800 rounded-lg p-4 border border-cyan-400 cursor-pointer hover:bg-gray-700 transition-colors"
                onClick={() => handleOpenAttestationsDialog('received')}
              >
                <h2 className="text-lg sm:text-xl font-semibold mb-2 text-fuchsia-400">Vouches Received</h2>
                <p className="text-2xl sm:text-3xl">{receivedCount}</p>
              </div>
              <div 
                className="bg-gray-800 rounded-lg p-4 border border-cyan-400 cursor-pointer hover:bg-gray-700 transition-colors"
                onClick={() => handleOpenAttestationsDialog('made')}
              >
                <h2 className="text-lg sm:text-xl font-semibold mb-2 text-fuchsia-400">Vouches Made</h2>
                <p className="text-2xl sm:text-3xl">{madeCount}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 border border-cyan-400">
                <h2 className="text-lg sm:text-xl font-semibold mb-2 text-fuchsia-400">Remaining Vouches</h2>
                <p className="text-2xl sm:text-3xl">{remainingVouches !== null ? remainingVouches : 'Loading...'}</p>
              </div>
            </div>

            {userData.rankScore !== undefined && (
              <div className="mb-6">
                <h2 className="text-lg sm:text-xl font-semibold mb-2 text-fuchsia-400">Rank Score</h2>
                <p className="text-2xl sm:text-3xl">{displayRanking(userData.rankScore)}</p>
              </div>
            )}

            <div className="flex justify-center sm:justify-start gap-4 mb-6">
              {userData.twitter && (
                <Link href={`https://twitter.com/${userData.twitter}`} target="_blank" rel="noopener noreferrer">
                  <Twitter className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400 hover:text-cyan-300" />
                </Link>
              )}
              {userData.farcaster && (
                <Link href={`https://warpcast.com/${userData.farcaster}`} target="_blank" rel="noopener noreferrer">
                  <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-fuchsia-400 hover:text-fuchsia-300" />
                </Link>
              )}
            </div>

            {isOwnProfile && (
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="w-full py-3 text-lg bg-cyan-600 hover:bg-cyan-700 text-white mb-4"
              >
                Edit Profile
              </Button>
            )}

            {!isOwnProfile && (
              <VouchButtonCustom
                recipient={formattedAddress}
                graphqlEndpoint={communityData.graphql}
                schema={communityData.schema}
                chain={communityData.chainId.toString()}
                platform={communityData.platform}
                verifyingContract={communityData.verifyingContract}
                name={userData.name || ensName}
                bio={userData.bio}
                twitter={userData.twitter}
                farcaster={userData.farcaster}
                buttonText="Vouch for User"
                className="w-full py-3 text-lg bg-fuchsia-600 hover:bg-fuchsia-700 text-white"
                directVouch={true} 
              />
            )}
          </div>
        </div>
      </div>
      {isOwnProfile && (
        <EditProfileDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSave={handleSaveProfile}
          initialData={{ name: userData.name, bio: userData.bio }}
        />
      )}
      <Dialog open={isAttestationsDialogOpen} onOpenChange={setIsAttestationsDialogOpen}>
        <DialogContent className="bg-gray-900 text-cyan-400 border-2 border-cyan-400">
          <DialogHeader>
            <DialogTitle className="text-fuchsia-400">
              {dialogType === 'received' ? 'Vouches Received' : 'Vouches Made'}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] mt-4">
            {dialogType === 'received' ? (
              attestationsReceived?.map((attestation: any) => (
                <a 
                  href={getAttestationViewUrl(attestation.id)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  key={attestation.id} 
                  className={`mb-4 p-3 rounded-lg block hover:opacity-80 transition-opacity ${
                    attestation.revoked ? 'bg-red-900' : 'bg-gray-800'
                  }`}
                >
                  <p>{`${truncateAddress(attestation.attester)} vouched for this user`}</p>
                  <p className="text-xs text-gray-400">{new Date(attestation.timeCreated * 1000).toLocaleString()}</p>
                </a>
              ))
            ) : (
              attestationsMade?.map((attestation: any) => (
                <a 
                  href={getAttestationViewUrl(attestation.id)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  key={attestation.id} 
                  className={`mb-4 p-3 rounded-lg block hover:opacity-80 transition-opacity ${
                    attestation.revoked ? 'bg-red-900' : 'bg-gray-800'
                  }`}
                >
                  <p>{`Vouched for ${truncateAddress(attestation.recipient)}`}</p>
                  <p className="text-xs text-gray-400">{new Date(attestation.timeCreated * 1000).toLocaleString()}</p>
                </a>
              ))
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CyberpunkProfilePage;
