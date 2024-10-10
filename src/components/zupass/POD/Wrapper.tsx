import React, { useEffect, useState, useRef } from 'react';
import { connect, Zapp } from "@parcnet-js/app-connector";
import { Button } from "@/components/ui/button"
import * as p from "@parcnet-js/podspec";

interface PODWrapper {
    user: any;
    accessToken: string;
}

const PODWrapper: React.FC<PODWrapper> = ({ user, accessToken }) => {
    const [z, setZ] = useState<any>(null);
    const [podData, setPodData] = useState<any>(null);
    const connectorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const initializeZapp = async () => {
            const myZapp: Zapp = {
                name: "AgoraPass",
                permissions: {
                    REQUEST_PROOF: { collections: ["Stamp"] },
                    SIGN_POD: { collections: ["Stamp"] },
                    READ_POD: { collections: ["Stamp"] },
                    INSERT_POD: { collections: ["Stamp"] },
                    READ_PUBLIC_IDENTIFIERS: {}
                }
            };

            if (connectorRef.current) {
                const clientUrl = "https://zupass.org";

                const zInstance = await connect(myZapp, connectorRef.current, clientUrl);
                setZ(zInstance);
            }
        };

        initializeZapp();
    }, []);

    const queryPOD = async () => {
        if (!z) return;

        try {
            const query = p.pod({
                entries: {
                    zupass_display: { type: "string" },
                    zupass_title: { type: "string" },
                    zupass_image_url: { type: "string" },
                    timestamp: { type: "string" },
                    issuer: { type: "string" },
                    wallet: { type: "string" },
                    AgoraScore: { type: "string" }
                }
            });

            const queryResult = await z.pod.collection("Stamp").query(query);

            console.log("Query result:", queryResult);

            if (queryResult.length > 0) {
                setPodData(queryResult[0]);
                console.log("Existing AgoraPass found:", queryResult[0]);
            } else {
                console.log("No existing AgoraPass found");
            }
        } catch (error) {
            console.error("Error querying POD:", error);
        }
    };

    const createNewPOD = async () => {
        if (!z) return;

        try {
            const commitment = await z.identity.getSemaphoreV4Commitment();
            console.log("commitment", commitment.toString());
            const response = await fetch('/api/zupass/pod/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ commitment: commitment.toString() }),
            });
            
            if (!response.ok) {
                throw new Error('Failed to create POD');
            }

            const pod = await response.json();
            console.log("signedPOD", pod);
            //  await z.pod.collection("Stamp").insert(pod);
            console.log("New AgoraPass created:", pod);
            setPodData(pod);
        } catch (error) {
            console.error("Error creating new POD:", error);
        }
    };

    return (
        <div className="space-y-4">
            <div ref={connectorRef} style={{ width: '0', height: '0', overflow: 'hidden' }}></div>
            <Button onClick={queryPOD}>Check for Existing AgoraPass</Button>
            <Button onClick={createNewPOD}>Create New AgoraPass</Button>
            {podData && (
                <div>
                    <h3 className="text-lg font-semibold">AgoraPass Data:</h3>
                    <pre className="bg-gray-100 p-2 rounded">
                        Holi
                    </pre>
                </div>
            )}
        </div>
    );
};

export default PODWrapper;