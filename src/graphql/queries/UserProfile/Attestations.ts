import { useQuery } from '@tanstack/react-query';
import { EAS_CONFIG, communityData } from '@/config/site';
import { ethers } from 'ethers';

const useAttestationsMade = (schemaId: string, attester: string, take: number) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['attestationsMade', schemaId, attester, take],
    queryFn: async () => {
      const response = await fetch(EAS_CONFIG.GRAPHQL_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query AttestationsMade($schemaId: String!, $attester: String!, $take: Int!, $decodedData: String!) {
              attestations(
                where: {
                  schemaId: { equals: $schemaId },
                  attester: { equals: $attester },
                  decodedDataJson: { contains: $decodedData }
                },
                take: $take,
                orderBy: [{ timeCreated: desc }]
              ) {
                id
                schemaId
                attester
                data
                decodedDataJson
                timeCreated
                recipient
                revoked
              }
            }
          `,
          variables: { 
            schemaId, 
            attester, 
            take, 
            decodedData: ethers.encodeBytes32String(communityData.platform)
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      return result.data.attestations;
    },
    enabled: false, // Set to false so it doesn't run on mount
  });

  return { data, isLoading, error, refetch };
};

const useAttestationsReceived = (schemaId: string, recipient: string, take: number) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['attestationsReceived', schemaId, recipient, take],
    queryFn: async () => {
      const response = await fetch(EAS_CONFIG.GRAPHQL_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query AttestationsReceived($schemaId: String!, $recipient: String!, $take: Int!, $decodedData: String!) {
              attestations(
                where: {
                  schemaId: { equals: $schemaId },
                  recipient: { equals: $recipient },
                  decodedDataJson: { contains: $decodedData }
                },
                take: $take,
                orderBy: [{ timeCreated: desc }]
              ) {
                id
                schemaId
                attester
                data
                decodedDataJson
                timeCreated
                recipient
                revoked
              }
            }
          `,
          variables: { 
            schemaId, 
            recipient, 
            take, 
            decodedData: ethers.encodeBytes32String(communityData.platform)
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      return result.data.attestations;
    },
    enabled: false, // Set to false so it doesn't run on mount
  });

  return { data, isLoading, error, refetch };
};

export { useAttestationsMade, useAttestationsReceived };