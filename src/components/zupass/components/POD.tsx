import { ReactNode, useState } from "react";
import { useEmbeddedZupass } from "../utils/hooks/useEmbeddedZupass";
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { openZupassPopupUrl } from "@pcd/passport-interface";

interface PODCryptoProps {
  wallet: string;
}

export function PODCrypto({ wallet }: PODCryptoProps): ReactNode {
  const { z, connected } = useEmbeddedZupass();
  const [isLoading, setIsLoading] = useState(false);
  const [PODUrl, setPODUrl] = useState<string | null>(null);

  const handleGetPOD = async () => {
    if (!z) {
      console.error("Zupass client not initialized");
      return;
    }
    setIsLoading(true);
    try {
      // @ts-expect-error Temporarily ignoring type error
      const ownerIdentity = await z.identity.getIdentityCommitment();
      
      const response = await axios.post('/api/zupass/sign-pod', {
        timestamp: Date.now(),
        owner: ownerIdentity.toString(),
        wallet: wallet
      });

      if (response.data && typeof response.data === 'string') {
        setPODUrl(response.data);
      } else {
        console.error('Invalid response data:', response.data);
        alert('Failed to get a valid POD URL. Please try again.');
      }
    } catch (error) {
      console.error("Error getting POD:", error);
      alert("Failed to get POD. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToZupass = () => {
    if (PODUrl) {
      openZupassPopupUrl(PODUrl);
    }
  };

  return (
    <div className="flex flex-col items-center">
      {connected ? (
        PODUrl ? (
          <Button
            onClick={handleAddToZupass}
            className="mb-4 bg-accentdark hover:bg-accentdarker text-zupass font-semibold font-[arial]"
          >
            Add to Zupass
          </Button>
        ) : (
          <Button
            onClick={handleGetPOD}
            disabled={isLoading}
            className="mb-4 bg-accentdark hover:bg- text-zupass font-semibold font-[arial]"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating AgoraPass...
              </>
            ) : (
              "Generate AgoraPass"
            )}
          </Button>
        )
      ) : (
        "Connecting..."
      )}
    </div>
  );
}