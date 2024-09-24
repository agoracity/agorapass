import { useQuery } from '@tanstack/react-query';
import COUNT_ATTESTATIONS_MADE from '@/graphql/newQueries/AttestationsMadeCount';
import COUNT_ATTESTATIONS_RECEIVED from '@/graphql/newQueries/AttestationsReceivedCount';

export const useAttestationCounts = (graphqlEndpoint: string, formattedAddress: string | undefined, community: string, schemaId: string) => {
  const { data: vouchesReceived, isLoading: isVouchesReceivedLoading } = useQuery({
    queryKey: ['vouchesReceived', formattedAddress, schemaId],
    queryFn: async () => {
      if (!formattedAddress) return null;
      const response = await fetch(graphqlEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: COUNT_ATTESTATIONS_RECEIVED,
          variables: { 
            where: { 
              recipient: { equals: formattedAddress },
              decodedDataJson: { contains: community },
              schemaId: { equals: schemaId }
            } 
          },
        }),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
    enabled: !!formattedAddress,
  });

  const { data: vouchesMade, isLoading: isVouchesMadeLoading } = useQuery({
    queryKey: ['vouchesMade', formattedAddress, schemaId],
    queryFn: async () => {
      if (!formattedAddress) return null;
      const response = await fetch(graphqlEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: COUNT_ATTESTATIONS_MADE,
          variables: { 
            where: { 
              attester: { equals: formattedAddress },
              decodedDataJson: { contains: community },
              schemaId: { equals: schemaId }
            } 
          },
        }),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
    enabled: !!formattedAddress,
  });

  return {
    vouchesReceived,
    vouchesMade,
    isLoading: isVouchesReceivedLoading || isVouchesMadeLoading,
  };
};