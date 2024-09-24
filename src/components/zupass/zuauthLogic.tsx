import { useState } from 'react';
import { zuAuthPopup, ZuAuthArgs } from "@pcd/zuauth";
import { whitelistedTickets } from "./zupass-config";
import { TicketTypeName } from "./types";
import { usePrivy } from '@privy-io/react-auth';

const watermark = "0";

// Ensure the tickets are formatted correctly
const config = Object.entries(whitelistedTickets).flatMap(
    ([ticketType, tickets]) =>
        tickets
            .map((ticket) => {
                if (ticket.eventId && ticket.productId) {
                    return {
                        pcdType: ticket.pcdType,
                        ticketType: ticketType as TicketTypeName,
                        eventId: ticket.eventId,
                        productId: ticket.productId,
                        eventName: ticket.eventName || "",
                        productName: ticket.productName || "",
                        publicKey: ticket.publicKey
                    };
                }
                console.error("Invalid ticket format:", ticket);
                return null;
            })
            .filter(
                (ticket): ticket is NonNullable<typeof ticket> => ticket !== null
            )
);

export const useZuAuth = (user: any) => {
    const { getAccessToken } = usePrivy(); // Add this line
    const [result, setResult] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [apiResponse, setApiResponse] = useState<any>(null);

    const handleZuAuth = async () => {
        setIsLoading(true);

        try {
            const args: ZuAuthArgs = {
                fieldsToReveal: {
                    revealAttendeeEmail: true,
                    revealEventId: true,
                    revealProductId: true,
                    revealAttendeeSemaphoreId: true,
                    revealTicketCategory: true
                },
                returnUrl: window.location.origin,
                watermark,
                config,
                proofTitle: "Connect with Zupass",
                proofDescription: "**Connect your Zupass to Agora Pass**",
                multi: true
            };

            const result = await zuAuthPopup(args);
            console.log("Local result:", result);
            setResult(result);
        } catch (error) {
            console.error("ZuAuth error:", error);
            setResult(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSign = async (pcd: any) => {
        try {
            const token = await getAccessToken(); 
            const response = await fetch(process.env.NEXT_PUBLIC_STAMP_API_URL + '/pcds', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'x-privy-app-id': 'agora',
                },
                body: JSON.stringify({ 
                    pcds: pcd,
                    user: user
                }),
            });

            const responseBody = await response.json();
            console.log("API response:", responseBody);
            if (!response.ok || responseBody.error) {
                if (responseBody.status === 550) {
                    throw new Error("You have no vouches available.");
                } else if (responseBody.status === 400) {
                    throw new Error("You can't vouch yourself.");
                } else if (responseBody.status === 500) {
                    throw new Error("Internal server error. Please try again later.");
                } else {
                    // Throw a general error for other status codes
                    throw new Error(`Error creating attestation: ${responseBody.error || response.statusText}`);
                }
            }

            setApiResponse(responseBody);
            console.log("API response:", responseBody);
        } catch (error) {
            console.error("Sign error:", error);
            setApiResponse({ error: error instanceof Error ? error.message : String(error) });
            throw error;
        }
    };

    return { handleZuAuth, isLoading, result, apiResponse, handleSign };
};