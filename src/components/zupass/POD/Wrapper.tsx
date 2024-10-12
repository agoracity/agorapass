import React, { useState, useRef } from 'react';
import { connect, Zapp } from "@parcnet-js/app-connector";
import { Button } from "@/components/ui/button"
import * as p from "@parcnet-js/podspec";
import { showLoadingAlert, showErrorAlert, showSuccessAlertWithoutRedirect } from "@/utils/alertUtils";

interface PODWrapper {
    user: any;
    accessToken: string;
}

const PODWrapper: React.FC<PODWrapper> = ({ user, accessToken }) => {
    const [z, setZ] = useState<any>(null);
    const [isInitializing, setIsInitializing] = useState(false);
    const connectorRef = useRef<HTMLDivElement>(null);

    const initializeZapp = async () => {
        setIsInitializing(true);
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
            try {
                const zInstance = await connect(myZapp, connectorRef.current, clientUrl);
                setZ(zInstance);
            } catch (error) {
                console.error("Error initializing Zapp:", error);
                showErrorAlert('Failed to connect to Zupass');
            } finally {
                setIsInitializing(false);
            }
        }
    };

    const generateAgoraPass = async () => {
        if (!z) return;

        try {
            showLoadingAlert();

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
            console.log("queryResult", queryResult);
            if (queryResult.length > 0) {
                showSuccessAlertWithoutRedirect('An AgoraPass already exists in your account', 'OK');
            } else {
                await createNewPOD();
            }
        } catch (error) {
            console.error("Error generating AgoraPass:", error);
            showErrorAlert('Failed to generate AgoraPass');
        }
    };

    const createNewPOD = async () => {
        try {
            showLoadingAlert();

            const commitment = await z.identity.getSemaphoreV4Commitment();
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
            await z.pod.collection("Stamp").insert(pod);
            showSuccessAlertWithoutRedirect('New AgoraPass created successfully', 'OK');
        } catch (error) {
            console.error("Error creating new POD:", error);
            showErrorAlert('Failed to create new AgoraPass');
        }
    };

    return (
        <div className="space-y-4">
            <div ref={connectorRef} style={{ width: '0', height: '0', overflow: 'hidden' }}></div>
            {!z && !isInitializing && (
                <Button onClick={initializeZapp}>Connect Zupass</Button>
            )}
            {isInitializing && <div>Initializing Zupass...</div>}
            {z && (
                <Button onClick={generateAgoraPass}>Generate AgoraPass</Button>
            )}
        </div>
    );
};

export default PODWrapper;