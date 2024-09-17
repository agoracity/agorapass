import { PODPCD, PODPCDPackage, PODPCDTypeName } from "@pcd/pod-pcd";
import { PODPCDUI } from "@pcd/pod-pcd-ui";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { useEmbeddedZupass } from "../utils/hooks/useEmbeddedZupass";
import { ZUPASS_URL } from "./Wrapper";
import axios from 'axios';


const PODPCDCard = PODPCDUI.renderCardBody as React.FC<{ pcd: PODPCD }>;
const FOLDER = "AGORATEST";

export function FrogCrypto(): ReactNode {
  const { z, connected } = useEmbeddedZupass();
  const [cooldown, setCooldown] = useState(0);
  const [nonce, setNonce] = useState(() => {
    const storedNonce = localStorage.getItem("frogNonce");
    return storedNonce ? parseInt(storedNonce, 10) : 0;
  });
  const [frogs, setFrogs] = useState<PODPCD[]>([]);
  const [loading, setLoading] = useState(true);

  const FROG_NAMESPACE = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";


  const zupassUrl = useMemo(() => {
    return localStorage.getItem("zupassUrl") || ZUPASS_URL;
  }, []);

  useEffect(() => {
    let timer: number;
    if (cooldown > 0) {
      timer = window.setInterval(() => {
        setCooldown((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  useEffect(() => {
    localStorage.setItem("frogNonce", nonce.toString());
  }, [nonce]);

  useEffect(() => {
    const loadFrogs = async () => {
      if (connected) {
        console.log("loading");
        try {
          const loadedFrogs = await getCurrentPODPCDs(FOLDER);
          setFrogs(loadedFrogs);
        } catch (error) {
          console.error("Error loading frogs:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadFrogs();
  }, [connected]);

  if (!connected) {
    return (
      <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  const getCurrentPODPCDs = async (folder: string): Promise<PODPCD[]> => {
    if (!z || !z.fs) {
      throw new Error("Zupass client not initialized");
    }
    const list = await z.fs.list(folder);
    const pcdIds = list
      .filter((l) => l.type === "pcd" && l.pcdType === PODPCDTypeName)
      .map((l: any) => l.id);
    return Promise.all(
      pcdIds.map(async (id) => {
        if (!z.fs) {
          throw new Error("Zupass client not initialized");
        }
        const s = await z.fs.get(id);
        return PODPCDPackage.deserialize(s.pcd) as unknown as PODPCD;
      })
    );
  };

  const formatCooldown = (seconds: number) => {
    const remainingSeconds = seconds % 60;
    return `${remainingSeconds.toString()}s`;
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={async () => {
          if (!z || !z.fs || !z.identity) {
            console.error("Zupass client not initialized");
            return;
          }
          try {
            const ownerIdentity = await z.identity.getIdentityCommitment();
            
            // Call the server to get the signed POD
            const response = await axios.post('/api/zupass/sign-pod', {
              nonce,
              timestamp: Date.now(),
              owner: ownerIdentity.toString()
            });
            console.log('response.data', response.data)
           

            setFrogs(await getCurrentPODPCDs(FOLDER));
            setCooldown(10);
            setNonce((prevNonce) => {
              const newNonce = prevNonce + 1;
              localStorage.setItem("frogNonce", newNonce.toString());
              return newNonce;
            });
          } catch (error) {
            console.error("Error getting FROG:", error);
            alert("Failed to get FROG. Please try again.");
          }
        }}
        disabled={cooldown > 0}
        className="bg-green-700 font-bold text-white px-4 py-2 rounded disabled:opacity-50 mb-4"
      >
        {cooldown > 0
          ? `Get FROG (wait ${formatCooldown(cooldown)})`
          : "Get FROG"}
      </button>

      <div className="mb-8">
        <button
          onClick={() =>
            window.open(
              `${zupassUrl}/#/?folder=AGORATEST`,
              "_blank",
              "noopener,noreferrer"
            )
          }
          className="font-bold bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
        >
          View in Zupass
        </button>
      </div>

      <div className="flex flex-col items-center gap-3">
        {loading ? (
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
        ) : (
          frogs
            .sort((a, b) => {
              const timestampA = a.claim.entries.timestamp?.value as
                | bigint
                | undefined;
              const timestampB = b.claim.entries.timestamp?.value as
                | bigint
                | undefined;

              if (timestampA && timestampB) {
                return Number(timestampB - timestampA); // Larger timestamp first
              }
              if (timestampA) return -1;
              if (timestampB) return 1;
              return 0;
            })
            .map((pod) => (
              <div key={pod.id} className="bg-white text-gray-800 max-w-md rounded-lg border border-gray-300 p-3">
                <strong>{pod.claim.entries.zupass_title.value}</strong>
                <PODPCDCard pcd={pod} />
              </div>
            ))
        )}
      </div>
    </div>
  );
}

// Remove styled-components definitions
