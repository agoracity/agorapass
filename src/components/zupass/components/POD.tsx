import type { ParcnetAPI } from "@parcnet-js/app-connector";
import { POD } from "@pcd/pod";
import type { ReactNode } from "react";
import { useState } from "react";
import { useParcnetClient } from "@/hooks/zupass/useParcnetClient";
import { Button } from "@/components/ui/button";
import * as p from "@parcnet-js/podspec";

export function PODSection({ wallet, token }: { wallet: string; token: string }): ReactNode {
  const { z, connected } = useParcnetClient();

  return !connected ? null : (
    <div>
        <InsertPOD z={z} wallet={wallet} token={token} />
    </div>
  );
}

function InsertPOD({ z, wallet, token }: { z: ParcnetAPI; wallet: string; token: string }): ReactNode {
  const [pod, setPod] = useState<POD | null>(null);
  const [insertionState, setInsertionState] = useState<'none' | 'success' | 'failure'>('none');

  const generatePOD = async () => {
    const owner = (await z.identity.getSemaphoreV4Commitment()).toString();
    console.log('owner', owner);
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_STAMP_API_URL + '/pod/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-privy-app-id': 'agora',
        },
        body: JSON.stringify({ owner, wallet })
      });
      const serializedPOD = await response.text();
      
      // Use POD.deserialize to convert the serialized string to a POD object
      const podObject = POD.deserialize(serializedPOD);
      console.log('Deserialized POD:', podObject);
      const query = p.pod({
        entries: {
          issuer: {
            type: "string",
            equalsEntry: "Stamp"
          }
        }
      });
      const pods = await z.pod.query(query);
      console.log('pods', pods);
      setPod(podObject);
    } catch (error) {
      console.error('Error generating or deserializing POD:', error);
    }
  };

  const savePODToZupass = async () => {
    if (!pod) return;
    try {
      console.log('pod', pod);
      //@ts-expect-error Lib under development
      await z.pod.insert(pod);

    setInsertionState('success');
  } catch (error) {
      console.error('Error inserting POD:', error);
      setInsertionState('failure');
    }
  };

  return (
    <div>
      <Button onClick={generatePOD} variant="default">Generate POD</Button>
      
      {pod && (
        <Button onClick={savePODToZupass} variant="default">Save to Zupass</Button>
      )}

      {insertionState !== 'none' && (
        <div className="my-2">
          {insertionState === 'success' && (
            <div>POD inserted successfully!</div>
          )}
          {insertionState === 'failure' && (
            <div>An error occurred while inserting your POD.</div>
          )}
        </div>
      )}
    </div>
  );
}
