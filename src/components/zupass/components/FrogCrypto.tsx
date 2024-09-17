import { ReactNode } from "react";
import { useEmbeddedZupass } from "../utils/hooks/useEmbeddedZupass";
import axios from 'axios';

export function FrogCrypto(): ReactNode {
  const { z } = useEmbeddedZupass();

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={async () => {
          if (!z) {
            console.error("Zupass client not initialized");
            return;
          }
          try {
            // TODO: Check with Richard about the type error for z.identity
            // @ts-expect-error Temporarily ignoring type error
            const ownerIdentity = await z.identity.getIdentityCommitment();
            
            // Call the server to get the signed POD
            const response = await axios.post('/api/zupass/sign-pod', {
              timestamp: Date.now(),
              owner: ownerIdentity.toString()
            });
            // Open a new window with the response data URL
            if (response.data && typeof response.data === 'string') {
              window.open(response.data, '_blank', 'noopener,noreferrer');
            } else {
              console.error('Invalid response data:', response.data);
              alert('Failed to get a valid FROG URL. Please try again.');
            }
            console.log('response.data', response.data);

            // You can add any additional logic here to handle the response
          } catch (error) {
            console.error("Error getting FROG:", error);
            alert("Failed to get FROG. Please try again.");
          }
        }}
        className="bg-green-700 font-bold text-white px-4 py-2 rounded mb-4"
      >
        Get FROG
      </button>
    </div>
  );
}

// Remove styled-components definitions
