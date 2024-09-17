import { PODPCD, PODPCDPackage, PODPCDTypeName } from "@pcd/pod-pcd";
import { ReactNode, useEffect, useState } from "react";
import { useEmbeddedZupass } from "../utils/hooks/useEmbeddedZupass";
import axios from 'axios';

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

    </div>
  );
}

// Remove styled-components definitions
