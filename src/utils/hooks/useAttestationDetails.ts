import { useQuery } from '@tanstack/react-query';
import ATTESTATION_DETAILS from '../../graphql/queries/UserProfile/AttestationDetails';

export const useAttestationDetails = (
  graphqlEndpoint: string,
  attester: string | undefined,
  community?: string,
  pageSize: number = 10,
  pageNumber: number = 1
) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['attestationDetails', attester, community, pageSize, pageNumber],
    queryFn: async () => {
      if (!attester) return null;
      const response = await fetch(graphqlEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: ATTESTATION_DETAILS,
          variables: {
            where: {
              attester: { equals: attester },
              ...(community && { decodedDataJson: { contains: community } }),
            },
            take: pageSize,
            skip: (pageNumber - 1) * pageSize,
          },
        }),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
    enabled: !!attester,
  });

  return {
    attestations: data?.data?.attestations,
    isLoading,
    error,
  };
};