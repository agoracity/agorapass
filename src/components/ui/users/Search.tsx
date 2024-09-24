"use client"
import React, { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import debounce from 'lodash/debounce';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { ethers } from 'ethers';
import { Dialog } from "@/components/ui/dialog";
import { UserProfile } from './UserProfile'; 
import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { handleVouch } from '@/utils/handleAttestation';
import { useWallets } from '@privy-io/react-auth';
import { FIND_FIRST_ENS_NAME_BY_WALLET } from '@/graphql/searchBar/geNameByWallet';
interface EnsNameSearchProps {
  graphql: string;
  platform: string;
  schema: string;
  chain: number;
  verifyingContract: string;
}

export default function EnsNameSearch({ graphql, platform, schema, chain, verifyingContract }: EnsNameSearchProps) {
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
      return response.json();
    },
    enabled: !!debouncedSearchTerm
  });

  const handleVouchConfirm = () => {
    if (authStatus && data?.data?.findFirstEnsName) {
      handleVouch(
        data.data.findFirstEnsName.id,
        user,
        wallets,
        getAccessToken,
        chain,
        schema,
        platform,
        verifyingContract
      );
    } else if (authStatus && isEthAddress) {
      handleVouch(
        searchTerm,
        user,
        wallets,
        getAccessToken,
        chain,
        schema,
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
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg bg-background">
          <p className="p-2 text-sm text-gray-500">Loading...</p>
        </div>
      )}
      {error && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg bg-background">
          <p className="p-2 text-sm text-red-500">Error: {error.message}</p>
        </div>
      )}
      {(data || isEthAddress) && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg bg-background">
          {data?.data?.findFirstEnsName ? (
            <div className="p-2">
              <p 
                className="text-sm cursor-pointer text-primary hover:text-blue-500"
                onClick={() => handleNameClick()}
              >
                {data.data.findFirstEnsName.name}
              </p>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                  {authStatus ? (
                    <UserProfile
                      isOwnProfile={false}
                      recipient={data.data.findFirstEnsName.id}
                      onVouch={handleVouchConfirm}
                      onCancel={() => setIsDialogOpen(false)}
                      graphqlEndpoint={graphql}
                      platform={platform}
                      isAuthenticated={authStatus}
                    />
                  ) : (
                    <>
                      <DialogTitle>Login Required</DialogTitle>
                      <DialogDescription>
                        You need to be logged in to vouch for a user.
                      </DialogDescription>
                      <DialogFooter>
                        <Button onClick={() => { login(); setIsDialogOpen(false); }}>
                          Log In
                        </Button>
                        <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>
                          Cancel
                        </Button>
                      </DialogFooter>
                    </>
                  )}
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
                  {authStatus ? (
                    <UserProfile
                      isOwnProfile={false}
                      recipient={searchTerm}
                      onVouch={handleVouchConfirm}
                      onCancel={() => setIsDialogOpen(false)}
                      graphqlEndpoint={graphql}
                      platform={platform}
                      isAuthenticated={authStatus}
                    />
                  ) : (
                    <>
                      <DialogTitle>Login Required</DialogTitle>
                      <DialogDescription>
                        You need to be logged in to vouch for a user.
                      </DialogDescription>
                      <DialogFooter>
                        <Button onClick={() => { login(); setIsDialogOpen(false); }}>
                          Log In
                        </Button>
                        <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>
                          Cancel
                        </Button>
                      </DialogFooter>
                    </>
                  )}
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