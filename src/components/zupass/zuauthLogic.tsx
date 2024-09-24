import { useState } from 'react';
import { zuAuthPopup, ZuAuthArgs } from "@pcd/zuauth";
import { usePrivy } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import { EAS_CONFIG } from '@/config/siteConfig';
import fetchNonce from './utils/fetchNonce';
import { signTypedData } from '@/utils/signTypedData'; 
import { SchemaEncoder } from '@ethereum-attestation-service/eas-sdk';
import { whitelistedTickets, matchTicketToType } from "./zupass-config"; 
import { TicketTypeName } from "./types";
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
            const nonce= await fetchNonce(recipient, token);
            console.log('nonce', nonce)
            // Define the typed data for signing
            const schemaEncoder = new SchemaEncoder(
                'bytes32 nullifier, bytes32 category, bytes32 subcategory, bytes32 issuer, bytes32 credentialType, bytes32 platform'
              );
              const { claim } = pcd;
              const {  eventId, productId, attendeeSemaphoreId } = claim.partialTicket;
              const ticketType = matchTicketToType(eventId, productId);
              if (!ticketType) {
                console.log('Failed to match ticket type');
                throw new Error("Unable to determine ticket type.");
              }
              // Calculate the nullifier
              const nullifier = ethers.hexlify(
                  ethers.keccak256(
                      ethers.concat([
                          ethers.toUtf8Bytes(attendeeSemaphoreId),
                          ethers.keccak256(ethers.toUtf8Bytes(productId))
                      ])
                  ).slice(0, 66)
              );
              console.log('attendeeSemaphoreId', attendeeSemaphoreId)
              console.log('productId', productId)
              console.log('nullifier', nullifier)
              const encodedData = schemaEncoder.encodeData([
                { name: 'nullifier', value: nullifier, type: 'bytes32' }, 
                { name: 'category', value: ethers.encodeBytes32String(EAS_CONFIG.CATEGORY), type: 'bytes32' },
                { name: 'subcategory', value: ethers.encodeBytes32String(ticketType), type: 'bytes32' },
                { name: 'issuer', value: ethers.encodeBytes32String(EAS_CONFIG.ISSUER), type: 'bytes32' },
                { name: 'credentialType', value: ethers.encodeBytes32String(EAS_CONFIG.CREDENTIAL_TYPE), type: 'bytes32' },
                { name: 'platform', value: ethers.encodeBytes32String(EAS_CONFIG.PLATFORM), type: 'bytes32' },
              ]);
              const domain = {
                name: 'EAS',
                version: '1.2.0',
                chainId: EAS_CONFIG.CHAIN_ID,
                verifyingContract: EAS_CONFIG.EAS_CONTRACT_ADDRESS
            };
              const value = {
                schema: EAS_CONFIG.PRETRUST_SCHEMA,
                recipient: recipient,
                expirationTime: 0,
                revocable: true,
                refUID: '0x0000000000000000000000000000000000000000000000000000000000000000',
                data: encodedData,
                deadline: 0,
                value: 0,
                nonce: nonce
            };
            const types = {
                Attest: [
                    { name: 'schema', type: 'bytes32' },
                    { name: 'recipient', type: 'address' },
                    { name: 'expirationTime', type: 'uint64' },
                    { name: 'revocable', type: 'bool' },
                    { name: 'refUID', type: 'bytes32' },
                    { name: 'data', type: 'bytes' },
                    { name: 'value', type: 'uint256' },
                    { name: 'nonce', type: 'uint256' },
                    { name: 'deadline', type: 'uint64' }
                ]
            };
            const typedData = {
                types: types,
                domain: domain,
                primaryType: 'Attest',
                message: value,
            };
            console.log('user.wallet.address', user.wallet.address)
            console.log('user', user)
            // Prompt the user to sign the typed data
            const signature = await signTypedData(user, wallets, EAS_CONFIG.CHAIN_ID, typedData);

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
                    signature: signature
                }),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setApiResponse(data);
            console.log("API response:", data);
        } catch (error) {
            console.error("Sign error:", error);
            setApiResponse({ error: error instanceof Error ? error.message : String(error) });
        }
    };

    return { handleZuAuth, isLoading, result, apiResponse, handleSign };
};