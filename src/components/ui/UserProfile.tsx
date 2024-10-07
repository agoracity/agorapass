import React, { useState, useEffect } from 'react';
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ethers } from 'ethers';
import { Copy, Twitter, Zap } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import { useAttestationCounts } from '@/utils/hooks/useAttestationCount';
import { useEnsName } from '@/utils/hooks/useEnsName';
import Link from 'next/link';
import getAvatar from '@/components/ui/ProfileAvatar';
import { showCopySuccessAlert } from '@/utils/alertUtils';
import { CyberpunkLoader } from '@/components/ui/CyberpunkLoader';
import { truncateAddress } from '@/utils/ui/truncateAddress';

interface UserProfileProps {
  isOwnProfile: boolean;
  recipient?: string;
  onVouch?: () => void;
  onCancel?: () => void;
  graphqlEndpoint: string;
  platform?: string;
  isAuthenticated: boolean;
  // New props
  name?: string;
  bio?: string;
  twitter?: string;
  farcaster?: string;
  rankScore?: number;
}

export function UserProfile({
  isOwnProfile,
  recipient,
  onVouch,
  onCancel,
  graphqlEndpoint,
  platform,
  isAuthenticated,
  // New props
  name,
  bio,
  twitter,
  farcaster,
  rankScore
}: UserProfileProps) {
  const { ready, authenticated, user } = usePrivy();
  const [formattedAddress, setFormattedAddress] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (isOwnProfile && ready && authenticated && user?.wallet?.address) {
      setFormattedAddress(ethers.getAddress(user.wallet.address));
    } else if (!isOwnProfile && recipient) {
      setFormattedAddress(ethers.getAddress(recipient));
    }
  }, [isOwnProfile, ready, authenticated, user, recipient]);

  const { data: ensName, isLoading: isEnsLoading } = useEnsName(formattedAddress);

  const { vouchesReceived, vouchesMade, isLoading: isAttestationsLoading } = useAttestationCounts(
    graphqlEndpoint,
    formattedAddress,
    ethers.encodeBytes32String(platform || '')
  );

  const isLoading = isEnsLoading || isAttestationsLoading;
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      // Delay hiding the loader to allow for a longer fade-out animation
      setTimeout(() => setShowLoader(false), 1500);
    }
  }, [isLoading]);

  const receivedCount = vouchesReceived?.data?.aggregateAttestation?._count?.recipient ?? 0;
  const madeCount = vouchesMade?.data?.aggregateAttestation?._count?.attester ?? 0;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showCopySuccessAlert();
  };

  if (!formattedAddress) {
    return (
      <DialogContent>
          <DialogTitle className='hidden'>Loading Profile</DialogTitle>
        Loading...
      </DialogContent>
    );
  }
  const avatar = getAvatar(formattedAddress, "w-16 h-16");
  
  return (
    <DialogContent className="rounded-xl p-0 overflow-hidden">
      {showLoader && <CyberpunkLoader isLoading={isLoading} />}
      <div className={`p-6 transition-opacity duration-1000 ${isLoading ? 'opacity-0' : 'opacity-100 animate-fade-in-up'}`}>
        <DialogHeader>
          <DialogTitle>{isOwnProfile ? "Your Profile" : "User Profile"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-4">
            {avatar}
            <div className="flex-grow">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-lg truncate">
                  <Link href={`/address/${formattedAddress}`} className="underline">
                    {isLoading ? 'Loading...' : (name || ensName || truncateAddress(formattedAddress))}
                  </Link>
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(formattedAddress)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <span className="text-xs text-gray-500 break-all">{formattedAddress}</span>
            </div>
          </div>

          {bio && (
            <div className="text-sm text-gray-600">
              {bio}
            </div>
          )}

          <div className="flex space-x-2">
            {twitter && (
              <Link href={`https://twitter.com/${twitter}`} target="_blank" rel="noopener noreferrer">
                <Twitter className="w-5 h-5 text-blue-400" />
              </Link>
            )}
            {farcaster && (
              <Link href={`https://warpcast.com/${farcaster}`} target="_blank" rel="noopener noreferrer">
                <Zap className="w-5 h-5 text-purple-600" />
              </Link>
            )}
          </div>

          {rankScore !== undefined && (
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="col-span-2">Rank Score:</span>
              <span className="col-span-2">{rankScore.toFixed(2)}</span>
            </div>
          )}

          <div className="grid grid-cols-4 items-center gap-4">
            <span className="col-span-2">Vouches Received:</span>
            <span className="col-span-2">{isLoading ? 'Loading...' : receivedCount}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="col-span-2">Vouches Made:</span>
            <span className="col-span-2">{isLoading ? 'Loading...' : madeCount}</span>
          </div>
          {!isOwnProfile && (
            <div className="flex justify-end space-x-2">
              <Button onClick={isAuthenticated ? onVouch : () => onVouch?.()} variant={isAuthenticated ? "default" : "outline"} className='rounded-xl bg-[#19473f] hover:bg-[#19473f]/90'>
                {isAuthenticated ? "Vouch" : "Login to Vouch"}
              </Button>
              <Button variant="secondary" onClick={onCancel} className='rounded-xl'>
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>
    </DialogContent>
  );
}