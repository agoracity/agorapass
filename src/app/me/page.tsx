"use client";
import dynamic from 'next/dynamic';
import { useEffect, useState } from "react";
import { usePrivy } from '@privy-io/react-auth';
import { useFetchUser } from '@/hooks/useFetchUser';
import Link from "next/link";
import { useQuery } from '@tanstack/react-query';
import Loader from "@/components/ui/Loader";

// Dynamically import components
const ProfileCard = dynamic(() => import("@/components/ui/users/ProfileCard").then(mod => mod.ProfileCard), { 
  loading: () => <div>Loading...</div>
});
const VouchesList = dynamic(() => import("@/components/ui/users/VouchesList").then(mod => mod.VouchesList), { 
  loading: () => <div>Loading...</div>
});

// Import types and schemas separately
import type { FormSchema } from "@/components/ui/users/ProfileCard";

// Move this to a separate file and import it
import { LastThreeAttestations } from "@/lib/fetchers/attestations";

export default function Page() {
  const { getAccessToken } = usePrivy();
  const [updateTrigger, setUpdateTrigger] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const { data, isLoading, error } = useFetchUser(updateTrigger);
  // Define schemaId and address to be used in the query
  const schemaId = process.env.NEXT_PUBLIC_SCHEMA_ID || "0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9"; // Replace with your schemaId
  const attester = data?.wallet;

  // Define the query for last three attestations
  const { data: vouches, error: receivedError, isLoading: receivedLoading } = useQuery({
    queryKey: ['lastThreeAttestations', schemaId, attester],
    queryFn: () => LastThreeAttestations(schemaId, attester),
    enabled: !!attester, // Ensure the query only runs if attester is defined
  });

  // Effect to handle loading state for last three attestations
  useEffect(() => {
    if (!receivedLoading && !isLoading) {
      setInitialLoading(false);
    }
  }, [receivedLoading, isLoading]);
  // Use the custom hook for profile update
  const { handleSubmit } = useProfileUpdate(() => getAccessToken().then(token => {
    if (!token) throw new Error('No access token');
    return token;
  }), setUpdateTrigger);

  if (initialLoading) return <div className="w-screen flex items-center justify-center"><Loader /></div>;

  // Handle errors
  if (error) return <p>Error loading profile: {error.message}</p>;
  if (!data) return <p>User not found</p>;
  if (receivedError) return <p>Error loading attestations: {receivedError.message}</p>;

  // Render the content once data is loaded
  return (
    <div className="p-6 bg-gray-100 w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <ProfileCard
            data={data}
            onSubmit={handleSubmit}
          />
        </div>
        <div className="md:col-span-2 space-y-4">
          {vouches && vouches.length > 0 ? (
            <VouchesList vouches={vouches} />
          ) : (
            <p>No recent vouches found.</p>
          )}

          <div className="mt-4">
            <Link href={'/address/' + data?.wallet} className="w-full flex">
              <button className="px-4 py-2 w-full font-bold rounded-md border border-black bg-white text-black text-sm hover:shadow-[4px_4px_0px_0px_rgba(0,0,0)] transition duration-200">
                Check all your vouches
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Custom hook for profile update
function useProfileUpdate(getAccessToken: () => Promise<string>, setUpdateTrigger: React.Dispatch<React.SetStateAction<boolean>>) {
  return {
    handleSubmit: async (formData: { username: string; avatarType: "metamask" | "blockies"; bio?: string }) => {
      const { username, bio = "", avatarType } = formData;
      const token = await getAccessToken();

      if (!token) {
        console.error('Authorization token is missing');
        return;
      }

      try {
        const response = await fetch('/api/user', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token,
          },
          body: JSON.stringify({ name: username, bio: bio, avatarType }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error updating user:', errorData);
        } else {
          setUpdateTrigger(prev => !prev);
        }
      } catch (error) {
        console.error('Error updating user:', error);
      }
    }
  };
}
