"use client"
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { UserCard } from './UserCard';

interface UserGridProps {
  communityData: any;
}

export function UserGrid({ communityData }: UserGridProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['attestations', communityData.schema],
    queryFn: async () => {
      const response = await fetch(communityData.graphql, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query Attestations($where: AttestationWhereInput, $take: Int) {
              attestations(where: $where, take: $take) {
                recipient
              }
            }
          `,
          variables: {
            where: {
              schema: {
                is: {
                  id: {
                    equals: communityData.schema
                  }
                }
              }
            },
            take: 75
          }
        }),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const result = await response.json();
      // Filter unique recipients
      const uniqueRecipients = Array.from(new Set(result.data.attestations.map((a: { recipient: string }) => a.recipient)));
      return { data: { attestations: uniqueRecipients.map(recipient => ({ recipient })) } };
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {(error as Error).message}</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Recently vouched users</h2>
      {data?.data?.attestations && data.data.attestations.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {data.data.attestations.map((attestation: { recipient: unknown }) => (
            <UserCard
              key={typeof attestation.recipient === 'string' ? attestation.recipient : String(attestation.recipient)}
              recipient={attestation.recipient as string}
              communityData={communityData}
            />
          ))}
        </div>
      ) : (
        <div>No recent vouches</div>
      )}
    </div>
  );
}