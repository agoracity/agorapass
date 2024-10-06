import { useState, useEffect } from 'react';
import { createPublicClient, http, PublicClient } from 'viem';
import { baseSepolia } from 'viem/chains';
import { abi } from '@/config/smartContract/contractABI';

const CONTRACT_ADDRESS = '0x0000001513e2e9C7990Dcc8A7E99E0B4b32605fd';

export function useContract() {
  const [client, setClient] = useState<PublicClient | null>(null);

  useEffect(() => {
    const newClient = createPublicClient({
      chain: baseSepolia,
      transport: http(),
    });
    setClient(newClient as any);
  }, []);

  const readContract = async (functionName: string, args: any[] = []) => {
    if (!client) return null;

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
  };

  const getCurrentSeason = async () => {
    const result = await readContract('currentSeason');
    return result ? Number(result) : null;
  };

  const getVouchingSeason = async (seasonNumber: number) => {
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
  };

  const getAccountVouches = async (address: string, seasonNumber: number) => {
    const result = await readContract('accountVouches', [address, seasonNumber]);
    if (result && Array.isArray(result) && result.length === 2) {
      console.log('result', result);
      return {
        totalVouches: Number(result[0]),
        lastVouchTimestamp: Number(result[1]),
      };
    }
    return null;
  };

  return {
    getCurrentSeason,
    getVouchingSeason,
    getAccountVouches,
  };
}