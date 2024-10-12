import { useQuery } from '@tanstack/react-query';
import GET_ATTESTATIONS from '@/graphql/queries/getAttestations';
import { communityData } from '@/config/site';

export const useAttestationDetails = (
  pageSize: number = 10,
  pageNumber: number = 1
) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['attestationDetails', pageSize, pageNumber],
    queryFn: async () => {
      const response = await fetch(communityData.graphql, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: GET_ATTESTATIONS,
          variables: {
            schemaId: communityData.schema,
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
  });

  return {
    attestations: data?.data?.attestations,
    isLoading,
    error,
  };
};