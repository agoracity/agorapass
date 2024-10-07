import { useQuery } from '@tanstack/react-query';
import { EAS_CONFIG } from '../../../config/siteConfig';

const useAttestationCheck = (decodedData: string[]) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['attestationCheck', EAS_CONFIG.PRETRUST_SCHEMA, decodedData],
    queryFn: async () => {
      const orConditions = decodedData.map(data => ({ decodedDataJson: { contains: data } }));

      const response = await fetch(EAS_CONFIG.GRAPHQL_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query AttestationPretrustCheck($schemaId: String!, $orConditions: [AttestationWhereInput!]) {
              attestations(
                where: {
                  schemaId: { equals: $schemaId },
                  OR: $orConditions
                }
              ) {
                id
                recipient
                decodedDataJson
              }
            }
          `,
          variables: { schemaId: EAS_CONFIG.PRETRUST_SCHEMA, orConditions },
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
    enabled: !!EAS_CONFIG.PRETRUST_SCHEMA && decodedData.length > 0,
  });

  return { data, isLoading, error };
};

export default useAttestationCheck;