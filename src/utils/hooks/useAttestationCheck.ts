import { useQuery } from '@tanstack/react-query';
import { EAS_CONFIG } from '@/config/site';

const useAttestationCheck = (recipient: string) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['attestationCheck', EAS_CONFIG.PRETRUST_SCHEMA, recipient],
    queryFn: async () => {

      const response = await fetch(EAS_CONFIG.GRAPHQL_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query AttestationPretrustCheck($schemaId: String!, $recipient: String!) {
              attestations(
                where: {
                  schemaId: { equals: $schemaId },
                  recipient: { equals: $recipient }
                }
              ) {
                id
                recipient
                decodedDataJson
              }
            }
          `,
          variables: { schemaId: EAS_CONFIG.PRETRUST_SCHEMA, recipient },
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

export default useAttestationCheck;