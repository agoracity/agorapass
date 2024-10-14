import { useCallback, useMemo } from 'react';
import { createPublicClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';
import { abi } from '@/config/smartContract/contractABI';

const CONTRACT_ADDRESS = '0x0000001513e2e9C7990Dcc8A7E99E0B4b32605fd';

// Create the client outside of the hook to ensure it's only created once
const client = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

export function useContract() {
  const readContract = useCallback(async (functionName: string, args: any[] = []) => {
    try {
      const result = await client.readContract({
        address: CONTRACT_ADDRESS,
        abi: abi,
        functionName: functionName as any,
        args: args as any,
      });
      return result;
    } catch (error) {
      console.error(`Error calling ${functionName}:`, error);
      return null;
    }
  }, []);

  const getCurrentSeason = useCallback(async () => {
    const result = await readContract('currentSeason');
    return result ? Number(result) : null;
  }, [readContract]);

  const getVouchingSeason = useCallback(async (seasonNumber: number) => {
    const result = await readContract('vouchingSeasons', [seasonNumber]);
    if (result && Array.isArray(result) && result.length === 5) {
      return {
        startTimestamp: Number(result[0]),
        endTimestamp: Number(result[1]),
        maxAccountVouches: Number(result[2]),
        maxTotalVouches: Number(result[3]),
        totalVouches: Number(result[4]),
      };
    }
    return null;
  }, [readContract]);

  const getAccountVouches = useCallback(async (address: string, seasonNumber: number) => {
    const result = await readContract('accountVouches', [address, seasonNumber]);
    if (result && Array.isArray(result) && result.length === 2) {
      return {
        totalVouches: Number(result[0]),
        lastVouchTimestamp: Number(result[1]),
      };
    }
    return null;
  }, [readContract]);

  return useMemo(() => ({
    getCurrentSeason,
    getVouchingSeason,
    getAccountVouches,
  }), [getCurrentSeason, getVouchingSeason, getAccountVouches]);
}
