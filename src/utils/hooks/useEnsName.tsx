import { useQuery } from '@tanstack/react-query';
import { FIND_FIRST_ENS_NAME_BY_WALLET } from '../../graphql/queries/geNameByWallet';
import { EAS_CONFIG } from '../../config/site';

const fetchEnsName = async (address: string) => {
  const response = await fetch(EAS_CONFIG.GRAPHQL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: FIND_FIRST_ENS_NAME_BY_WALLET,
      variables: { where: { id: { equals: address.toLowerCase() } } },
    }),
  });
  const data = await response.json();
  return data.data.findFirstEnsName?.name;
};

export function useEnsName(address: string | undefined) {
  return useQuery({
    queryKey: ['ensName', address],
    queryFn: () => (address ? fetchEnsName(address) : Promise.resolve(null)),
    enabled: !!address,
    staleTime: Infinity,
  });
}