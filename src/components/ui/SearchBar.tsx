"use client"
import React, { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FIND_FIRST_ENS_NAME_BY_WALLET } from '@/graphql/queries/geNameByWallet';
import debounce from 'lodash/debounce';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { ethers } from 'ethers';
import { Dialog } from "@/components/ui/dialog";
import { UserProfile } from './UserProfile'; 
import { usePrivy } from '@privy-io/react-auth';
import { DialogContent, DialogTitle } from "@/components/ui/dialog";
import { handleVouch } from '@/utils/handleAttestation';
import { useWallets } from '@privy-io/react-auth';

interface EnsNameSearchProps {
  graphql: string;
  platform: string;
  schema: string;
  chain: number;
  verifyingContract: string;
}

export function EnsNameSearch({ graphql, platform, schema, chain, verifyingContract }: EnsNameSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [isEthAddress, setIsEthAddress] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { login, authenticated, ready, user, getAccessToken } = usePrivy();
  const [authStatus, setAuthStatus] = useState(false);
  const { wallets } = useWallets();

  useEffect(() => {
    if (ready) {
      setAuthStatus(authenticated);
    }
  }, [ready, authenticated]);

  // Debounce function
  const debouncedSetSearch = useCallback((value: string) => {
    const debouncedFunction = debounce((searchValue: string) => {
      setDebouncedSearchTerm(searchValue);
    }, 300);
    debouncedFunction(value);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsEthAddress(ethers.isAddress(value));
    debouncedSetSearch(value);
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['ensName', debouncedSearchTerm],
    queryFn: async () => {
      if (!debouncedSearchTerm) return null;
      const response = await fetch(graphql, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: FIND_FIRST_ENS_NAME_BY_WALLET,
          variables: {
            where: {
              name: {
                contains: debouncedSearchTerm
              }
            }
          }
        }),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const result = await response.json();
      return result.data?.findFirstEnsName || null;
    },
    enabled: !!debouncedSearchTerm
  });

  const handleVouchConfirm = () => {
    if (!authStatus) {
      login();
      return;
    }

    if (data?.data?.findFirstEnsName) {
      handleVouch(
        data.data.findFirstEnsName.id,
        user,
        wallets,
        getAccessToken,
        schema,
        chain,
        platform,
        verifyingContract
      );
    } else if (isEthAddress) {
      handleVouch(
        searchTerm,
        user,
        wallets,
        getAccessToken,
        schema,
        chain,
        platform,
        verifyingContract
      );
    }
    setIsDialogOpen(false);
  };

  const handleNameClick = () => {
    setIsDialogOpen(true);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search ENS or Address"
          className="pl-10 block w-full bg-background border border-secondary rounded-xl focus:ring-blue-500 focus:border-blue-500"
          />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
      </div>
      {isLoading && (
        <div className="absolute z-10 w-full mt-1 border border-gray-200 rounded-md shadow-lg bg-background">
          <p className="p-2 text-sm text-gray-500">Loading...</p>
        </div>
      )}
      {error && (
        <div className="absolute z-10 w-full mt-1 border border-gray-200 rounded-md shadow-lg bg-background">
          <p className="p-2 text-sm text-red-500">Error: {error.message}</p>
        </div>
      )}
      {(data || isEthAddress) && (
        <div className="absolute z-10 w-full mt-1 border border-gray-200 rounded-md shadow-lg bg-background">
          {data ? (
            <div className="p-2">
              <p 
                className="text-sm cursor-pointer text-primary hover:text-blue-500"
                onClick={() => handleNameClick()}
              >
                {data.name}
              </p>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                <DialogTitle className="hidden">Vouch for user</DialogTitle>
                  <UserProfile
                    isOwnProfile={false}
                    recipient={data.id}
                    onVouch={handleVouchConfirm}
                    onCancel={() => setIsDialogOpen(false)}
                    graphqlEndpoint={graphql}
                    platform={platform}
                    isAuthenticated={authStatus}
                  />
                </DialogContent>
              </Dialog>
            </div>
          ) : isEthAddress ? (
            <div className="p-2">
              <p 
                className="text-sm cursor-pointer text-primary hover:text-blue-500"
                onClick={() => handleNameClick()}
              >
                {searchTerm} (Valid Ethereum address)
              </p>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                  <DialogTitle className="hidden">Vouch for user</DialogTitle>
                  <UserProfile
                    isOwnProfile={false}
                    recipient={searchTerm}
                    onVouch={handleVouchConfirm}
                    onCancel={() => setIsDialogOpen(false)}
                    graphqlEndpoint={graphql}
                    platform={platform}
                    isAuthenticated={authStatus}
                  />
                </DialogContent>
              </Dialog>
            </div>
          ) : (
            <p className="p-2 text-sm text-gray-500">No result found</p>
          )}
        </div>
      )}
    </div>
  );
}