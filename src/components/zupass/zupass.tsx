import { ZuAuthArgs, zuAuthPopup } from "@pcd/zuauth";
import { TicketTypeName } from "./types";
import { whitelistedTickets } from "./zupass-config";
import crypto from "crypto";
import { handleVouch } from "@/utils/zupass/handleAttestation";

async function login(user: any, wallets: any, token: any, setTicketsToSign: React.Dispatch<React.SetStateAction<any[]>>) {

    // Define or retrieve your nonce here
    const nonce = crypto.randomBytes(16).toString("hex");
    // const bigIntNonce = BigInt("0x" + nonce);
    // const watermark = bigIntNonce.toString();

    const watermark = (await (await fetch("/api/zupass/watermark")).json())
        .watermark;
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

    const args: ZuAuthArgs = {
        fieldsToReveal: {
            revealAttendeeEmail: true,
            revealAttendeeName: true,
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
    console.log("🚀 ~ login ~ result:", result);

    if (result && result.type === "multi-pcd" && Array.isArray(result.pcds)) {
        // Prepare the PCDs to send to your endpoint
        console.log(result.pcds)
        const pcds = result.pcds
        //sending PCDs and nonce to your endpoint
        const endpoint = "/api/zupass/auth";
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ nonce, pcds }),
        });

        if (!response.ok) {
            throw new Error(`Failed to send PCDs to endpoint: ${response.status}`);
        }

        console.log("PCDs and nonce sent successfully:", response.status);
        const responseData = await response.json();
        console.log("Response data from server:", responseData);
        
        try {
            if (!responseData.payload || !Array.isArray(responseData.payload.add_groups)) {
                throw new Error("Invalid response data structure");
            }

            const ticketsToSignData = responseData.payload.add_groups.map((ticket: any) => ({
                ...ticket,
                signed: false,
                external_id: responseData.payload.external_id // Add external_id here
            }));
            console.log("Tickets to sign2:", ticketsToSignData);

            setTicketsToSign(ticketsToSignData);
            console.log("setTicketsToSign called successfully");
        } catch (error) {
            console.error("Error processing response data:", error);
        }
    } else {
        console.error("Invalid or missing PCDs in the result from zuAuthPopup");
    }
}

export function useZupass(): {
    login: (user: any, wallets: any, token: any, setTicketsToSign: React.Dispatch<React.SetStateAction<any[]>>) => Promise<void>;
} {
    return { login };
}
