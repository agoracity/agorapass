import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import getAvatar from '@/components/ui/ProfileAvatar';
import Link from 'next/link';
import VouchButtonCustom from './VouchButtonWithDialog';
import { Twitter } from 'lucide-react';
import WarpcastIcon from '@/components/ui/WarpcastIcon';
import { truncateAddress } from '@/utils/ui/truncateAddress';
interface UserCardProps {
  recipient: string;
  communityData: any;
  name?: string;
  bio?: string;
  twitter?: string;
  farcaster?: string;
  rankScore?: number;
}

export function UserCard({ recipient, communityData, name, bio, twitter, farcaster, rankScore }: UserCardProps) {
  const avatar = getAvatar(recipient, "w-8 h-8");

  const truncateBio = (text: string) => {
    return text.length > 40 ? text.slice(0, 40) + '...' : text;
  };

  const truncateName = (text: string) => {
    return text.length > 30 ? text.slice(0, 30) + '...' : text;
  };

  const displayName = name || truncateAddress(recipient);
  return (
    <Card>
      <CardContent className="p-4 flex flex-col h-full">
        <div className="flex items-center mb-2">
          {avatar}
          <Link href={`/address/${recipient}`} className="text-sm font-medium truncate hover:underline ml-2">
            {displayName ? truncateName(displayName) : ''}
          </Link>
        </div>
        <div className="h-6 mb-2 text-sm text-gray-600">
          {bio ? truncateBio(bio) : ''}
        </div>
        <div className="flex-grow">
          <div className="flex space-x-2 mb-2">
            <div className="flex space-x-4">
              {twitter && (
                <Link href={`https://twitter.com/${twitter}`} target="_blank" rel="noopener noreferrer" className="flex items-center">
                  <Twitter className="w-5 h-5 text-blue-400 mr-1" />
                  <span className="text-sm font-medium italic">{twitter}</span>
                </Link>
              )}
              {farcaster && (
                <Link href={`https://warpcast.com/${farcaster}`} target="_blank" rel="noopener noreferrer" className="flex items-center">
                  <WarpcastIcon className="w-5 h-5 text-blue-400 mr-1" />
                  <span className="text-sm font-medium italic">{farcaster}</span>
                </Link>
              )}
            </div>
          </div>
        </div>
        <VouchButtonCustom
          recipient={recipient}
          graphqlEndpoint={communityData.graphql}
          schema={communityData.schema}
          chain={communityData.chainId.toString()}
          platform={communityData.platform}
          verifyingContract={communityData.verifyingContract}
          name={displayName}
          bio={bio}
          twitter={twitter}
          farcaster={farcaster}
        />
      </CardContent>
    </Card>
  );
}