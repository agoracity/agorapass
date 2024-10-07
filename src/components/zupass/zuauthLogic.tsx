import { useState } from 'react';
import { zuAuthPopup, ZuAuthArgs } from "@pcd/zuauth";
import { usePrivy } from '@privy-io/react-auth';
import { whitelistedTickets } from "./zupass-config"; 
import { TicketTypeName } from "./types";


const watermark = "0";

// Ensure the tickets are formatted correctly
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
console.log("config", config);
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
                proofDescription: "Connect your Zupass to AgoraPass",
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

    const handleSign = async (pcd: any, wallets: any, user: any) => {
        try {
            const token = await getAccessToken(); 
            const recipient = user.wallet.address;
            if (!recipient) {
                throw new Error("User wallet address is null");
            }
            if (!token) {
                throw new Error("Token is null, please login again");
            }
            const response = await fetch(process.env.NEXT_PUBLIC_STAMP_API_URL + '/pcds', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'x-privy-app-id': 'agora',
                },
                body: JSON.stringify({ 
                    pcds: pcd,
                    user: user,
                }),
            });
            const data = await response.json();

            if (!response.ok) {
                setApiResponse(data); // Set the entire response object
                console.error("API error:", data);
                return; // Exit the function early
            }
            
            setApiResponse(data);
            console.log("API response:", data);
        } catch (error) {
            console.error("Sign error:", error);
            setApiResponse({ error: error instanceof Error ? error.message : String(error) });
        }
    };

    return { handleZuAuth, isLoading, result, apiResponse, handleSign };
};