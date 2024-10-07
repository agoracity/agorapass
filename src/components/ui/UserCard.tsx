import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import getAvatar from '@/components/ui/ProfileAvatar';
import Link from 'next/link';
import VouchButtonCustom from './VouchButtonWithDialog';
interface UserCardProps {
  recipient: string;
  communityData: any;
}

export function UserCard({ recipient, communityData }: UserCardProps) {
  const avatar = getAvatar(recipient, "w-8 h-8");

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center mb-2">
          {avatar}
          <Link href={`/address/${recipient}`} className="text-sm font-medium truncate hover:underline">
            {recipient}
          </Link>
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