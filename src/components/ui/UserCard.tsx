import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import getAvatar from '@/components/ui/ProfileAvatar';
import Link from 'next/link';
import VouchButtonCustom from './VouchButtonWithDialog';
import { Twitter, Zap } from 'lucide-react';

interface UserCardProps {
  recipient: string;
  communityData: any;
  name?: string; // Add this line
  bio?: string;
  twitter?: string;
  farcaster?: string;
}

export function UserCard({ recipient, communityData, name, bio, twitter, farcaster }: UserCardProps) {
  const avatar = getAvatar(recipient, "w-8 h-8");

  const truncateBio = (text: string) => {
    return text.length > 20 ? text.slice(0, 20) + '...' : text;
  };

  const displayName = name || recipient;

  return (
    <Card>
      <CardContent className="p-4 flex flex-col h-full">
        <div className="flex items-center mb-2">
          {avatar}
          <Link href={`/address/${recipient}`} className="text-sm font-medium truncate hover:underline ml-2">
            {displayName}
          </Link>
        </div>
        <div className="h-6 mb-2 text-sm text-gray-600">
          {bio ? truncateBio(bio) : ''}
        </div>
        <div className="flex-grow">
          <div className="flex space-x-2 mb-2">
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
        </div>
        <VouchButtonCustom
          recipient={recipient}
          graphqlEndpoint={communityData.graphql}
          schema={communityData.schema}
          chain={communityData.chainId.toString()}
          platform={communityData.platform}
          verifyingContract={communityData.verifyingContract}
        />
      </CardContent>
    </Card>
  );
}